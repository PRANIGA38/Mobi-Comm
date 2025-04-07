package com.springboot.mobi_comm.service;

import com.springboot.mobi_comm.entity.Recharge;
import com.springboot.mobi_comm.entity.RechargeHistory;
import com.springboot.mobi_comm.repository.RechargeRepository;
import com.springboot.mobi_comm.repository.RechargeHistoryRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class SubscriberService {

    @Autowired
    private RechargeRepository rechargeRepository;

    @Autowired
    private RechargeHistoryRepository rechargeHistoryRepository;

    public List<Recharge> getAllUsers() {
        return rechargeRepository.findAll();
    }

    public java.util.Optional<Recharge> getUserById(Long id) {
        return rechargeRepository.findById(id);
    }

    public Recharge addUser(Recharge user) {
        return rechargeRepository.save(user);
    }

    public Recharge updateUser(Long id, Recharge user) {
        Recharge existingUser = rechargeRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + id));
        existingUser.setName(user.getName());
        existingUser.setMobileNumber(user.getMobileNumber());
        existingUser.setEmail(user.getEmail());
        existingUser.setStatus(user.getStatus());
        existingUser.setJoinDate(user.getJoinDate());
        existingUser.setMembershipStatus(user.getMembershipStatus());
        existingUser.setRole(user.getRole());
        existingUser.setPassword(user.getPassword());
        existingUser.setAlternativeMobileNumber(user.getAlternativeMobileNumber());
        existingUser.setAddress(user.getAddress());
        existingUser.setCurrentPlan(user.getCurrentPlan());
        existingUser.setPlanExpiryDate(user.getPlanExpiryDate());
        return rechargeRepository.save(existingUser);
    }

    public void deleteUser(Long id) {
        Recharge user = rechargeRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + id));
        rechargeRepository.delete(user);
    }

    public Recharge toggleUserStatus(Long id) {
        Recharge user = rechargeRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + id));
        user.setStatus(user.getStatus().equals("ACTIVE") ? "INACTIVE" : "ACTIVE");
        return rechargeRepository.save(user);
    }

    public List<Recharge> getSubscribersExpiringSoon() {
        LocalDate today = LocalDate.now();
        LocalDate threeDaysFromNow = today.plusDays(3);
        return rechargeRepository.findAll().stream()
                .filter(user -> "ACTIVE".equals(user.getStatus()))
                .filter(user -> user.getPlanExpiryDate() != null)
                .filter(user -> !user.getPlanExpiryDate().isBefore(today) && !user.getPlanExpiryDate().isAfter(threeDaysFromNow))
                .collect(Collectors.toList());
    }

    public List<RechargeHistory> getRechargeHistory(Long userId) {
        Recharge user = rechargeRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + userId));
        return rechargeHistoryRepository.findByUser(user);
    }

    public Map<String, Object> getDashboardStats() {
        List<Recharge> allUsers = rechargeRepository.findAll();

        // Total subscribers (active users)
        long totalSubscribers = allUsers.stream()
                .filter(user -> "ACTIVE".equals(user.getStatus()))
                .count();

        // Expiring soon (within 3 days)
        LocalDate today = LocalDate.now();
        LocalDate threeDaysFromNow = today.plusDays(3);
        long expiringSoon = allUsers.stream()
                .filter(user -> "ACTIVE".equals(user.getStatus()))
                .filter(user -> user.getPlanExpiryDate() != null)
                .filter(user -> !user.getPlanExpiryDate().isBefore(today) && !user.getPlanExpiryDate().isAfter(threeDaysFromNow))
                .count();

        // Active plans (users with a current plan)
        long activePlans = allUsers.stream()
                .filter(user -> "ACTIVE".equals(user.getStatus()))
                .filter(user -> user.getCurrentPlan() != null)
                .count();

        // Monthly revenue (sum of recharge amounts for the current month)
        LocalDate oneMonthAgo = today.minusMonths(1);
        Double monthlyRevenue = rechargeHistoryRepository.getTotalRevenueSince(oneMonthAgo);
        if (monthlyRevenue == null) {
            monthlyRevenue = 0.0;
        }

        // Create a Map to hold the stats
        Map<String, Object> stats = new HashMap<>();
        stats.put("totalSubscribers", totalSubscribers);
        stats.put("expiringSoon", expiringSoon);
        stats.put("activePlans", activePlans);
        stats.put("monthlyRevenue", monthlyRevenue);

        return stats;
    }
}