package com.example.SpringBootApp.services;

import org.springframework.stereotype.Service;

@Service
public class EmailTemplateService {

    public String buildCodigoRecuperacaoSenhaHtml(String userName, String token) {
        return """
                <!DOCTYPE html>
                <html lang="pt-BR">
                <head>
                    <meta charset="UTF-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <title>Codigo de recuperacao de senha</title>
                </head>
                <body style="margin:0;padding:0;background-color:#f4f4f4;font-family:Arial,sans-serif;">
                    <table role="presentation" style="width:100%%;border-collapse:collapse;">
                        <tr>
                            <td align="center" style="padding:32px 16px;">
                                <table role="presentation" style="width:100%%;max-width:600px;border-collapse:collapse;background:#ffffff;border-radius:12px;overflow:hidden;">
                                    <tr>
                                        <td style="padding:32px 28px 16px 28px;">
                                            <h1 style="margin:0;font-size:24px;line-height:1.3;color:#1f2937;">
                                                Recuperacao de senha
                                            </h1>
                                        </td>
                                    </tr>
                                    <tr>
                                        <td style="padding:0 28px;">
                                            <p style="margin:0 0 12px 0;font-size:16px;line-height:1.6;color:#374151;">
                                                Ola%s,
                                            </p>
                                            <p style="margin:0 0 18px 0;font-size:16px;line-height:1.6;color:#374151;">
                                                Recebemos uma solicitacao para redefinir sua senha. Use o codigo abaixo:
                                            </p>
                                        </td>
                                    </tr>
                                    <tr>
                                        <td align="center" style="padding:8px 28px 24px 28px;">
                                            <div style="display:inline-block;padding:16px 24px;border:2px dashed #2563eb;border-radius:10px;background:#eff6ff;">
                                                <span style="font-size:34px;letter-spacing:8px;font-weight:700;color:#1d4ed8;font-family:'Courier New',monospace;">%s</span>
                                            </div>
                                        </td>
                                    </tr>
                                    <tr>
                                        <td style="padding:0 28px 24px 28px;">
                                            <p style="margin:0 0 8px 0;font-size:14px;line-height:1.6;color:#4b5563;">
                                                Este codigo expira em 1 hora.
                                            </p>
                                            <p style="margin:0;font-size:14px;line-height:1.6;color:#4b5563;">
                                                Se voce nao solicitou esta recuperacao, ignore este email.
                                            </p>
                                        </td>
                                    </tr>
                                    <tr>
                                        <td style="padding:14px 28px;background:#f9fafb;border-top:1px solid #e5e7eb;">
                                            <p style="margin:0;font-size:12px;line-height:1.5;color:#6b7280;text-align:center;">
                                                Digite este codigo no formulario de redefinicao de senha.
                                            </p>
                                        </td>
                                    </tr>
                                </table>
                            </td>
                        </tr>
                    </table>
                </body>
                </html>
                """.formatted(
                userName != null && !userName.isBlank() ? " " + userName : "",
                token
        );
    }
}
