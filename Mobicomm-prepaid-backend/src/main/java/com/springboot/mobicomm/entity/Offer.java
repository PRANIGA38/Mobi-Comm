package com.springboot.mobicomm.entity;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Data
public class Offer {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String title;

    @Column(nullable = false)
    private String description;

    @Column(nullable = false)
    private String icon; 

    @Column(nullable = false)
    private String action; 

    @ManyToOne
    @JoinColumn(name = "user_id")
    private Recharge user;
}