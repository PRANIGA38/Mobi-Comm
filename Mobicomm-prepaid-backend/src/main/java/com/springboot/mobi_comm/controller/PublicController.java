package com.springboot.mobi_comm.controller;

import com.springboot.mobi_comm.entity.Category;
import com.springboot.mobi_comm.entity.Plan;
import com.springboot.mobi_comm.service.CategoryService;
import com.springboot.mobi_comm.service.PlanService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/public")
public class PublicController {
    private static final Logger log = LoggerFactory.getLogger(PublicController.class);

    @Autowired
    private PlanService planService;
    @Autowired
    private CategoryService categoryService;
    @GetMapping("/plans")
    public ResponseEntity<List<Plan>> getActivePlans(@RequestParam(value = "category", required = false) String category) {
        log.info("Fetching active plans for user view with category: {}", category);
        return ResponseEntity.ok(planService.getPlansByCategory(category)); // Uses getPlansByCategory which filters active only
    }
    @GetMapping("/categories")
    public ResponseEntity<List<Category>> getAllCategories() {
        log.info("Fetching all categories for public access");
        List<Category> categories = categoryService.getAllCategories();
        return ResponseEntity.ok(categories);
    }
}