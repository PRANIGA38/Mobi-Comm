package com.springboot.mobi_comm.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.springboot.mobi_comm.entity.Admin;

public interface AdminRepository extends JpaRepository<Admin, String> {
}