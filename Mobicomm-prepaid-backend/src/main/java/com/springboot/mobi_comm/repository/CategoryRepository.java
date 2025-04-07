package com.springboot.mobi_comm.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.springboot.mobi_comm.entity.Category;

import java.util.Optional;

public interface CategoryRepository extends JpaRepository<Category, Long> {
    Optional<Category> findByName(String name);
}