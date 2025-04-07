package com.springboot.mobicomm.service;

import com.springboot.mobicomm.entity.Category;
import com.springboot.mobicomm.repository.CategoryRepository;

import jakarta.transaction.Transactional;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class CategoryService {
    private static final Logger log = LoggerFactory.getLogger(CategoryService.class);

    @Autowired
    private CategoryRepository categoryRepository;

    public List<Category> getAllCategories() {
        log.info("Fetching all categories");
        return categoryRepository.findAll(); // Return all categories, including inactive ones for admin
    }

    public List<Category> getActiveCategories() {
        log.info("Fetching active categories");
        return categoryRepository.findAll().stream()
                .filter(category -> category.getIsActive() != null && category.getIsActive())
                .collect(Collectors.toList());
    }

    public Category createCategory(String categoryName) {
        log.info("Creating new category: {}", categoryName);
        if (categoryRepository.findByName(categoryName).isPresent()) {
            throw new RuntimeException("Category already exists: " + categoryName);
        }
        Category category = new Category();
        category.setName(categoryName.toLowerCase());
        category.setIsActive(true);
        return categoryRepository.save(category);
    }
    
    public Category updateCategory(Long id, Category categoryDetails) {
        log.info("Updating category with id: {}", id);
        Category category = categoryRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Category not found with id: " + id));
        category.setName(categoryDetails.getName().toLowerCase());
        category.setIsActive(categoryDetails.getIsActive());
        return categoryRepository.save(category);
    }

    @Transactional
    public void toggleCategoryStatus(Long id) {
        log.info("Toggling status for category with id: {}", id);
        Category category = categoryRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Category not found with id: " + id));
        log.info("Current isActive: {}", category.getIsActive());
        category.setIsActive(!category.getIsActive());
        log.info("New isActive: {}", category.getIsActive());
        categoryRepository.save(category);
        log.info("Category saved successfully with id: {}", id);
    }
}