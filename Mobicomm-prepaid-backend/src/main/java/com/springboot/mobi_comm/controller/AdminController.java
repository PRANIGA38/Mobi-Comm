package com.springboot.mobi_comm.controller;

import com.springboot.mobi_comm.entity.Category;
import com.springboot.mobi_comm.entity.Plan;
import com.springboot.mobi_comm.service.CategoryService;
import com.springboot.mobi_comm.service.PlanService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin")
@PreAuthorize("hasRole('ADMIN')")
public class AdminController {
    private static final Logger log = LoggerFactory.getLogger(AdminController.class);

    @Autowired
    private PlanService planService;
    @Autowired
    private CategoryService categoryService;

    @GetMapping("/plans")
    public ResponseEntity<List<Plan>> getAllPlans(@RequestParam(value = "category", required = false) String category) {
        log.info("Fetching plans for category: {}", category);
        return ResponseEntity.ok(planService.getAllPlans()); // Admin sees all plans
    }

    @GetMapping("/plans/{id}")
    public ResponseEntity<Plan> getPlanById(@PathVariable Long id) {
        try {
            log.info("Fetching plan with id: {}", id);
            return ResponseEntity.ok(planService.getPlanById(id));
        } catch (RuntimeException e) {
            log.error("Plan not found with id: {}", id);
            return ResponseEntity.notFound().build();
        }
    }

    @PostMapping("/plans")
    public ResponseEntity<Plan> createPlan(@RequestBody Plan plan) {
        log.info("Creating new plan: {}", plan.getName());
        Plan createdPlan = planService.createPlan(plan);
        return ResponseEntity.status(201).body(createdPlan);
    }

    @PutMapping("/plans/{id}")
    public ResponseEntity<Plan> updatePlan(@PathVariable Long id, @RequestBody Plan planDetails) {
        try {
            log.info("Updating plan with id: {}", id);
            Plan updatedPlan = planService.updatePlan(id, planDetails);
            return ResponseEntity.ok(updatedPlan);
        } catch (RuntimeException e) {
            log.error("Failed to update plan with id: {}", id);
            return ResponseEntity.notFound().build();
        }
    }

    @PutMapping("/plans/{id}/toggle")
    public ResponseEntity<Void> togglePlanStatus(@PathVariable Long id) {
        try {
            log.info("Toggling status for plan with id: {}", id);
            planService.togglePlanStatus(id);
            return ResponseEntity.noContent().build();
        } catch (RuntimeException e) {
            log.error("Failed to toggle plan status with id: {}", id);
            return ResponseEntity.notFound().build();
        }
    }

    @GetMapping("/categories")
    public ResponseEntity<List<Category>> getAllCategories() {
        log.info("Fetching all categories");
        return ResponseEntity.ok(categoryService.getAllCategories()); // Admin sees all categories
    }

    @PostMapping("/categories")
    public ResponseEntity<Category> createCategory(@RequestBody Category category) {
        log.info("Creating new category: {}", category.getName());
        try {
            Category createdCategory = categoryService.createCategory(category.getName());
            return ResponseEntity.status(201).body(createdCategory);
        } catch (RuntimeException e) {
            log.error("Failed to create category: {}", e.getMessage());
            return ResponseEntity.badRequest().body(null);
        }
    }

    @PutMapping("/categories/{id}")
    public ResponseEntity<Category> updateCategory(@PathVariable Long id, @RequestBody Category category) {
        try {
            log.info("Updating category with id: {}", id);
            Category updatedCategory = categoryService.updateCategory(id, category);
            return ResponseEntity.ok(updatedCategory);
        } catch (RuntimeException e) {
            log.error("Failed to update category with id: {}", id);
            return ResponseEntity.notFound().build();
        }
    }

    @PutMapping("/categories/{id}/toggle")
    public ResponseEntity<Void> toggleCategoryStatus(@PathVariable Long id) {
        try {
            log.info("Toggling status for category with id: {}", id);
            categoryService.toggleCategoryStatus(id);
            return ResponseEntity.noContent().build();
        } catch (RuntimeException e) {
            log.error("Failed to toggle category status with id: {} - {}", id, e.getMessage(), e);
            return ResponseEntity.status(500).body(null); // Use 500 for server errors
        }
    }
}