from pathlib import Path

from reportlab.lib import colors
from reportlab.lib.enums import TA_CENTER, TA_LEFT
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.units import cm
from reportlab.platypus import (
    PageBreak,
    Paragraph,
    SimpleDocTemplate,
    Spacer,
    Table,
    TableStyle,
)


ROOT = Path(__file__).resolve().parent
OUTPUT = ROOT / "Relatorio_Achados_Revisao_Codigo_2026-04-29.pdf"

styles = getSampleStyleSheet()
styles.add(
    ParagraphStyle(
        name="TitleCarneUp",
        parent=styles["Title"],
        fontName="Helvetica-Bold",
        fontSize=22,
        textColor=colors.HexColor("#610005"),
        alignment=TA_CENTER,
        spaceAfter=12,
    )
)
styles.add(
    ParagraphStyle(
        name="SubtitleCarneUp",
        parent=styles["Normal"],
        fontName="Helvetica",
        fontSize=11,
        textColor=colors.HexColor("#5A403C"),
        alignment=TA_CENTER,
        spaceAfter=6,
    )
)
styles.add(
    ParagraphStyle(
        name="SectionCarneUp",
        parent=styles["Heading1"],
        fontName="Helvetica-Bold",
        fontSize=15,
        textColor=colors.HexColor("#610005"),
        spaceBefore=8,
        spaceAfter=8,
    )
)
styles.add(
    ParagraphStyle(
        name="FindingCarneUp",
        parent=styles["Heading2"],
        fontName="Helvetica-Bold",
        fontSize=12,
        textColor=colors.HexColor("#7F1D1D"),
        spaceBefore=8,
        spaceAfter=6,
    )
)
styles.add(
    ParagraphStyle(
        name="BodyCarneUp",
        parent=styles["BodyText"],
        fontName="Helvetica",
        fontSize=10,
        leading=14,
        alignment=TA_LEFT,
        spaceAfter=6,
    )
)


def meta_table(rows):
    table = Table(rows, colWidths=[3.1 * cm, 12.7 * cm])
    table.setStyle(
        TableStyle(
            [
                ("BACKGROUND", (0, 0), (0, -1), colors.HexColor("#F3F3F3")),
                ("BOX", (0, 0), (-1, -1), 0.5, colors.HexColor("#D7D7D7")),
                ("INNERGRID", (0, 0), (-1, -1), 0.5, colors.HexColor("#D7D7D7")),
                ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
                ("FONTNAME", (0, 0), (0, -1), "Helvetica-Bold"),
                ("FONTNAME", (1, 0), (1, -1), "Helvetica"),
                ("FONTSIZE", (0, 0), (-1, -1), 9.5),
                ("LEFTPADDING", (0, 0), (-1, -1), 6),
                ("RIGHTPADDING", (0, 0), (-1, -1), 6),
                ("TOPPADDING", (0, 0), (-1, -1), 5),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 5),
            ]
        )
    )
    return table


story = [
    Spacer(1, 2.2 * cm),
    Paragraph("Relatorio de Revisao Tecnica", styles["TitleCarneUp"]),
    Paragraph("Projeto CarneUp / Junior Prime Beef", styles["SubtitleCarneUp"]),
    Paragraph("Data: 29/04/2026", styles["SubtitleCarneUp"]),
    Spacer(1, 0.5 * cm),
]

intro_box = Table(
    [[Paragraph(
        "Objetivo: consolidar os principais erros identificados na revisao do codigo, "
        "com foco em banco de dados, integracao front/back, logica funcional e riscos "
        "para a operacao e para a pipeline.",
        styles["BodyCarneUp"],
    )]],
    colWidths=[16.3 * cm],
)
intro_box.setStyle(
    TableStyle(
        [
            ("BACKGROUND", (0, 0), (-1, -1), colors.HexColor("#F9E7E7")),
            ("BOX", (0, 0), (-1, -1), 0.8, colors.HexColor("#E7CACA")),
            ("LEFTPADDING", (0, 0), (-1, -1), 10),
            ("RIGHTPADDING", (0, 0), (-1, -1), 10),
            ("TOPPADDING", (0, 0), (-1, -1), 10),
            ("BOTTOMPADDING", (0, 0), (-1, -1), 10),
        ]
    )
)
story.extend([intro_box, PageBreak()])

story.append(Paragraph("Resumo Executivo", styles["SectionCarneUp"]))
story.append(
    Paragraph(
        "A revisao encontrou quatro problemas principais. Dois deles sao de severidade alta "
        "e afetam diretamente a confiabilidade do ambiente e a aderencia do sistema ao fluxo real de uso.",
        styles["BodyCarneUp"],
    )
)

summary = Table(
    [
        ["ID", "Severidade", "Area", "Resumo"],
        ["F1", "P1", "Banco / Flyway", "Cadeia de migrations nao sobe banco novo do zero."],
        ["F2", "P1", "Frontend / Integracao", "Telas principais ainda usam mock e nao persistem no backend."],
        ["F3", "P2", "Logica de Compra", "Edicao usa id do item local como se fosse id do produto."],
        ["F4", "P2", "Teste / Onboarding", "Teste do gerador de usuario ainda sugere nivel de acesso invalido."],
    ],
    colWidths=[1.2 * cm, 2.5 * cm, 4.1 * cm, 8.5 * cm],
)
summary.setStyle(
    TableStyle(
        [
            ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#610005")),
            ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
            ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
            ("FONTSIZE", (0, 0), (-1, -1), 9),
            ("BOX", (0, 0), (-1, -1), 0.5, colors.HexColor("#CCCCCC")),
            ("INNERGRID", (0, 0), (-1, -1), 0.5, colors.HexColor("#DDDDDD")),
            ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
            ("LEFTPADDING", (0, 0), (-1, -1), 6),
            ("RIGHTPADDING", (0, 0), (-1, -1), 6),
            ("TOPPADDING", (0, 0), (-1, -1), 5),
            ("BOTTOMPADDING", (0, 0), (-1, -1), 5),
        ]
    )
)
story.extend([summary, Spacer(1, 0.35 * cm)])

findings = [
    (
        "F1 - Flyway nao consegue criar banco novo com a cadeia atual de migrations",
        "P1",
        "Source/Server/SpringBootApp/src/main/resources/migrations/V2_DATABASE-MODEL.sql:3-48",
        "Impede bootstrap limpo do ambiente e torna o deploy dependente de um banco legado ja existente.",
        "A migration V2 volta a executar CREATE TABLE para entidades que ja existem em V1, como Produto, Categoria, Marca, Usuario, Compra e Venda.",
        "Reorganizar as migrations para que a sequencia completa consiga subir uma base vazia, ou consolidar um baseline novo e apos isso manter somente migrations incrementais.",
    ),
    (
        "F2 - Frontend principal ainda nao usa dados reais do backend",
        "P1",
        "Source/Client/carneup-frontend/src/views/StockView.jsx:133-190",
        "Mesmo com login funcional, o usuario nao opera sobre o Postgres nem sobre os endpoints principais do sistema.",
        "StockView, PurchaseView e DashboardView ainda usam mocks, console.log e alert em vez de chamadas HTTP para /products, /purchases e /sales.",
        "Criar camada de servicos para estoque, compras e vendas, substituir mocks locais por respostas reais da API e tratar loading, erro e persistencia.",
    ),
    (
        "F3 - Fluxo de edicao de compra usa id incorreto",
        "P2",
        "Source/Client/carneup-frontend/src/views/PurchaseView.jsx:41-63",
        "A edicao do item no carrinho nao reconstrói corretamente o formulario, comprometendo a manutencao da compra antes da gravacao.",
        "O item local do carrinho recebe id baseado em Date.now(), mas esse valor depois e reutilizado como selectedProductId.",
        "Separar claramente itemId e productId dentro do carrinho, e reconstruir o estado do formulario com base no productId real do produto selecionado.",
    ),
    (
        "F4 - Teste do gerador de usuario inicial esta desatualizado",
        "P2",
        "Source/Server/SpringBootApp/src/test/java/com/example/SpringBootApp/utils/PasswordHashGeneratorTest.java:23-29",
        "Pode induzir o time a criar manualmente usuario com nivel de acesso invalido para o schema atual.",
        "O utilitario principal imprime ADM, mas o teste auxiliar ainda imprime ADMIN.",
        "Atualizar o teste para refletir ADM e evitar ambiguidade no processo de onboarding tecnico.",
    ),
]

for title, sev, file_ref, impact, evidence, recommendation in findings:
    story.append(Paragraph(title, styles["FindingCarneUp"]))
    story.append(meta_table([["Severidade", sev], ["Arquivo", file_ref]]))
    story.append(Spacer(1, 0.15 * cm))
    story.append(Paragraph(f"<b>Impacto:</b> {impact}", styles["BodyCarneUp"]))
    story.append(Paragraph(f"<b>Evidencia:</b> {evidence}", styles["BodyCarneUp"]))
    story.append(Paragraph(f"<b>Recomendacao:</b> {recommendation}", styles["BodyCarneUp"]))

story.append(Paragraph("Conclusao", styles["SectionCarneUp"]))
story.append(
    Paragraph(
        "O projeto ja apresenta base funcional de autenticacao, testes de controller e pipeline inicial, "
        "mas ainda ha risco relevante para deploy limpo e para uso real do produto. O proximo ciclo de "
        "trabalho deve priorizar a consolidacao das migrations do banco e a integracao real das telas de "
        "estoque, compras e dashboard com os endpoints do backend.",
        styles["BodyCarneUp"],
    )
)
story.append(Paragraph("<b>Prioridade sugerida para o time:</b>", styles["BodyCarneUp"]))
for item in [
    "Corrigir a estrategia de migrations para bootstrap de banco novo.",
    "Integrar StockView, PurchaseView e DashboardView com o backend real.",
    "Corrigir o fluxo de edicao de compras no frontend.",
    "Atualizar o teste do gerador de usuario inicial para refletir ADM.",
]:
    story.append(Paragraph(f"• {item}", styles["BodyCarneUp"]))

doc = SimpleDocTemplate(
    str(OUTPUT),
    pagesize=A4,
    leftMargin=1.8 * cm,
    rightMargin=1.8 * cm,
    topMargin=1.6 * cm,
    bottomMargin=1.6 * cm,
)
doc.build(story)
print(OUTPUT)
