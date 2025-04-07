package com.springboot.mobi_comm.controller;

import com.springboot.mobi_comm.entity.Recharge;
import com.springboot.mobi_comm.service.RechargeService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api")
public class RechargeController {

    @Autowired
    private RechargeService rechargeService;

    @PostMapping("/recharge")
    public ResponseEntity<Recharge> saveRecharge(@RequestBody RechargeRequest rechargeRequest) {
        Recharge recharge = rechargeService.processMobileNumber(rechargeRequest.getMobileNumber());
        return ResponseEntity.ok(recharge);
    }

    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<String> handleIllegalArgumentException(IllegalArgumentException ex) {
        return new ResponseEntity<>(ex.getMessage(), HttpStatus.BAD_REQUEST);
    }
}

class RechargeRequest {
    private String mobileNumber;

    public String getMobileNumber() {
        return mobileNumber;
    }

    public void setMobileNumber(String mobileNumber) {
        this.mobileNumber = mobileNumber;
    }
}