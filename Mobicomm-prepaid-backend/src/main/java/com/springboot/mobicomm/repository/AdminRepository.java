package com.springboot.mobicomm.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.springboot.mobicomm.entity.Admin;

public interface AdminRepository extends JpaRepository<Admin, String> {
}