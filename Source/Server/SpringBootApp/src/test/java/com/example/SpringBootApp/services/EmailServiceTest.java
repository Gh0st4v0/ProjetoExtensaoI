package com.example.SpringBootApp.services;

import com.resend.core.exception.ResendException;
import com.resend.services.emails.model.CreateEmailResponse;
import com.resend.services.emails.model.CreateEmailOptions;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import static org.mockito.Mockito.*;
import static org.junit.jupiter.api.Assertions.*;

@ExtendWith(MockitoExtension.class)
class EmailServiceTest {

    @Mock
    EmailTemplateService templateService;

    @InjectMocks
    EmailService emailService;

    @Test
    void sendPasswordRecoveryEmail_logsAndReturnsWhenNoApiKey() {
        // Construct EmailService with not-configured key using constructor injection
        EmailService svc = new EmailService("not-configured", templateService);

        // Should not throw
        assertDoesNotThrow(() -> svc.sendPasswordRecoveryEmail("to@example.com", "Alice", "ABC123"));
    }

}
