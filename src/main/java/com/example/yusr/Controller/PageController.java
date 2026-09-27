package com.example.yusr.Controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
public class PageController {

    @GetMapping("/")
    public String home(){
        return "index";
    }

    @GetMapping("/login")
    public String login(){
        return "login";
    }

    @GetMapping("/register")
    public String register(){
        return "register";
    }

    @GetMapping("/dashboard")
    public String dashboard(){
        return "dashboard";
    }
    @GetMapping("/patient")
    public String patient(){
        return "patient";
    }
    @GetMapping("/patient-details")
    public String patientDetails(){
        return "patient-details";
    }

    @GetMapping("/caregiver-profile")
    public String caregiverProfile(){
        return "caregiver-profile";
    }

    @GetMapping("/care-team")
    public String careTeam() {
        return "care-team";
    }
    @GetMapping("/medications")
    public String medications() {
        return "medications";
    }
    @GetMapping("/care-tasks")
    public String careTasks() {
        return "care-tasks";
    }

    @GetMapping("/health-readings")
    public String healthReadings() {
        return "health-readings";
    }
    @GetMapping("/incidents")
    public String incidents() {
        return "incidents";
    }
    @GetMapping("/smart-summary")
    public String smartSummary() {
        return "smart-summary";
    }
}