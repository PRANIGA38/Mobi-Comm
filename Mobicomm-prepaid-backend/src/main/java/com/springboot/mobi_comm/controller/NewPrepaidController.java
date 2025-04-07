package com.springboot.mobi_comm.controller;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.springboot.mobi_comm.entity.NewUser;
import com.springboot.mobi_comm.service.NewUserService;

@RestController
@RequestMapping("/api/newprepaid")
@CrossOrigin(origins = "http://127.0.0.1:5502")
public class NewPrepaidController {

    private static final Logger log = LoggerFactory.getLogger(NewPrepaidController.class);

    @Autowired
    private NewUserService newUserService;

    @PostMapping("/register")
    public ResponseEntity<?> registerNewUser(@RequestBody NewUser newUser) {
        log.info("Received registration request: {}", newUser);
        try {
            NewUser savedUser = newUserService.saveNewUser(newUser);
            return new ResponseEntity<>(savedUser, HttpStatus.CREATED);
        } catch (IllegalArgumentException e) {
            log.warn("Registration failed: {}", e.getMessage());
            return new ResponseEntity<>(e.getMessage(), HttpStatus.CONFLICT); 
        } catch (Exception e) {
            log.error("Error saving user: {}", e.getMessage(), e);
            return new ResponseEntity<>("Error saving user: " + e.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
}