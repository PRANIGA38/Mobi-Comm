package com.springboot.mobicomm.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.springboot.mobicomm.entity.Subscriber;

public interface SubscriberRepository extends JpaRepository<Subscriber, Long> {
}