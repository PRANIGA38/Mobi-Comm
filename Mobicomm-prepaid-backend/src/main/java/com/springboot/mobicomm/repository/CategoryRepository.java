package com.springboot.mobicomm.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.springboot.mobicomm.entity.Category;

import java.util.Optional;

public interface CategoryRepository extends JpaRepository<Category, Long> {
    Optional<Category> findByName(String name);
}