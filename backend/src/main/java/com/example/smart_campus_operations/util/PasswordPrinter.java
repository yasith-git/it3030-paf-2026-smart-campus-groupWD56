package com.example.smart_campus_operations.util;

import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

public class PasswordPrinter {
    public static void main(String[] args) {
        BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();
        System.out.println(encoder.encode("password123"));
    }
}