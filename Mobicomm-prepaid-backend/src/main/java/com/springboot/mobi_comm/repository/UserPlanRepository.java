package com.springboot.mobi_comm.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.springboot.mobi_comm.entity.Recharge;
import com.springboot.mobi_comm.entity.UserPlan;

import java.util.List;
import java.util.Optional;

public interface UserPlanRepository extends JpaRepository<UserPlan, Long> {
    Optional<UserPlan> findByUserAndIsActiveTrue(Recharge user);
    List<UserPlan> findByUserOrderByRechargeDateDesc(Recharge user);
}