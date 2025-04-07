package com.springboot.mobi_comm.entity;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Data;

@Entity
@Table(name = "admins")
@Data
public class Admin {
    @Id
    private String username;
    private String password;
    private String role = "ADMIN"; 
}