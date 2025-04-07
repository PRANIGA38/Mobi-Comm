package com.springboot.mobicomm.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.springboot.mobicomm.service.AuthService;
import com.springboot.mobicomm.service.UserAuthService;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    private AuthService authService;

    @Autowired
    private UserAuthService userAuthService;

    @PostMapping("/admin-login")
    public ResponseEntity<String> adminLogin(@RequestBody AdminRequest request) {
        try {
            String username = request.getUsername();
            String password = request.getPassword();
            String token = authService.adminLogin(username, password);
            return ResponseEntity.ok(token);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PostMapping("/send-otp")
    public ResponseEntity<String> sendOtp(@RequestBody Map<String, String> request) {
        String mobileNumber = request.get("mobileNumber");
        if (mobileNumber == null || !mobileNumber.matches("^[6-9]\\d{9}$")) {
            return ResponseEntity.badRequest().body("Invalid mobile number");
        }

        try {
            String result = userAuthService.generateAndSendOtp(mobileNumber);
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PostMapping("/verify-otp")
    public ResponseEntity<String> verifyOtp(@RequestBody Map<String, String> request) {
        String mobileNumber = request.get("mobileNumber");
        String otp = request.get("otp");

        if (mobileNumber == null || otp == null) {
            return ResponseEntity.badRequest().body("Mobile number and OTP are required");
        }

        try {
            String token = userAuthService.verifyOtpAndGenerateToken(mobileNumber, otp);
            return ResponseEntity.ok(token);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}

class AdminRequest {
    private String username;
    private String password;

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }
}