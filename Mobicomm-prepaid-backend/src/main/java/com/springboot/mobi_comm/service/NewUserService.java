package com.springboot.mobi_comm.service;

import com.springboot.mobi_comm.entity.NewUser;
import com.springboot.mobi_comm.repository.NewUserRepository;
import com.springboot.mobi_comm.repository.RechargeRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class NewUserService {

    @Autowired
    private NewUserRepository newUserRepository;

    @Autowired
    private RechargeRepository rechargeRepository;

    public NewUser saveNewUser(NewUser newUser) {
        // Check if the phone number already exists in the users table
        if (rechargeRepository.existsByMobileNumber(newUser.getNumber())) {
            throw new IllegalArgumentException("Phone number is already registered in the users table");
        }

        // Check if the email already exists in the newuser table
        if (newUserRepository.existsByEmail(newUser.getEmail())) {
            throw new IllegalArgumentException("Email is already registered in the newuser table");
        }

        // If both checks pass, proceed to save the new user
        return newUserRepository.save(newUser);
    }
}