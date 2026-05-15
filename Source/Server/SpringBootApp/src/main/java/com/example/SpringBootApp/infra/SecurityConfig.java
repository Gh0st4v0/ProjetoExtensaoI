package com.example.SpringBootApp.infra;

import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.List;

@Configuration
@EnableWebSecurity
@RequiredArgsConstructor
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthenticationFilter;

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                .cors(Customizer.withDefaults())
                .csrf(AbstractHttpConfigurer::disable)
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authorizeHttpRequests(auth -> auth
                        // Login e recuperação de senha — público
                        .requestMatchers("/sessions", "/sessions/**").permitAll()

                        // Swagger — público
                        .requestMatchers("/swagger-ui/**", "/v3/api-docs/**").permitAll()

                        // Descartes — somente ADM
                        .requestMatchers("/descartes", "/descartes/**").hasRole("ADM")

                        // Produtos — leitura para todos, escrita somente ADM
                        .requestMatchers(HttpMethod.GET, "/products", "/products/**").authenticated()
                        .requestMatchers(HttpMethod.POST, "/products").hasRole("ADM")
                        .requestMatchers(HttpMethod.PUT, "/products/**").hasRole("ADM")
                        .requestMatchers(HttpMethod.PATCH, "/products/**").hasRole("ADM")
                        .requestMatchers(HttpMethod.DELETE, "/products/**").hasRole("ADM")

                        // Marcas — leitura para todos, escrita somente ADM
                        .requestMatchers(HttpMethod.GET, "/brands", "/brands/**").authenticated()
                        .requestMatchers(HttpMethod.POST, "/brands").hasRole("ADM")
                        .requestMatchers(HttpMethod.PUT, "/brands/**").hasRole("ADM")
                        .requestMatchers(HttpMethod.DELETE, "/brands/**").hasRole("ADM")

                        // Categorias — leitura para todos, escrita somente ADM
                        .requestMatchers(HttpMethod.GET, "/categories", "/categories/**").authenticated()
                        .requestMatchers(HttpMethod.POST, "/categories").hasRole("ADM")
                        .requestMatchers(HttpMethod.PUT, "/categories/**").hasRole("ADM")
                        .requestMatchers(HttpMethod.DELETE, "/categories/**").hasRole("ADM")

                        // Usuários — listagem e criação somente ADM; PUT permite self-edit (verificado no controller)
                        .requestMatchers(HttpMethod.GET, "/users").hasRole("ADM")
                        .requestMatchers(HttpMethod.POST, "/users").hasRole("ADM")
                        .requestMatchers(HttpMethod.DELETE, "/users/**").hasRole("ADM")
                        .requestMatchers(HttpMethod.PUT, "/users/**").authenticated()

                        // Relatórios — somente ADM
                        .requestMatchers("/reports", "/reports/**").hasRole("ADM")

                        // Qualquer outra rota autenticada
                        .anyRequest().authenticated()
                )
                .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOriginPatterns(List.of("*"));
        configuration.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"));
        configuration.setAllowedHeaders(List.of("*"));
        configuration.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }
}
