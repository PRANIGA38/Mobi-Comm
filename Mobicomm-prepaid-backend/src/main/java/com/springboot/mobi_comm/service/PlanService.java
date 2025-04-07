package com.springboot.mobi_comm.service;

import com.springboot.mobi_comm.entity.Category;
import com.springboot.mobi_comm.entity.Plan;
import com.springboot.mobi_comm.repository.CategoryRepository;
import com.springboot.mobi_comm.repository.PlanRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class PlanService {
    private static final Logger log = LoggerFactory.getLogger(PlanService.class);

    @Autowired
    private PlanRepository planRepository;

    @Autowired
    private CategoryRepository categoryRepository;

    public List<Plan> getAllPlans() {
        log.info("Fetching all plans from the database with categories");
        return planRepository.findAllWithCategories(); // Return all plans for admin
    }

    public List<Plan> getActivePlans() {
        log.info("Fetching active plans for user view");
        return planRepository.findAllWithCategories().stream()
                .filter(plan -> plan.getIsActive() != null && plan.getIsActive())
                .filter(plan -> plan.getCategories() == null || plan.getCategories().stream()
                        .allMatch(cat -> cat.getIsActive() != null && cat.getIsActive())) // Only plans with active categories
                .collect(Collectors.toList());
    }

    public List<Plan> getPlansByCategory(String category) {
        log.info("Fetching plans for category: {}", category);
        if (category == null || category.equalsIgnoreCase("all")) {
            return getActivePlans();
        }
        return planRepository.findAllWithCategories().stream()
                .filter(plan -> plan.getIsActive() != null && plan.getIsActive())
                .filter(plan -> plan.getCategories() != null && plan.getCategories().stream()
                        .anyMatch(cat -> cat.getName() != null && cat.getName().equalsIgnoreCase(category) && cat.getIsActive()))
                .collect(Collectors.toList());
    }

    public Plan getPlanById(Long id) {
        return planRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Plan not found with id: " + id));
    }

    public Plan createPlan(Plan plan) {
        if (plan.getCategories() != null) {
            List<Category> validatedCategories = plan.getCategories().stream()
                    .map(category -> categoryRepository.findByName(category.getName())
                            .orElseThrow(() -> new RuntimeException("Category not found: " + category.getName())))
                    .filter(category -> category.getIsActive() != null && category.getIsActive()) // Only active categories
                    .collect(Collectors.toList());
            plan.setCategories(validatedCategories);
        }
        plan.setIsActive(true); // New plans are active by default
        return planRepository.save(plan);
    }

    public Plan updatePlan(Long id, Plan planDetails) {
        Plan plan = getPlanById(id);
        plan.setName(planDetails.getName());
        plan.setDescription(planDetails.getDescription());
        plan.setValidity(planDetails.getValidity());
        plan.setData(planDetails.getData());
        plan.setPrice(planDetails.getPrice());
        plan.setSms(planDetails.getSms());
        plan.setCalls(planDetails.getCalls());
        plan.setBenefits(planDetails.getBenefits());
        plan.setIsHotDeal(planDetails.getIsHotDeal());
        plan.setOriginalPrice(planDetails.getOriginalPrice());
        plan.setIsActive(planDetails.getIsActive());

        if (planDetails.getCategories() != null) {
            List<Category> validatedCategories = planDetails.getCategories().stream()
                    .map(category -> categoryRepository.findByName(category.getName())
                            .orElseThrow(() -> new RuntimeException("Category not found: " + category.getName())))
                    .filter(category -> category.getIsActive() != null && category.getIsActive()) // Only active categories
                    .collect(Collectors.toList());
            plan.setCategories(validatedCategories);
        } else {
            plan.setCategories(null);
        }

        return planRepository.save(plan);
    }

    public void togglePlanStatus(Long id) {
        log.info("Toggling status for plan with id: {}", id);
        Plan plan = getPlanById(id);
        plan.setIsActive(!plan.getIsActive()); // Toggle the status
        planRepository.save(plan);
    }
}