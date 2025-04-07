package com.springboot.mobi_comm.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.springboot.mobi_comm.entity.Subscriber;

public interface SubscriberRepository extends JpaRepository<Subscriber, Long> {
}