package com.springboot.mobicomm.repository;

import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

import com.springboot.mobicomm.entity.Recharge;

public interface RechargeRepository extends JpaRepository<Recharge, Long> {
    boolean existsByMobileNumber(String mobileNumber);
    Optional<Recharge> findByMobileNumber(String mobileNumber);
}