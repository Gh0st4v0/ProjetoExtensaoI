from pathlib import Path

from reportlab.lib import colors
from reportlab.lib.enums import TA_CENTER
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.units import cm
from reportlab.platypus import PageBreak, Paragraph, SimpleDocTemplate, Spacer, Table, TableStyle


ROOT = Path(__file__).resolve().parent
OUTPUT = ROOT / "Relatorio_Epico_Estoque_Achados_2026-04-29.pdf"

styles = getSampleStyleSheet()
styles.add(
    ParagraphStyle(
        name="EpicTitle",
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
        name="EpicSubtitle",
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
        name="EpicSection",
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
        name="EpicFinding",
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
        name="EpicBody",
        parent=styles["BodyText"],
        fontName="Helvetica",
        fontSize=10,
        leading=14,
        spaceAfter=6,
    )
)


def meta_table(rows):
    table = Table(rows, colWidths=[3.2 * cm, 12.6 * cm])
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
    Spacer(1, 2.1 * cm),
    Paragraph("Relatorio Tecnico do Epico de Estoque", styles["EpicTitle"]),
    Paragraph("RF03, RF04, RF05 e RF08", styles["EpicSubtitle"]),
    Paragraph("Projeto CarneUp / Junior Prime Beef", styles["EpicSubtitle"]),
    Paragraph("Data: 29/04/2026", styles["EpicSubtitle"]),
    Spacer(1, 0.5 * cm),
]

intro = Table(
    [[Paragraph(
        "Objetivo: consolidar os achados da revisao tecnica do epico de ciclo de vida do produto "
        "no estabelecimento, com foco em cadastro de estoque, entrada de compras, busca e gestao de descartes.",
        styles["EpicBody"],
    )]],
    colWidths=[16.2 * cm],
)
intro.setStyle(
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
story.extend([intro, PageBreak()])

story.append(Paragraph("Resumo Executivo", styles["EpicSection"]))
story.append(
    Paragraph(
        "A revisao do epico identificou seis lacunas principais. Tres delas sao de severidade alta "
        "e afetam diretamente a entrega funcional dos requisitos RF03, RF04, RF05 e RF08.",
        styles["EpicBody"],
    )
)

summary = Table(
    [
        ["ID", "Severidade", "RF", "Resumo"],
        ["F1", "P1", "RF04", "API exige data obrigatoria e nao permite o padrao de hoje."],
        ["F2", "P1", "RF04", "Backend aceita data de validade vencida."],
        ["F3", "P1", "RF03-05-08", "Frontend central ainda nao usa a API real."],
        ["F4", "P2", "RF03", "Exclusao de marca/categoria esta mais restritiva que o requisito."],
        ["F5", "P2", "RF08", "Descarte so cobre criacao; falta listar e remover."],
        ["F6", "P2", "RF04", "Edicao de compra no frontend segue inconsistente."],
    ],
    colWidths=[1.1 * cm, 2.1 * cm, 2.3 * cm, 10.7 * cm],
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
        "F1 - RF04 exige data padrao atual, mas a API torna a data obrigatoria",
        "P1",
        "RF04",
        "Source/Server/SpringBootApp/src/main/java/com/example/SpringBootApp/DTOs/CompraCreateDTO.java:18-19",
        "Uma compra sem data e rejeitada pela validacao antes de chegar na regra de negocio, contrariando o requisito que permite usar o dia atual como padrao.",
        "Remover a obrigatoriedade do campo `date` no DTO ou torná-lo opcional, preservando no servico a regra de fallback para `LocalDate.now()`.",
    ),
    (
        "F2 - RF04 pede validacao de validade, mas o backend aceita lote vencido",
        "P1",
        "RF04",
        "Source/Server/SpringBootApp/src/main/java/com/example/SpringBootApp/services/InventarioService.java:48-57",
        "Produtos pereciveis podem ser cadastrados com data de validade anterior a data atual, o que viola explicitamente o requisito.",
        "Adicionar validacao para rejeitar `expiringDate` menor que `LocalDate.now()` nos itens de compra pereciveis.",
    ),
    (
        "F3 - RF03/RF04/RF05/RF08 ainda nao estao entregues no frontend contra a API real",
        "P1",
        "RF03, RF04, RF05, RF08",
        "Source/Client/carneup-frontend/src/views/StockView.jsx:133-190",
        "As principais telas do epico operam com mocks locais, `console.log` e `alert`, sem persistir no backend nem refletir o Postgres.",
        "Criar camada de servicos para produtos, marcas, categorias, compras, busca e descartes; substituir mocks por chamadas reais aos endpoints do backend.",
    ),
    (
        "F4 - Regra de exclusao de marca/categoria esta mais restritiva que o RF03",
        "P2",
        "RF03",
        "Source/Server/SpringBootApp/src/main/java/com/example/SpringBootApp/services/CatalogoService.java:222-245",
        "Hoje a exclusao e bloqueada se houver qualquer produto associado, mesmo sem movimentacao, enquanto o requisito fala em bloquear apenas quando houver historico de compra ou venda.",
        "Ajustar a regra para considerar movimentacoes efetivas antes de bloquear exclusao de marca ou categoria.",
    ),
    (
        "F5 - RF08 esta parcial: descarte cria registro, mas nao oferece listagem nem remocao",
        "P2",
        "RF08",
        "Source/Server/SpringBootApp/src/main/java/com/example/SpringBootApp/controllers/CompraController.java:35-37",
        "O backend ja cria descarte, mas nao existe fluxo dedicado para listar descartes na gestao de estoque nem para apaga-los depois.",
        "Criar endpoints para listar e remover descartes e integrar essa informacao na tela de estoque.",
    ),
    (
        "F6 - Fluxo de edicao de compra no frontend segue inconsistente com RF04",
        "P2",
        "RF04",
        "Source/Client/carneup-frontend/src/views/PurchaseView.jsx:41-63",
        "A tela nao chama a API de atualizacao e ainda mistura o id do item local com o id do produto ao remontar a edicao, o que compromete a UX e a consistencia funcional.",
        "Separar `itemId` de `productId`, implementar chamada ao endpoint de update e mostrar alerta visual antes de alterar historico.",
    ),
]

for title, severity, rf, file_ref, impact, recommendation in findings:
    story.append(Paragraph(title, styles["EpicFinding"]))
    story.append(meta_table([["Severidade", severity], ["RF", rf], ["Arquivo", file_ref]]))
    story.append(Spacer(1, 0.15 * cm))
    story.append(Paragraph(f"<b>Impacto:</b> {impact}", styles["EpicBody"]))
    story.append(Paragraph(f"<b>Recomendacao:</b> {recommendation}", styles["EpicBody"]))

story.append(Paragraph("Conclusao", styles["EpicSection"]))
story.append(
    Paragraph(
        "O backend ja possui parte relevante da espinha dorsal do epico, especialmente em cadastro, busca e movimentacao, "
        "mas o epico ainda nao pode ser considerado concluido porque o frontend nao entrega os fluxos reais ao usuario "
        "e ainda existem regras de negocio desalinhadas com os requisitos.",
        styles["EpicBody"],
    )
)
story.append(Paragraph("<b>Prioridade sugerida para o time:</b>", styles["EpicBody"]))
for item in [
    "Corrigir o contrato de criacao de compra para suportar data padrao atual.",
    "Validar data de validade para impedir lotes vencidos.",
    "Integrar StockView, PurchaseView e fluxos de descarte aos endpoints reais.",
    "Completar o ciclo de descartes com listagem e remocao.",
    "Ajustar a regra de exclusao de marca e categoria para refletir o RF03.",
]:
    story.append(Paragraph(f"• {item}", styles["EpicBody"]))

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
