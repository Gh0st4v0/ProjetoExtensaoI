package com.example.SpringBootApp.controllers;

import com.example.SpringBootApp.exceptions.ResourceNotFoundException;
import com.example.SpringBootApp.models.AccessLevel;
import com.example.SpringBootApp.models.Usuario;
import com.example.SpringBootApp.repositories.UsuarioRepository;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.net.URI;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/users")
@RequiredArgsConstructor
public class UsuarioController {

    private final UsuarioRepository usuarioRepository;
    private final PasswordEncoder passwordEncoder;

    @GetMapping
    public ResponseEntity<List<Map<String, Object>>> listUsers() {
        List<Map<String, Object>> users = usuarioRepository.findAll().stream()
            .map(u -> {
                Map<String, Object> m = new java.util.LinkedHashMap<>();
                m.put("id", u.getId());
                m.put("nome", u.getNome());
                m.put("email", u.getEmail());
                m.put("nivelAcesso", u.getAccessLevel() != null ? u.getAccessLevel().name() : null);
                return m;
            }).collect(Collectors.toList());
        return ResponseEntity.ok(users);
    }

    @PostMapping
    public ResponseEntity<?> createUser(@Valid @RequestBody CreateUserDTO dto) {
        Usuario u = new Usuario();
        u.setNome(dto.getNome());
        u.setEmail(dto.getEmail());
        u.setSenha(passwordEncoder.encode(dto.getSenha()));
        u.setAccessLevel("ADM".equalsIgnoreCase(dto.getNivelAcesso()) ? AccessLevel.ADM : AccessLevel.USUARIO);
        usuarioRepository.save(u);
        return ResponseEntity.created(URI.create("/users/" + u.getId())).build();
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteUser(@PathVariable Long id) {
        Usuario u = usuarioRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("User not found: " + id));
        usuarioRepository.delete(u);
        return ResponseEntity.noContent().build();
    }

    @Data
    static class CreateUserDTO {
        @NotBlank
        private String nome;
        @NotBlank @Email
        private String email;
        @NotBlank
        private String senha;
        private String nivelAcesso;
    }
}
