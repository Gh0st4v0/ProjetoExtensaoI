package com.example.SpringBootApp.DTOs;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class LoginDTO {
    @NotBlank(message = "Username or email is required")
    private String identifier;

    @NotBlank(message = "Password is required")
    private String password;
}
