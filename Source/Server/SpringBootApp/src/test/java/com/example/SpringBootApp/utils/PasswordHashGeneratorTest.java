package com.example.SpringBootApp.utils;

import org.junit.jupiter.api.Test;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

public class PasswordHashGeneratorTest {
    
    @Test
    void generatePasswordHashForManualInsertion() {
        BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();
        
        String plainPassword = "1234";
        String hashedPassword = encoder.encode(plainPassword);
        
        System.out.println("\n" + "=".repeat(80));
        System.out.println("PASSWORD HASH GENERATOR");
        System.out.println("=".repeat(80));
        System.out.println("\nPlain Password: " + plainPassword);
        System.out.println("Hashed Password: " + hashedPassword);
        System.out.println("\n" + "=".repeat(80));
        System.out.println("SQL INSERT STATEMENT");
        System.out.println("=".repeat(80));
        System.out.println("\nINSERT INTO usuario (nome, senha, nivel_acesso, email, ultimo_email_alteracao)");
        System.out.println("VALUES (");
        System.out.println("  'Gustavo',");
        System.out.println("  '" + hashedPassword + "',");
        System.out.println("  'ADMIN',");
        System.out.println("  'gustavo.135.andrade@gmail.com',");
        System.out.println("  CURRENT_TIMESTAMP");
        System.out.println(");\n");
        System.out.println("=".repeat(80));
        System.out.println("\n");
    }
}
