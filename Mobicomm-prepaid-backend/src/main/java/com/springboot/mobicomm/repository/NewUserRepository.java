package com.springboot.mobicomm.repository;
import org.springframework.data.jpa.repository.JpaRepository;

import com.springboot.mobicomm.entity.NewUser;

public interface NewUserRepository extends JpaRepository<NewUser, Long> {
    boolean existsByNumber(String number); 
    boolean existsByEmail(String email);   
}