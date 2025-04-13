package com.springboot.mobicomm.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.springboot.mobicomm.entity.Recharge;
import com.springboot.mobicomm.entity.Transaction;

import java.util.List;

public interface TransactionRepository extends JpaRepository<Transaction, Long> {
    List<Transaction> findByUserOrderByDateDesc(Recharge user);
    List<Transaction> findTop5ByUserOrderByDateDesc(Recharge user); 
}