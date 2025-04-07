package com.springboot.mobi_comm.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.springboot.mobi_comm.entity.Recharge;
import com.springboot.mobi_comm.entity.Transaction;

import java.util.List;

public interface TransactionRepository extends JpaRepository<Transaction, Long> {
    List<Transaction> findTop5ByUserOrderByDateDesc(Recharge user);
}