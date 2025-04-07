package com.springboot.mobi_comm.entity;
import jakarta.persistence.*;
import lombok.Data;

@Entity
@Table(name = "newuser")
@Data 
public class NewUser {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false, unique = true)
    private String number;

    @Column(nullable = false, unique = true)
    private String email;

    @Column(nullable = false)
    private String address;

    @Column(name = "id_proof", nullable = false)
    private String idProof;

    @Column(name = "id_number", nullable = false)
    private String idNumber;
}