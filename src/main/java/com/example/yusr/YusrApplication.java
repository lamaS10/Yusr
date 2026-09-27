package com.example.yusr;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class YusrApplication {

    public static void main(String[] args) {
        SpringApplication.run(YusrApplication.class, args);
    }

}
