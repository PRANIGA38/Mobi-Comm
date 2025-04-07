package com.springboot.mobicomm.entity;

import jakarta.persistence.*; 
import java.time.LocalDate;

@Entity
@Table(name = "recharge_history")
public class RechargeHistory {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    private Recharge user;

    @Column(name = "plan_name", nullable = false)
    private String planName;

    @Column(name = "recharge_date", nullable = false)
    private LocalDate rechargeDate;

    @Column(name = "amount", nullable = false)
    private Double amount;

    @Column(name = "payment_mode", nullable = false)
    private String paymentMode;

    @Column(name = "status", nullable = false)
    private String status;

    // Constructors
    public RechargeHistory() {}

    public RechargeHistory(Recharge user, String planName, LocalDate rechargeDate, Double amount, String paymentMode, String status) {
        this.user = user;
        this.planName = planName;
        this.rechargeDate = rechargeDate;
        this.amount = amount;
        this.paymentMode = paymentMode;
        this.status = status;
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Recharge getUser() {
        return user;
    }

    public void setUser(Recharge user) {
        this.user = user;
    }

    public String getPlanName() {
        return planName;
    }

    public void setPlanName(String planName) {
        this.planName = planName;
    }

    public LocalDate getRechargeDate() {
        return rechargeDate;
    }

    public void setRechargeDate(LocalDate rechargeDate) {
        this.rechargeDate = rechargeDate;
    }

    public Double getAmount() {
        return amount;
    }

    public void setAmount(Double amount) {
        this.amount = amount;
    }

    public String getPaymentMode() {
        return paymentMode;
    }

    public void setPaymentMode(String paymentMode) {
        this.paymentMode = paymentMode;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }
}