package com.springboot.mobicomm.controller;

import com.springboot.mobicomm.entity.*;
import com.springboot.mobicomm.repository.OfferRepository;
import com.springboot.mobicomm.repository.PlanRepository;
import com.springboot.mobicomm.repository.RechargeHistoryRepository;
import com.springboot.mobicomm.repository.RechargeRepository;
import com.springboot.mobicomm.repository.TransactionRepository;
import com.springboot.mobicomm.repository.UserPlanRepository;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/users")
public class UserController {

    @Autowired
    private RechargeRepository rechargeRepository;

    @Autowired
    private PlanRepository planRepository;

    @Autowired
    private TransactionRepository transactionRepository;

    @Autowired
    private OfferRepository offerRepository;

    @Autowired
    private UserPlanRepository userPlanRepository;

    @Autowired
    private RechargeHistoryRepository rechargeHistoryRepository;

    @GetMapping("/profile")
    public ResponseEntity<Recharge> getUserProfile() {
        String mobileNumber = SecurityContextHolder.getContext().getAuthentication().getName();
        Recharge user = rechargeRepository.findByMobileNumber(mobileNumber)
                .orElseThrow(() -> new RuntimeException("User not found"));
        return ResponseEntity.ok(user);
    }

    @PutMapping("/update-profile")
    public ResponseEntity<Recharge> updateUserProfile(@RequestBody Recharge updatedUser) {
        String mobileNumber = SecurityContextHolder.getContext().getAuthentication().getName();
        Recharge user = rechargeRepository.findByMobileNumber(mobileNumber)
                .orElseThrow(() -> new RuntimeException("User not found"));

        user.setAlternativeMobileNumber(updatedUser.getAlternativeMobileNumber());
        user.setEmail(updatedUser.getEmail());
        user.setAddress(updatedUser.getAddress());

        Recharge savedUser = rechargeRepository.save(user);
        return ResponseEntity.ok(savedUser);
    }

    @GetMapping("/current-plan")
    public ResponseEntity<?> getCurrentPlan() {
        String mobileNumber = SecurityContextHolder.getContext().getAuthentication().getName();
        Recharge user = rechargeRepository.findByMobileNumber(mobileNumber)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Optional<UserPlan> userPlanOptional = userPlanRepository.findByUserAndIsActiveTrue(user);
        if (userPlanOptional.isPresent()) {
            return ResponseEntity.ok(userPlanOptional.get());
        } else {
            return ResponseEntity.status(404).body(Map.of("message", "No active plan found"));
        }
    }

    @GetMapping("/plan-history")
    public ResponseEntity<List<UserPlan>> getPlanHistory() {
        String mobileNumber = SecurityContextHolder.getContext().getAuthentication().getName();
        Recharge user = rechargeRepository.findByMobileNumber(mobileNumber)
                .orElseThrow(() -> new RuntimeException("User not found"));

        List<UserPlan> userPlans = userPlanRepository.findByUserOrderByRechargeDateDesc(user);
        return ResponseEntity.ok(userPlans);
    }

    @GetMapping("/data-usage")
    public ResponseEntity<Map<String, Object>> getDataUsage() {
        Map<String, Object> dataUsage = new HashMap<>();
        Map<String, Object> daily = new HashMap<>();
        daily.put("used", 1.3);
        daily.put("total", 2.0);

        Map<String, Object> monthly = new HashMap<>();
        monthly.put("used", 75.6);
        monthly.put("total", 168.0);

        dataUsage.put("daily", daily);
        dataUsage.put("monthly", monthly);

        return ResponseEntity.ok(dataUsage);
    }

    @GetMapping("/transactions")
    public ResponseEntity<List<Transaction>> getRecentTransactions() {
        String mobileNumber = SecurityContextHolder.getContext().getAuthentication().getName();
        Recharge user = rechargeRepository.findByMobileNumber(mobileNumber)
                .orElseThrow(() -> new RuntimeException("User not found"));

        List<Transaction> transactions = transactionRepository.findTop5ByUserOrderByDateDesc(user);
        return ResponseEntity.ok(transactions);
    }

    @GetMapping("/offers")
    public ResponseEntity<List<Offer>> getOffers() {
        String mobileNumber = SecurityContextHolder.getContext().getAuthentication().getName();
        Recharge user = rechargeRepository.findByMobileNumber(mobileNumber)
                .orElseThrow(() -> new RuntimeException("User not found"));

        List<Offer> offers = offerRepository.findByUser(user);
        return ResponseEntity.ok(offers);
    }

    @GetMapping("/recharge-history")
    public ResponseEntity<List<RechargeHistory>> getRechargeHistory() {
        String mobileNumber = SecurityContextHolder.getContext().getAuthentication().getName();
        Recharge user = rechargeRepository.findByMobileNumber(mobileNumber)
                .orElseThrow(() -> new RuntimeException("User not found"));

        List<RechargeHistory> rechargeHistory = rechargeHistoryRepository.findByUser(user);
        return ResponseEntity.ok(rechargeHistory);
    }

    @GetMapping("/all-recharge-history")
    public ResponseEntity<List<RechargeHistory>> getAllRechargeHistory() {
        String role = SecurityContextHolder.getContext().getAuthentication().getAuthorities().toString();
        if (!role.contains("ROLE_ADMIN")) {
            return ResponseEntity.status(403).body(null);
        }

        List<RechargeHistory> allRechargeHistory = rechargeHistoryRepository.findAll();
        return ResponseEntity.ok(allRechargeHistory);
    }
}