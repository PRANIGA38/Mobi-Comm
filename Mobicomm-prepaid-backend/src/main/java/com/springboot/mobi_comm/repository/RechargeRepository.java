package com.springboot.mobi_comm.repository;

import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

import com.springboot.mobi_comm.entity.Recharge;

public interface RechargeRepository extends JpaRepository<Recharge, Long> {
    boolean existsByMobileNumber(String mobileNumber);
    Optional<Recharge> findByMobileNumber(String mobileNumber);
}