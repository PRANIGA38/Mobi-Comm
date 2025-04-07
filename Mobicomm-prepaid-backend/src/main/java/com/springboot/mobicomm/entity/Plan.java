package com.springboot.mobicomm.entity;

import jakarta.persistence.*; 
import lombok.Data;

import java.util.List;
@Entity
@Table(name = "plans")
@Data
public class Plan {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String name;
    private String description;
    private Integer validity;
    private String data;
    private Integer price;
    private String sms;
    private String calls;
    private String benefits;

    @ManyToMany(fetch = FetchType.EAGER)
    @JoinTable(
        name = "plan_categories",
        joinColumns = @JoinColumn(name = "plan_id"),
        inverseJoinColumns = @JoinColumn(name = "category_id")
    )
    private List<Category> categories;


    private Boolean isHotDeal;
    private Integer originalPrice;

    private Boolean isActive = true; 
}