package com.example.SpringBootApp.services;

import com.example.SpringBootApp.DTOs.AutenticacaoResponseDTO;
import com.example.SpringBootApp.DTOs.LoginDTO;
import com.example.SpringBootApp.DTOs.MessageResponseDTO;
import com.example.SpringBootApp.DTOs.PasswordRecoveryRequestDTO;
import com.example.SpringBootApp.DTOs.ResetPasswordDTO;
import com.example.SpringBootApp.DTOs.ValidateRecoveryCodeDTO;
import com.example.SpringBootApp.exceptions.ResourceNotFoundException;
import com.example.SpringBootApp.infra.JwtTokenProvider;
import com.example.SpringBootApp.models.RecuperacaoSenhaToken;
import com.example.SpringBootApp.models.Usuario;
import com.example.SpringBootApp.repositories.RecuperacaoSenhaTokenRepository;
import com.example.SpringBootApp.repositories.UsuarioRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class AuthService {

    private final UsuarioRepository usuarioRepository;
    private final RecuperacaoSenhaTokenRepository recuperacaoSenhaTokenRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider tokenProvider;
    private final EmailService emailService;

    private static final int TOKEN_EXPIRATION_HOURS = 1;
    private static final int RATE_LIMIT_MINUTES = 5;
    private static final String TOKEN_CHARACTERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    private static final int TOKEN_LENGTH = 6;

    public AutenticacaoResponseDTO authenticate(LoginDTO loginDTO) {
        // Try to find user by username first, then by email
        Usuario usuario = usuarioRepository.findByNome(loginDTO.getIdentifier())
                .or(() -> usuarioRepository.findByEmail(loginDTO.getIdentifier()))
                .orElseThrow(() -> new ResourceNotFoundException("Usuario not found"));

        if (!passwordEncoder.matches(loginDTO.getPassword(), usuario.getSenha())) {
            throw new RuntimeException("Invalid password");
        }

        // Gerar token
        String token = tokenProvider.generateToken(usuario);

        return new AutenticacaoResponseDTO(
                token,
                "Bearer",
                usuario.getId(),
                usuario.getNome(),
                usuario.getAccessLevel().name()
        );
    }

    @Transactional
    public MessageResponseDTO requestPasswordRecovery(PasswordRecoveryRequestDTO request) {
        // Always return the same message regardless of user existence
        String genericMessage = "If your email is registered, you will receive a recovery link shortly.";

        Optional<Usuario> usuarioOpt = usuarioRepository.findByEmail(request.getEmail());
        
        if (usuarioOpt.isEmpty()) {
            log.info("Password recovery requested for non-existent email: {}", request.getEmail());
            return new MessageResponseDTO(genericMessage);
        }

        Usuario usuario = usuarioOpt.get();

        // Check rate limiting - user must wait 5 minutes between requests
        Optional<RecuperacaoSenhaToken> recentToken = 
                recuperacaoSenhaTokenRepository.findFirstByUsuarioOrderByCriadoEmDesc(usuario);
        
        if (recentToken.isPresent()) {
            LocalDateTime lastRequest = recentToken.get().getCriadoEm();
            LocalDateTime now = LocalDateTime.now();
            long minutesSinceLastRequest = ChronoUnit.MINUTES.between(lastRequest, now);
            
            if (minutesSinceLastRequest < RATE_LIMIT_MINUTES) {
                log.warn("Rate limit exceeded for user: {} ({}). Last request was {} minutes ago", 
                        usuario.getNome(), usuario.getEmail(), minutesSinceLastRequest);
                // Still return generic message to avoid enumeration
                return new MessageResponseDTO(genericMessage);
            }
        }

        // Generate 6-character alphanumeric token
        String token = generateToken();
        LocalDateTime expiration = LocalDateTime.now().plusHours(TOKEN_EXPIRATION_HOURS);

        // Save token
        RecuperacaoSenhaToken recuperacaoToken = new RecuperacaoSenhaToken();
        recuperacaoToken.setToken(token);
        recuperacaoToken.setUsuario(usuario);
        recuperacaoToken.setExpiracao(expiration);
        recuperacaoToken.setUtilizado(false);
        recuperacaoToken.setCriadoEm(LocalDateTime.now());

        recuperacaoSenhaTokenRepository.save(recuperacaoToken);

        // Send recovery email
        try {
            emailService.sendPasswordRecoveryEmail(usuario.getEmail(), usuario.getNome(), token);
            log.info("Password recovery email sent to user: {} ({})", usuario.getNome(), usuario.getEmail());
        } catch (Exception e) {
            log.error("Failed to send recovery email to: {}", usuario.getEmail(), e);
            // Still return success to avoid enumeration
        }

        return new MessageResponseDTO(genericMessage);
    }

    @Transactional
    public MessageResponseDTO resetPassword(ResetPasswordDTO request) {
        // Find token
        RecuperacaoSenhaToken recuperacaoToken = recuperacaoSenhaTokenRepository.findByToken(request.getToken())
                .orElseThrow(() -> new ResourceNotFoundException("Invalid or expired token"));

        // Check if token is already used
        if (recuperacaoToken.getUtilizado()) {
            throw new RuntimeException("Token has already been used");
        }

        // Check if token is expired
        if (LocalDateTime.now().isAfter(recuperacaoToken.getExpiracao())) {
            throw new RuntimeException("Token has expired");
        }

        // Update user password
        Usuario usuario = recuperacaoToken.getUsuario();
        usuario.setSenha(passwordEncoder.encode(request.getNewPassword()));
        usuarioRepository.save(usuario);

        // Mark token as used
        recuperacaoToken.setUtilizado(true);
        recuperacaoSenhaTokenRepository.save(recuperacaoToken);

        log.info("Password reset successful for user: {} ({})", usuario.getNome(), usuario.getEmail());

        return new MessageResponseDTO("Password reset successful");
    }

    public MessageResponseDTO validateRecoveryCode(ValidateRecoveryCodeDTO request) {
        RecuperacaoSenhaToken recuperacaoToken = recuperacaoSenhaTokenRepository.findByToken(request.getToken())
                .orElseThrow(() -> new ResourceNotFoundException("Invalid or expired token"));

        if (Boolean.TRUE.equals(recuperacaoToken.getUtilizado())) {
            throw new RuntimeException("Token has already been used");
        }

        if (LocalDateTime.now().isAfter(recuperacaoToken.getExpiracao())) {
            throw new RuntimeException("Token has expired");
        }

        return new MessageResponseDTO("Valid token");
    }

    private String generateToken() {
        java.security.SecureRandom random = new java.security.SecureRandom();
        StringBuilder token = new StringBuilder(TOKEN_LENGTH);
        
        for (int i = 0; i < TOKEN_LENGTH; i++) {
            int index = random.nextInt(TOKEN_CHARACTERS.length());
            token.append(TOKEN_CHARACTERS.charAt(index));
        }
        
        return token.toString();
    }
}

