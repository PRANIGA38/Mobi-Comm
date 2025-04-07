package com.springboot.mobi_comm.controller;

import com.springboot.mobi_comm.entity.Transaction;
import com.springboot.mobi_comm.service.TransactionService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/transactions")
public class TransactionController {

    private static final Logger logger = LoggerFactory.getLogger(TransactionController.class);

    @Autowired
    private TransactionService transactionService;

    @PostMapping("/save")
    public ResponseEntity<?> saveTransaction(
            @RequestBody Transaction transaction,
            @RequestParam(value = "paymentMethodId", required = false) String paymentMethodId) {
        try {
            logger.info("Received request to save transaction: {}, paymentMethodId: {}", transaction, paymentMethodId);
            Transaction savedTransaction = transactionService.saveTransaction(transaction, paymentMethodId);
            return ResponseEntity.ok(savedTransaction);
        } catch (IllegalArgumentException e) {
            logger.error("Bad request: {}", e.getMessage());
            return ResponseEntity.badRequest().body("Error: " + e.getMessage());
        } catch (Exception e) {
            logger.error("Internal server error while saving transaction: {}", e.getMessage(), e);
            return ResponseEntity.status(500).body("Internal server error: " + e.getMessage());
        }
    }
}