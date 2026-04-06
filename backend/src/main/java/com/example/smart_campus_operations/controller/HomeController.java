package com.example.smart_campus_operations.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
public class HomeController {

    @GetMapping("/")
    public Map<String, String> home() {
        return Map.of(
                "message", "Smart Campus Module C backend is running",
                "swagger", "/swagger-ui/index.html"
        );
    }
}