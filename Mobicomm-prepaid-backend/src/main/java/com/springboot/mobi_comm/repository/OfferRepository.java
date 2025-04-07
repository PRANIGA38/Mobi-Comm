package com.springboot.mobi_comm.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.springboot.mobi_comm.entity.Offer;
import com.springboot.mobi_comm.entity.Recharge;

import java.util.List;

public interface OfferRepository extends JpaRepository<Offer, Long> {
    List<Offer> findByUser(Recharge user);
}