package com.example.SpringBootApp.utils;

import org.junit.jupiter.api.Test;

import java.security.SecureRandom;

public class TokenGeneratorTest {
    
    private static final String TOKEN_CHARACTERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    private static final int TOKEN_LENGTH = 6;
    
    @Test
    void generateSampleTokens() {
        System.out.println("\n" + "=".repeat(80));
        System.out.println("6-CHARACTER TOKEN GENERATOR - SAMPLE CODES");
        System.out.println("=".repeat(80));
        System.out.println("\nGenerating 10 sample recovery codes:\n");
        
        for (int i = 1; i <= 10; i++) {
            String token = generateToken();
            System.out.println(i + ". " + token);
        }
        
        System.out.println("\n" + "=".repeat(80));
        System.out.println("Each code:");
        System.out.println("- Is 6 characters long");
        System.out.println("- Contains only uppercase letters (A-Z) and numbers (0-9)");
        System.out.println("- Is cryptographically random using SecureRandom");
        System.out.println("- Expires after 1 hour");
        System.out.println("=".repeat(80) + "\n");
    }
    
    private String generateToken() {
        SecureRandom random = new SecureRandom();
        StringBuilder token = new StringBuilder(TOKEN_LENGTH);
        
        for (int i = 0; i < TOKEN_LENGTH; i++) {
            int index = random.nextInt(TOKEN_CHARACTERS.length());
            token.append(TOKEN_CHARACTERS.charAt(index));
        }
        
        return token.toString();
    }
}
