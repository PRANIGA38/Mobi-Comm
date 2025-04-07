package com.springboot.mobi_comm.service;

import org.slf4j.Logger; 
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import com.springboot.mobi_comm.config.JwtUtil;
import com.springboot.mobi_comm.entity.Admin;
import com.springboot.mobi_comm.repository.AdminRepository;
@Service
public class AuthService {

    private static final Logger log = LoggerFactory.getLogger(AuthService.class);


    @Autowired
    private AdminRepository adminRepository;

    @Autowired
    private JwtUtil jwtUtil;

    private BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();
    public String adminLogin(String username, String password) {
        log.info("Attempting admin login for username: {}", username);
        Admin admin = adminRepository.findById(username)
            .orElseThrow(() -> {
                log.error("Admin not found for username: {}", username);
                return new RuntimeException("Invalid credentials");
            });
        
        if (!passwordEncoder.matches(password, admin.getPassword())) {
            log.error("Password mismatch for username: {}", username);
            throw new RuntimeException("Invalid credentials");
        }
        
        String token = jwtUtil.generateToken(username, admin.getRole());
        log.info("Admin login successful for username: {}, generated token: {}", username, token);
        return token;
    }
}