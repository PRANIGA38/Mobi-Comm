package com.springboot.mobi_comm.entity;

import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDate;

@Entity
@Table(name = "transaction")
@Data
public class Transaction {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String type;

    @Column(nullable = false)
    private LocalDate date;

    @Column(nullable = false)
    private double amount;

    @Column(name = "transaction_type", nullable = false)
    private String transactionType;

    @Column(name = "payment_method", nullable = false)
    private String paymentMethod;

    @Column(nullable = false)
    private String accountDetail;

    @Column
    private Integer planValidity;

    @ManyToOne
    @JoinColumn(name = "user_id")
    private Recharge user;

    // Add clientSecret field to return to the frontend
    @Column
    private String clientSecret;

    public void setTransactionType(String transactionType) {
        this.transactionType = transactionType;
        this.paymentMethod = transactionType;
    }

    public void ensurePaymentMethod() {
        if (this.paymentMethod == null && this.transactionType != null) {
            this.paymentMethod = this.transactionType;
        }
    }

    // Getter and Setter for clientSecret
    public String getClientSecret() {
        return clientSecret;
    }

    public void setClientSecret(String clientSecret) {
        this.clientSecret = clientSecret;
    }
}