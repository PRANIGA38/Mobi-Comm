package com.springboot.mobicomm.controller;

import com.springboot.mobicomm.entity.Recharge;
import com.springboot.mobicomm.entity.RechargeHistory;
import com.springboot.mobicomm.service.SubscriberService;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
@PreAuthorize("hasRole('ADMIN')")
public class SubscriberController {
    private static final Logger log = LoggerFactory.getLogger(SubscriberController.class);

    @Autowired
    private SubscriberService subscriberService;

    @GetMapping("/subscribers")
    public ResponseEntity<List<Recharge>> getAllSubscribers() {
        log.info("Fetching all subscribers (users)");
        List<Recharge> users = subscriberService.getAllUsers();
        return ResponseEntity.ok(users);
    }

    @GetMapping("/subscribers/{id}")
    public ResponseEntity<Recharge> getSubscriberById(@PathVariable Long id) {
        log.info("Fetching subscriber (user) with id: {}", id);
        Recharge user = subscriberService.getUserById(id)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + id));
        return ResponseEntity.ok(user);
    }

    @PostMapping("/subscribers")
    public ResponseEntity<Recharge> addSubscriber(@RequestBody Recharge user) {
        log.info("Creating new subscriber (user): {}", user.getName());
        Recharge createdUser = subscriberService.addUser(user);
        return ResponseEntity.status(201).body(createdUser);
    }

    @PutMapping("/subscribers/{id}")
    public ResponseEntity<Recharge> updateSubscriber(@PathVariable Long id, @RequestBody Recharge user) {
        try {
            log.info("Updating subscriber (user) with id: {}", id);
            Recharge updatedUser = subscriberService.updateUser(id, user);
            return ResponseEntity.ok(updatedUser);
        } catch (RuntimeException e) {
            log.error("Failed to update subscriber (user) with id: {}", id);
            return ResponseEntity.notFound().build();
        }
    }

    @DeleteMapping("/subscribers/{id}")
    public ResponseEntity<Void> deleteSubscriber(@PathVariable Long id) {
        try {
            log.info("Deleting subscriber (user) with id: {}", id);
            subscriberService.deleteUser(id);
            return ResponseEntity.noContent().build();
        } catch (RuntimeException e) {
            log.error("Failed to delete subscriber (user) with id: {}", id);
            return ResponseEntity.notFound().build();
        }
    }

    @PutMapping("/subscribers/{id}/toggle-status")
    public ResponseEntity<Recharge> toggleSubscriberStatus(@PathVariable Long id) {
        try {
            log.info("Toggling status for subscriber (user) with id: {}", id);
            Recharge updatedUser = subscriberService.toggleUserStatus(id);
            return ResponseEntity.ok(updatedUser);
        } catch (RuntimeException e) {
            log.error("Failed to toggle status for subscriber (user) with id: {}", id);
            return ResponseEntity.notFound().build();
        }
    }

    @GetMapping("/subscribers/expiring-soon")
    public ResponseEntity<List<Recharge>> getSubscribersExpiringSoon() {
        log.info("Fetching subscribers with plans expiring within the next 3 days");
        List<Recharge> expiringSubscribers = subscriberService.getSubscribersExpiringSoon();
        return ResponseEntity.ok(expiringSubscribers);
    }

    @GetMapping("/subscribers/{id}/recharge-history")
    public ResponseEntity<List<RechargeHistory>> getRechargeHistory(@PathVariable Long id) {
        log.info("Fetching recharge history for subscriber with id: {}", id);
        List<RechargeHistory> rechargeHistory = subscriberService.getRechargeHistory(id);
        return ResponseEntity.ok(rechargeHistory);
    }

    @GetMapping("/dashboard-stats")
    public ResponseEntity<Map<String, Object>> getDashboardStats() {
        log.info("Fetching dashboard statistics");
        Map<String, Object> stats = subscriberService.getDashboardStats();
        return ResponseEntity.ok(stats);
    }
}