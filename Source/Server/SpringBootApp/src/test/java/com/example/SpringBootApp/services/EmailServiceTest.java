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

        // Should not throw and should not call template builder
        assertDoesNotThrow(() -> svc.sendPasswordRecoveryEmail("to@example.com", "Alice", "ABC123"));
        verify(templateService, never()).buildCodigoRecuperacaoSenhaHtml(any(), any());
    }

    @Test
    void sendPasswordRecovery_configured_callsTemplateAndDoesSend() {
        when(templateService.buildCodigoRecuperacaoSenhaHtml("Bob", "T123")).thenReturn("<html>ok</html>");

        EmailService svc = new EmailService("some-key", templateService) {
            @Override
            protected CreateEmailResponse doSend(CreateEmailOptions params) {
                // simulate successful send without network
                return null;
            }
        };

        svc.sendPasswordRecoveryEmail("to@example.com", "Bob", "T123");
        verify(templateService, times(1)).buildCodigoRecuperacaoSenhaHtml("Bob", "T123");
    }

    @Test
    void sendPasswordRecovery_doSendThrows_wrappedAsRuntime() {
        when(templateService.buildCodigoRecuperacaoSenhaHtml("Eve", "X1")).thenReturn("<html>ok</html>");

        EmailService svc = new EmailService("some-key", templateService) {
            @Override
            protected CreateEmailResponse doSend(CreateEmailOptions params) throws ResendException {
                throw new ResendException("boom");
            }
        };

        assertThrows(RuntimeException.class, () -> svc.sendPasswordRecoveryEmail("to@example.com", "Eve", "X1"));
    }

}
