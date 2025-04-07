package com.springboot.mobicomm.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import com.springboot.mobicomm.entity.Plan;

import java.util.List;
import java.util.Optional;

public interface PlanRepository extends JpaRepository<Plan, Long> {
    @Query("SELECT p FROM Plan p LEFT JOIN FETCH p.categories")
    List<Plan> findAllWithCategories();
    Optional<Plan> findByPrice(double price);
}