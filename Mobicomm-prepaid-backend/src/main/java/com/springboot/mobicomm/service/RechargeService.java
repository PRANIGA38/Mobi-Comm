package com.springboot.mobicomm.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.springboot.mobicomm.entity.Recharge;
import com.springboot.mobicomm.repository.RechargeRepository;

@Service
public class RechargeService {

    @Autowired
    private RechargeRepository rechargeRepository;

    public Recharge processMobileNumber(String mobileNumber) {
        // Validate mobile number format
        if (mobileNumber.length() != 10 || !mobileNumber.matches("\\d+")) {
            throw new IllegalArgumentException("Invalid mobile number");
        }

        // Check if the number exists in the users table
        if (!rechargeRepository.existsByMobileNumber(mobileNumber)) {
            throw new IllegalArgumentException("This is not a Mobi-Com number.");
        }

        // Return the existing record (no need to save a new one since it must already exist)
        return rechargeRepository.findByMobileNumber(mobileNumber)
                .orElseThrow(() -> new IllegalStateException("Mobile number exists but could not be fetched"));
    }
}