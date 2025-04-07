package com.springboot.mobi_comm.repository;
import org.springframework.data.jpa.repository.JpaRepository;

import com.springboot.mobi_comm.entity.NewUser;

public interface NewUserRepository extends JpaRepository<NewUser, Long> {
    boolean existsByNumber(String number); 
    boolean existsByEmail(String email);   
}