package com.springboot.mobicomm.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.springboot.mobicomm.entity.Recharge;
import com.springboot.mobicomm.entity.UserPlan;

import java.util.List;
import java.util.Optional;

public interface UserPlanRepository extends JpaRepository<UserPlan, Long> {
    Optional<UserPlan> findByUserAndIsActiveTrue(Recharge user);
    List<UserPlan> findByUserOrderByRechargeDateDesc(Recharge user);
}