package com.example.SpringBootApp.controllers;

import com.example.SpringBootApp.DTOs.AutenticacaoResponseDTO;
import com.example.SpringBootApp.DTOs.LoginDTO;
import com.example.SpringBootApp.DTOs.MessageResponseDTO;
import com.example.SpringBootApp.DTOs.PasswordRecoveryRequestDTO;
import com.example.SpringBootApp.DTOs.ResetPasswordDTO;
import com.example.SpringBootApp.DTOs.ValidateRecoveryCodeDTO;
import com.example.SpringBootApp.services.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/sessions")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping
    public ResponseEntity<AutenticacaoResponseDTO> login(@Valid @RequestBody LoginDTO loginDTO) {
        AutenticacaoResponseDTO response = authService.authenticate(loginDTO);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/password-recovery")
    public ResponseEntity<MessageResponseDTO> requestPasswordRecovery(@Valid @RequestBody PasswordRecoveryRequestDTO request) {
        MessageResponseDTO response = authService.requestPasswordRecovery(request);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/reset-password")
    public ResponseEntity<MessageResponseDTO> resetPassword(@Valid @RequestBody ResetPasswordDTO request) {
        MessageResponseDTO response = authService.resetPassword(request);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/validate-recovery-code")
    public ResponseEntity<MessageResponseDTO> validateRecoveryCode(@Valid @RequestBody ValidateRecoveryCodeDTO request) {
        MessageResponseDTO response = authService.validateRecoveryCode(request);
        return ResponseEntity.ok(response);
    }
}
