package com.springboot.mobicomm.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import com.springboot.mobicomm.entity.Recharge;
import com.springboot.mobicomm.entity.RechargeHistory;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface RechargeHistoryRepository extends JpaRepository<RechargeHistory, Long> {
    List<RechargeHistory> findByUser(Recharge user);
    List<RechargeHistory> findByUserId(Long userId);
    @Query("SELECT COALESCE(SUM(r.amount), 0) FROM RechargeHistory r WHERE r.rechargeDate >= :startDate")
    Double getTotalRevenueSince(LocalDate startDate);
}