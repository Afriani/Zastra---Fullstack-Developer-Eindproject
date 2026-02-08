package com.zastra.zastra.infra.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class ApiController {

    @GetMapping("/api/")
    public String apiRoot() {
        return """
        Welcome to Zastra API 🚀
        
        Available endpoints:
        - /api/auth/register
        - /api/auth/login
        - /api/reports
        - /api/messages
        - /api/users
        """;
    }

}
