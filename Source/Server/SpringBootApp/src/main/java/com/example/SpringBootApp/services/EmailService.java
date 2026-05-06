package com.example.SpringBootApp.services;

import com.resend.Resend;
import com.resend.core.exception.ResendException;
import com.resend.services.emails.model.CreateEmailOptions;
import com.resend.services.emails.model.CreateEmailResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

@Service
@Slf4j
public class EmailService {

    private final EmailTemplateService emailTemplateService;
    private final String apiKey;
    private final Resend resend;

    @Value("${app.email.from:onboarding@resend.dev}")
    private String fromEmail;

    public EmailService(
            @Value("${RESEND_API_KEY:not-configured}")
            String apiKey,
            EmailTemplateService emailTemplateService
    ) {
        this.apiKey = apiKey;
        this.emailTemplateService = emailTemplateService;
        this.resend = new Resend(apiKey);
    }

    public void sendPasswordRecoveryEmail(String toEmail, String userName, String token) {
        // Check if API key is configured
        if ("not-configured".equals(apiKey) || apiKey == null || apiKey.trim().isEmpty()) {
            log.warn("RESEND_API_KEY not configured. Email would be sent to: {}. Recovery code: {}", 
                    toEmail, token);
            log.warn("To enable email sending, set the RESEND_API_KEY environment variable.");
            return;
        }
        
        try {
            String htmlContent = emailTemplateService.buildCodigoRecuperacaoSenhaHtml(userName, token);

            CreateEmailOptions params = CreateEmailOptions.builder()
                    .from(fromEmail)
                    .to(toEmail)
                    .subject("Codigo de recuperacao de senha")
                    .html(htmlContent)
                    .build();

            CreateEmailResponse response = resend.emails().send(params);
            log.info("Password recovery email sent successfully. Email ID: {}", response.getId());
            
        } catch (ResendException e) {
            log.error("Failed to send password recovery email to: {}", toEmail, e);
            throw new RuntimeException("Failed to send recovery email", e);
        }
    }
}
