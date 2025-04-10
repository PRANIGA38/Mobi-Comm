package com.springboot.mobicomm.service;

import com.razorpay.Order;
import com.razorpay.RazorpayClient;
import com.razorpay.RazorpayException;
import com.springboot.mobicomm.entity.*;
import com.springboot.mobicomm.repository.*;
import org.json.JSONObject;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.annotation.PostConstruct;
import java.time.LocalDate;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@Service
public class TransactionService {

    private static final Logger logger = LoggerFactory.getLogger(TransactionService.class);

    @Value("${razorpay.key_id}")
    private String rzpKeyId;

    @Value("${razorpay.key_secret}")
    private String rzpKeySecret;

    @Value("${rzp.currency:INR}")
    private String rzpCurrency;

    @Value("${rzp.company.name:Mobi-Comm}")
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
            if (rzpKeyId == null || rzpKeyId.isEmpty() || rzpKeySecret == null || rzpKeySecret.isEmpty()) {
                throw new IllegalStateException("Razorpay key_id or key_secret is not configured");
            }
            razorpayClient = new RazorpayClient(rzpKeyId, rzpKeySecret);
            logger.info("Razorpay client initialized successfully with key_id: {}", rzpKeyId);
        } catch (RazorpayException e) {
            logger.error("Failed to initialize Razorpay client: {}", e.getMessage());
            throw new RuntimeException("Razorpay initialization failed: " + e.getMessage());
        }
    }

    public Map<String, Object> saveTransaction(Transaction transaction, String paymentMethodId) {
        logger.info("Received transaction: amount={}, transactionType={}, paymentMethod={}, accountDetail={}",
                transaction.getAmount(), transaction.getTransactionType(), transaction.getPaymentMethod(), transaction.getAccountDetail());

        if (transaction.getUser() == null || transaction.getUser().getMobileNumber() == null) {
            logger.error("Mobile number is required in the transaction");
            throw new IllegalArgumentException("Mobile number is required");
        }

        String mobileNumber = transaction.getUser().getMobileNumber();
        logger.info("Looking up user with mobile number: {}", mobileNumber);

        Optional<Recharge> userOptional = rechargeRepository.findByMobileNumber(mobileNumber);
        if (userOptional.isEmpty()) {
            logger.error("User not found with mobile number: {}", mobileNumber);
            throw new IllegalArgumentException("User not found with mobile number: " + mobileNumber);
        }

        Recharge user = userOptional.get();
        logger.info("Found user with mobile number: {}", mobileNumber);

        transaction.setUser(user);
        transaction.setType("CREDIT");
        transaction.setDate(LocalDate.now());

        if (transaction.getTransactionType() == null) {
            logger.error("Transaction type is required");
            throw new IllegalArgumentException("Transaction type is required");
        }

        transaction.ensurePaymentMethod();
        logger.info("Transaction after setting paymentMethod: amount={}, transactionType={}, paymentMethod={}",
                transaction.getAmount(), transaction.getTransactionType(), transaction.getPaymentMethod());

        Map<String, Object> response = new HashMap<>();

        try {
            logger.info("Processing Razorpay payment for amount: {}", transaction.getAmount());

            JSONObject orderRequest = new JSONObject();
            orderRequest.put("amount", (long) (transaction.getAmount() * 100)); // Amount in paise
            orderRequest.put("currency", rzpCurrency);
            orderRequest.put("receipt", "receipt_" + System.currentTimeMillis());
            orderRequest.put("notes", new JSONObject().put("payment_method", transaction.getPaymentMethod()));

            Order order = razorpayClient.orders.create(orderRequest);
            logger.info("Razorpay order response: {}", order.toJson());
            String orderId = order.get("id");
            transaction.setOrderId(orderId);

            // Include session token if available (check Razorpay API docs)
            String sessionToken = order.toJson().has("session_token") ? order.toJson().getString("session_token") : null;
            response.put("status", "succeeded");
            response.put("orderId", orderId);
            if (sessionToken != null) {
                response.put("sessionToken", sessionToken);
            }
        } catch (RazorpayException e) {
            logger.error("Razorpay payment failed: {}", e.getMessage(), e);
            throw new RuntimeException("Payment failed: " + e.getMessage());
        }

        Optional<Plan> planOptional = planRepository.findByPrice(transaction.getAmount());
        if (planOptional.isEmpty()) {
            logger.error("Plan not found for amount: {}", transaction.getAmount());
            throw new IllegalArgumentException("Plan not found for amount: " + transaction.getAmount());
        }

        Plan plan = planOptional.get();

        Transaction savedTransaction = transactionRepository.save(transaction);
        logger.info("Saved transaction with ID: {}", savedTransaction.getId());

        RechargeHistory rechargeHistory = new RechargeHistory(
                user, plan.getName(), savedTransaction.getDate(), savedTransaction.getAmount(),
                savedTransaction.getPaymentMethod(), "SUCCESS");
        rechargeHistoryRepository.save(rechargeHistory);
        logger.info("Saved recharge history with user: {}", user.getMobileNumber());

        Optional<UserPlan> existingUserPlan = userPlanRepository.findByUserAndIsActiveTrue(user);
        existingUserPlan.ifPresent(userPlan -> {
            userPlan.setIsActive(false);
            userPlanRepository.save(userPlan);
        });

        UserPlan userPlan = new UserPlan();
        userPlan.setUser(user);
        userPlan.setPlan(plan);
        userPlan.setRechargeDate(savedTransaction.getDate());
        userPlan.setExpirationDate(savedTransaction.getDate().plusDays(plan.getValidity()));
        userPlan.setIsActive(true);
        userPlanRepository.save(userPlan);
        logger.info("Saved user plan with user: {}", user.getMobileNumber());

        user.setCurrentPlan(plan.getName());
        user.setPlanExpiryDate(savedTransaction.getDate().plusDays(plan.getValidity()));
        rechargeRepository.save(user);
        logger.info("Updated user with currentPlan: {} and planExpiryDate: {}", user.getCurrentPlan(), user.getPlanExpiryDate());

        return response;
    }
}