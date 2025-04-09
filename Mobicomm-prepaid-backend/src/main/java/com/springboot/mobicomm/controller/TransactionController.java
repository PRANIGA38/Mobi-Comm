package com.springboot.mobicomm.controller;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.springboot.mobicomm.entity.Transaction;
import com.springboot.mobicomm.service.TransactionService;

import java.util.Map;

@RestController
@RequestMapping("/api/transactions")
public class TransactionController {

    private static final Logger logger = LoggerFactory.getLogger(TransactionController.class);

    @Autowired
    private TransactionService transactionService;

    @PostMapping("/save")
    public ResponseEntity<Map<String, Object>> saveTransaction(
            @RequestBody Transaction transaction,
            @RequestParam(value = "paymentMethodId", required = false) String paymentMethodId) {
        try {
            logger.info("Received request to save transaction: {}, paymentMethodId: {}", transaction, paymentMethodId);
            Map<String, Object> response = transactionService.saveTransaction(transaction, paymentMethodId);
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            logger.error("Bad request: {}", e.getMessage());
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            logger.error("Internal server error while saving transaction: {}", e.getMessage(), e);
            return ResponseEntity.status(500).body(Map.of("error", "Internal server error: " + e.getMessage()));
        }
    }
}