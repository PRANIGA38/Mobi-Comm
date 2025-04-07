package com.springboot.mobicomm.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.springboot.mobicomm.entity.Offer;
import com.springboot.mobicomm.entity.Recharge;

import java.util.List;

public interface OfferRepository extends JpaRepository<Offer, Long> {
    List<Offer> findByUser(Recharge user);
}