package com.springboot.mobi_comm.service;

import com.springboot.mobi_comm.entity.Plan;
import com.springboot.mobi_comm.entity.Recharge;
import com.springboot.mobi_comm.entity.RechargeHistory;
import com.springboot.mobi_comm.entity.Transaction;
import com.springboot.mobi_comm.entity.UserPlan;
import com.springboot.mobi_comm.repository.PlanRepository;
import com.springboot.mobi_comm.repository.RechargeHistoryRepository;
import com.springboot.mobi_comm.repository.RechargeRepository;
import com.springboot.mobi_comm.repository.TransactionRepository;
import com.springboot.mobi_comm.repository.UserPlanRepository;
import com.stripe.exception.StripeException;
import com.stripe.model.PaymentIntent;
import com.stripe.model.PaymentMethod;
import com.stripe.param.PaymentIntentCreateParams;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.Optional;

@Service
public class TransactionService {

    private static final Logger logger = LoggerFactory.getLogger(TransactionService.class);

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

    public Transaction saveTransaction(Transaction transaction, String paymentMethodId) throws StripeException {
        logger.info("Received transaction: {}", transaction);

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

        // Process payment with Stripe if it's a card payment
        if ("Card Payment".equals(transaction.getTransactionType()) && paymentMethodId != null) {
            logger.info("Creating Stripe PaymentIntent for amount: {}", transaction.getAmount());
            PaymentIntentCreateParams params = PaymentIntentCreateParams.builder()
                    .setAmount((long) (transaction.getAmount() * 100)) // Amount in cents
                    .setCurrency("inr")
                    .setPaymentMethod(paymentMethodId)
                    // Do NOT setConfirm(true) here; let the frontend confirm
                    .setAutomaticPaymentMethods(
                            PaymentIntentCreateParams.AutomaticPaymentMethods.builder()
                                    .setEnabled(true)
                                    .setAllowRedirects(PaymentIntentCreateParams.AutomaticPaymentMethods.AllowRedirects.NEVER) // Disable redirects
                                    .build()
                    )
                    .build();

            PaymentIntent paymentIntent = PaymentIntent.create(params);
            logger.info("Created PaymentIntent: {}", paymentIntent.getId());

            // Fetch the PaymentMethod directly to get card details
            PaymentMethod paymentMethod = PaymentMethod.retrieve(paymentMethodId);
            if (paymentMethod.getCard() != null) {
                transaction.setAccountDetail("**** **** **** " + paymentMethod.getCard().getLast4());
            } else {
                logger.warn("PaymentMethod does not have card details for paymentMethodId: {}", paymentMethodId);
                transaction.setAccountDetail("**** **** **** Unknown");
            }

            transaction.setClientSecret(paymentIntent.getClientSecret()); // Set the client secret to return to frontend
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

        return savedTransaction;
    }
}