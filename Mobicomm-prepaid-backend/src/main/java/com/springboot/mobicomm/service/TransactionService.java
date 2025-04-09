package com.springboot.mobicomm.service;

import com.razorpay.Order;
import com.razorpay.RazorpayClient;
import com.razorpay.RazorpayException;
import com.springboot.mobicomm.entity.Plan;
import com.springboot.mobicomm.entity.Recharge;
import com.springboot.mobicomm.entity.RechargeHistory;
import com.springboot.mobicomm.entity.Transaction;
import com.springboot.mobicomm.entity.UserPlan;
import com.springboot.mobicomm.repository.PlanRepository;
import com.springboot.mobicomm.repository.RechargeHistoryRepository;
import com.springboot.mobicomm.repository.RechargeRepository;
import com.springboot.mobicomm.repository.TransactionRepository;
import com.springboot.mobicomm.repository.UserPlanRepository;

import jakarta.annotation.PostConstruct;

import org.json.JSONObject;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@Service
public class TransactionService {

    private static final Logger logger = LoggerFactory.getLogger(TransactionService.class);

    @Value("${rzp.key.id}")
    private String rzpKeyId;

    @Value("${rzp.key.secret}")
    private String rzpKeySecret;

    @Value("${rzp.currency}")
    private String rzpCurrency;

    @Value("${rzp.company.name}")
    private String rzpCompanyName;

    @Autowired
    private TransactionRepository transactionRepository;

    @Autowired
    private RechargeRepository rechargeRepository;

    @Autowired
    private PlanRepository planRepository;

    @Autowired
    private RechargeHistoryRepository rechargeHistoryRepository;

    @Autowired
    private UserPlanRepository userPlanRepository;

    private RazorpayClient razorpayClient;

    @PostConstruct
    public void init() {
        try {
            razorpayClient = new RazorpayClient(rzpKeyId, rzpKeySecret);
        } catch (RazorpayException e) {
            logger.error("Failed to initialize Razorpay client: {}", e.getMessage());
            throw new RuntimeException("Razorpay initialization failed: " + e.getMessage());
        }
    }

    public Map<String, Object> saveTransaction(Transaction transaction, String paymentMethodId) {
        logger.info("Received transaction: {}, paymentMethodId: {}", transaction, paymentMethodId);

        // Extract mobileNumber from the user object
        if (transaction.getUser() == null || transaction.getUser().getMobileNumber() == null) {
            logger.error("Mobile number is required in the transaction: {}", transaction);
            throw new IllegalArgumentException("Mobile number is required");
        }

        String mobileNumber = transaction.getUser().getMobileNumber();
        logger.info("Looking up user with mobile number: {}", mobileNumber);

        // Find the user by mobile number
        Optional<Recharge> userOptional = rechargeRepository.findByMobileNumber(mobileNumber);
        if (userOptional.isEmpty()) {
            logger.error("User not found with mobile number: {}", mobileNumber);
            throw new IllegalArgumentException("User not found with mobile number: " + mobileNumber);
        }

        Recharge user = userOptional.get();
        logger.info("Found user: {}", user);

        // Set the user and other computed fields
        transaction.setUser(user);
        transaction.setType("CREDIT");
        transaction.setDate(LocalDate.now());

        // Ensure transactionType is set
        if (transaction.getTransactionType() == null) {
            logger.error("Transaction type is required in the transaction: {}", transaction);
            throw new IllegalArgumentException("Transaction type is required");
        }

        // Ensure paymentMethod is set
        transaction.ensurePaymentMethod();
        logger.info("Transaction after setting paymentMethod: {}", transaction);

        // Prepare response map
        Map<String, Object> response = new HashMap<>();

        // Process Razorpay payment for "Card Payment"
        if ("Card Payment".equals(transaction.getTransactionType()) && paymentMethodId != null) {
            try {
                logger.info("Processing Razorpay payment for amount: {}", transaction.getAmount());

                // Create a Razorpay order
                JSONObject orderRequest = new JSONObject();
                orderRequest.put("amount", (long) (transaction.getAmount() * 100)); // Amount in paise (smallest unit)
                orderRequest.put("currency", rzpCurrency);
                orderRequest.put("receipt", "receipt_" + System.currentTimeMillis()); // Unique receipt ID
                orderRequest.put("notes", new JSONObject().put("company", rzpCompanyName));

                Order order = razorpayClient.orders.create(orderRequest);
                String orderId = order.get("id");
                logger.info("Razorpay order created: Order ID: {}", orderId);

                // Simulate successful payment for dummy testing (no actual payment capture needed in test mode)
                response.put("status", "succeeded");
                response.put("orderId", orderId);
                response.put("transaction", transaction);
            } catch (RazorpayException e) {
                logger.error("Razorpay payment failed: {}", e.getMessage(), e);
                throw new RuntimeException("Payment failed: " + e.getMessage());
            }
        }

        // Fetch the plan based on the transaction amount
        Optional<Plan> planOptional = planRepository.findByPrice(transaction.getAmount());
        if (planOptional.isEmpty()) {
            logger.error("Plan not found for amount: {}", transaction.getAmount());
            throw new IllegalArgumentException("Plan not found for amount: " + transaction.getAmount());
        }

        Plan plan = planOptional.get();

        // Save the transaction
        Transaction savedTransaction = transactionRepository.save(transaction);
        logger.info("Saved transaction: {}", savedTransaction);

        // Create and save a new entry in recharge_history
        RechargeHistory rechargeHistory = new RechargeHistory(
                user,
                plan.getName(),
                savedTransaction.getDate(),
                savedTransaction.getAmount(),
                savedTransaction.getPaymentMethod(),
                "SUCCESS");
        rechargeHistoryRepository.save(rechargeHistory);
        logger.info("Saved recharge history: {}", rechargeHistory);

        // Deactivate any existing active user plan
        Optional<UserPlan> existingUserPlan = userPlanRepository.findByUserAndIsActiveTrue(user);
        existingUserPlan.ifPresent(userPlan -> {
            userPlan.setIsActive(false);
            userPlanRepository.save(userPlan);
        });

        // Create a new entry in user_plans
        UserPlan userPlan = new UserPlan();
        userPlan.setUser(user);
        userPlan.setPlan(plan);
        userPlan.setRechargeDate(savedTransaction.getDate());
        userPlan.setExpirationDate(savedTransaction.getDate().plusDays(plan.getValidity()));
        userPlan.setIsActive(true);
        userPlanRepository.save(userPlan);
        logger.info("Saved user plan: {}", userPlan);

        // Update the user's current_plan and plan_expiry_date in the users table
        user.setCurrentPlan(plan.getName());
        user.setPlanExpiryDate(savedTransaction.getDate().plusDays(plan.getValidity()));
        rechargeRepository.save(user);
        logger.info("Updated user with currentPlan: {} and planExpiryDate: {}", user.getCurrentPlan(), user.getPlanExpiryDate());

        return response;
    }
}