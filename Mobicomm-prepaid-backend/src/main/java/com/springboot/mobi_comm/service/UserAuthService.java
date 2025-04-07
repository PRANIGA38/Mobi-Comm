package com.springboot.mobi_comm.service;

import com.springboot.mobi_comm.config.JwtUtil;
import com.springboot.mobi_comm.entity.Recharge;
import com.springboot.mobi_comm.repository.RechargeRepository;
import com.twilio.Twilio;
import com.twilio.rest.api.v2010.account.Message;
import com.twilio.type.PhoneNumber;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.Map;
import java.util.Random;

@Service
public class UserAuthService {

    private static final Logger log = LoggerFactory.getLogger(UserAuthService.class);

    @Autowired
    private RechargeRepository rechargeRepository;

    @Autowired
    private JwtUtil jwtUtil;

    @Value("${twilio.account_sid}") 
    private String twilioAccountSid;

    @Value("${twilio.auth_token}") 
    private String twilioAuthToken;

    @Value("${twilio.phone_number}") 
    private String twilioPhoneNumber;

    private Map<String, String> otpStore = new HashMap<>();

    public String generateAndSendOtp(String mobileNumber) {
        // Check if the user exists in the users table
        if (!rechargeRepository.existsByMobileNumber(mobileNumber)) {
            log.error("User with mobile number {} not found", mobileNumber);
            throw new RuntimeException("User not found");
        }

        Recharge user = rechargeRepository.findByMobileNumber(mobileNumber)
                .orElseThrow(() -> new RuntimeException("User not found"));

        // Check if the user's status is ACTIVE
        if (!"ACTIVE".equalsIgnoreCase(user.getStatus())) {
            log.error("User with mobile number {} is not active", mobileNumber);
            throw new RuntimeException("User account is not active");
        }

        // Generate a 6-digit OTP
        String otp = String.format("%06d", new Random().nextInt(999999));
        otpStore.put(mobileNumber, otp);

        // Send OTP via Twilio
        try {
            Twilio.init(twilioAccountSid, twilioAuthToken);
            Message message = Message.creator(
                    new PhoneNumber("+91" + mobileNumber), 
                    new PhoneNumber(twilioPhoneNumber),
                    "Your MobiComm OTP is: " + otp
            ).create();
            log.info("OTP sent to {}: {}", mobileNumber, message.getSid());
        } catch (Exception e) {
            log.error("Failed to send OTP to {}: {}", mobileNumber, e.getMessage());
            throw new RuntimeException("Failed to send OTP: " + e.getMessage());
        }

        return "OTP sent successfully";
    }

    public String verifyOtpAndGenerateToken(String mobileNumber, String otp) {
        String storedOtp = otpStore.get(mobileNumber);
        if (storedOtp == null || !storedOtp.equals(otp)) {
            log.error("Invalid OTP for mobile number {}", mobileNumber);
            throw new RuntimeException("Invalid OTP");
        }
        // Generate JWT token with "USER" role
        String token = jwtUtil.generateToken(mobileNumber, "USER");
        otpStore.remove(mobileNumber); 
        log.info("OTP verified for mobile number {}, token generated: {}", mobileNumber, token);
        return token;
    }
}