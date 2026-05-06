package com.example.SpringBootApp.controllers;

import com.example.SpringBootApp.DTOs.AutenticacaoResponseDTO;
import com.example.SpringBootApp.DTOs.LoginDTO;
import com.example.SpringBootApp.DTOs.MessageResponseDTO;
import com.example.SpringBootApp.DTOs.PasswordRecoveryRequestDTO;
import com.example.SpringBootApp.DTOs.ResetPasswordDTO;
import com.example.SpringBootApp.DTOs.ValidateRecoveryCodeDTO;
import com.example.SpringBootApp.exceptions.ResourceNotFoundException;
import com.example.SpringBootApp.exceptions.GlobalExceptionHandler;
import com.example.SpringBootApp.services.AuthService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@ExtendWith(MockitoExtension.class)
class AuthControllerTest {

    private MockMvc mockMvc;

    @Mock
    private AuthService authService;

    @InjectMocks
    private AuthController authController;

    private ObjectMapper objectMapper;

    @BeforeEach
    void setup() {
        objectMapper = new ObjectMapper();

        mockMvc = MockMvcBuilders.standaloneSetup(authController)
                .setControllerAdvice(new GlobalExceptionHandler())
                .build();
    }

    @Test
    void login_ShouldReturn200_WhenValidCredentialsWithUsername() throws Exception {
        // Arrange
        LoginDTO request = new LoginDTO();
        request.setIdentifier("admin");
        request.setPassword("password123");
        
        AutenticacaoResponseDTO response = new AutenticacaoResponseDTO(
                "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.test",
                "Bearer",
                1L,
                "admin",
                "ADMIN"
        );

        when(authService.authenticate(any(LoginDTO.class))).thenReturn(response);

        // Act & Assert
        mockMvc.perform(post("/sessions")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.token").value("eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.test"))
                .andExpect(jsonPath("$.type").value("Bearer"))
                .andExpect(jsonPath("$.userId").value(1))
                .andExpect(jsonPath("$.userName").value("admin"))
                .andExpect(jsonPath("$.accessLevel").value("ADMIN"));
    }

    @Test
    void login_ShouldReturn200_WhenValidCredentialsWithEmail() throws Exception {
        // Arrange
        LoginDTO request = new LoginDTO();
        request.setIdentifier("admin@example.com");
        request.setPassword("password123");
        
        AutenticacaoResponseDTO response = new AutenticacaoResponseDTO(
                "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.test",
                "Bearer",
                1L,
                "admin",
                "ADMIN"
        );

        when(authService.authenticate(any(LoginDTO.class))).thenReturn(response);

        // Act & Assert
        mockMvc.perform(post("/sessions")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.token").value("eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.test"))
                .andExpect(jsonPath("$.type").value("Bearer"))
                .andExpect(jsonPath("$.userId").value(1))
                .andExpect(jsonPath("$.userName").value("admin"))
                .andExpect(jsonPath("$.accessLevel").value("ADMIN"));
    }

    @Test
    void login_ShouldReturn404_WhenUsuarioNotFound() throws Exception {
        // Arrange
        LoginDTO request = new LoginDTO();
        request.setIdentifier("nonexistent");
        request.setPassword("password123");

        when(authService.authenticate(any(LoginDTO.class)))
                .thenThrow(new ResourceNotFoundException("Usuario not found"));

        // Act & Assert
        mockMvc.perform(post("/sessions")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.status").value(404))
                .andExpect(jsonPath("$.message").value("Usuario not found"));
    }

    @Test
    void login_ShouldReturn500_WhenInvalidPassword() throws Exception {
        // Arrange
        LoginDTO request = new LoginDTO();
        request.setIdentifier("admin");
        request.setPassword("wrongpassword");

        when(authService.authenticate(any(LoginDTO.class)))
                .thenThrow(new RuntimeException("Invalid password"));

        // Act & Assert
        mockMvc.perform(post("/sessions")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isInternalServerError());
    }

    @Test
    void login_ShouldReturn400_WhenInvalidInput() throws Exception {
        // Arrange
        String invalidJson = "{\"identifier\": \"\", \"password\": \"\"}";

        // Act & Assert
        mockMvc.perform(post("/sessions")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(invalidJson))
                .andExpect(status().isBadRequest());
    }
    
    @Test
    void login_ShouldReturn400_WhenMissingIdentifier() throws Exception {
        // Arrange
        String invalidJson = "{\"password\": \"test123\"}";

        // Act & Assert
        mockMvc.perform(post("/sessions")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(invalidJson))
                .andExpect(status().isBadRequest());
    }

    @Test
    void requestPasswordRecovery_ShouldReturn200_WhenValidEmail() throws Exception {
        // Arrange
        PasswordRecoveryRequestDTO request = new PasswordRecoveryRequestDTO();
        request.setEmail("user@example.com");
        
        MessageResponseDTO response = new MessageResponseDTO(
                "If your email is registered, you will receive a recovery link shortly."
        );

        when(authService.requestPasswordRecovery(any(PasswordRecoveryRequestDTO.class)))
                .thenReturn(response);

        // Act & Assert
        mockMvc.perform(post("/sessions/password-recovery")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message")
                        .value("If your email is registered, you will receive a recovery link shortly."));
    }

    @Test
    void requestPasswordRecovery_ShouldReturn200_WhenEmailNotRegistered() throws Exception {
        // Arrange - should return same message to prevent enumeration
        PasswordRecoveryRequestDTO request = new PasswordRecoveryRequestDTO();
        request.setEmail("nonexistent@example.com");
        
        MessageResponseDTO response = new MessageResponseDTO(
                "If your email is registered, you will receive a recovery link shortly."
        );

        when(authService.requestPasswordRecovery(any(PasswordRecoveryRequestDTO.class)))
                .thenReturn(response);

        // Act & Assert
        mockMvc.perform(post("/sessions/password-recovery")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message")
                        .value("If your email is registered, you will receive a recovery link shortly."));
    }

    @Test
    void requestPasswordRecovery_ShouldReturn400_WhenInvalidEmail() throws Exception {
        // Arrange
        String invalidJson = "{\"email\": \"invalid-email\"}";

        // Act & Assert
        mockMvc.perform(post("/sessions/password-recovery")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(invalidJson))
                .andExpect(status().isBadRequest());
    }

    @Test
    void requestPasswordRecovery_ShouldReturn400_WhenMissingEmail() throws Exception {
        // Arrange
        String invalidJson = "{}";

        // Act & Assert
        mockMvc.perform(post("/sessions/password-recovery")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(invalidJson))
                .andExpect(status().isBadRequest());
    }

    @Test
    void resetPassword_ShouldReturn200_WhenValidToken() throws Exception {
        // Arrange
        ResetPasswordDTO request = new ResetPasswordDTO();
        request.setToken("valid-token-123");
        request.setNewPassword("newPassword123");
        
        MessageResponseDTO response = new MessageResponseDTO("Password reset successful");

        when(authService.resetPassword(any(ResetPasswordDTO.class)))
                .thenReturn(response);

        // Act & Assert
        mockMvc.perform(post("/sessions/reset-password")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message").value("Password reset successful"));
    }

    @Test
    void resetPassword_ShouldReturn404_WhenInvalidToken() throws Exception {
        // Arrange
        ResetPasswordDTO request = new ResetPasswordDTO();
        request.setToken("invalid-token");
        request.setNewPassword("newPassword123");

        when(authService.resetPassword(any(ResetPasswordDTO.class)))
                .thenThrow(new ResourceNotFoundException("Invalid or expired token"));

        // Act & Assert
        mockMvc.perform(post("/sessions/reset-password")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.status").value(404))
                .andExpect(jsonPath("$.message").value("Invalid or expired token"));
    }

    @Test
    void resetPassword_ShouldReturn500_WhenTokenAlreadyUsed() throws Exception {
        // Arrange
        ResetPasswordDTO request = new ResetPasswordDTO();
        request.setToken("used-token");
        request.setNewPassword("newPassword123");

        when(authService.resetPassword(any(ResetPasswordDTO.class)))
                .thenThrow(new RuntimeException("Token has already been used"));

        // Act & Assert
        mockMvc.perform(post("/sessions/reset-password")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isInternalServerError());
    }

    @Test
    void resetPassword_ShouldReturn500_WhenTokenExpired() throws Exception {
        // Arrange
        ResetPasswordDTO request = new ResetPasswordDTO();
        request.setToken("expired-token");
        request.setNewPassword("newPassword123");

        when(authService.resetPassword(any(ResetPasswordDTO.class)))
                .thenThrow(new RuntimeException("Token has expired"));

        // Act & Assert
        mockMvc.perform(post("/sessions/reset-password")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isInternalServerError());
    }

    @Test
    void resetPassword_ShouldReturn400_WhenPasswordTooShort() throws Exception {
        // Arrange
        String invalidJson = "{\"token\": \"valid-token\", \"newPassword\": \"123\"}";

        // Act & Assert
        mockMvc.perform(post("/sessions/reset-password")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(invalidJson))
                .andExpect(status().isBadRequest());
    }

    @Test
    void resetPassword_ShouldReturn400_WhenMissingToken() throws Exception {
        // Arrange
        String invalidJson = "{\"newPassword\": \"newPassword123\"}";

        // Act & Assert
        mockMvc.perform(post("/sessions/reset-password")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(invalidJson))
                .andExpect(status().isBadRequest());
    }

    @Test
    void validateRecoveryCode_ShouldReturn200_WhenValidCode() throws Exception {
        ValidateRecoveryCodeDTO request = new ValidateRecoveryCodeDTO();
        request.setToken("ABC123");

        MessageResponseDTO response = new MessageResponseDTO("Valid token");
        when(authService.validateRecoveryCode(any(ValidateRecoveryCodeDTO.class))).thenReturn(response);

        mockMvc.perform(post("/sessions/validate-recovery-code")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message").value("Valid token"));
    }

    @Test
    void validateRecoveryCode_ShouldReturn404_WhenInvalidCode() throws Exception {
        ValidateRecoveryCodeDTO request = new ValidateRecoveryCodeDTO();
        request.setToken("WRONG1");

        when(authService.validateRecoveryCode(any(ValidateRecoveryCodeDTO.class)))
                .thenThrow(new ResourceNotFoundException("Invalid or expired token"));

        mockMvc.perform(post("/sessions/validate-recovery-code")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.message").value("Invalid or expired token"));
    }
}
