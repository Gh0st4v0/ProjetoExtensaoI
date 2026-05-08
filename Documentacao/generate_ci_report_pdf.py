from pathlib import Path
import textwrap


ROOT = Path(__file__).resolve().parent
SOURCE = ROOT / "Relatorio_CI_GitHub_Actions_2026-05-06.md"
OUTPUT = ROOT / "Relatorio_CI_GitHub_Actions_2026-05-06.pdf"

PAGE_WIDTH = 595
PAGE_HEIGHT = 842
LEFT = 56
RIGHT = 56
TOP = 58
BOTTOM = 56
LINE_HEIGHT = 14


def pdf_escape(text: str) -> str:
    return text.replace("\\", "\\\\").replace("(", "\\(").replace(")", "\\)")


def clean_text(text: str) -> str:
    replacements = {
        "\u2013": "-",
        "\u2014": "-",
        "\u2018": "'",
        "\u2019": "'",
        "\u201c": '"',
        "\u201d": '"',
    }
    for old, new in replacements.items():
        text = text.replace(old, new)
    return text.encode("latin-1", errors="replace").decode("latin-1")


def wrap_line(text: str, width: int) -> list[str]:
    if not text:
        return [""]
    return textwrap.wrap(
        text,
        width=width,
        break_long_words=False,
        replace_whitespace=False,
        drop_whitespace=True,
    ) or [""]


class PdfBuilder:
    def __init__(self) -> None:
        self.pages: list[list[str]] = []
        self.current: list[str] = []
        self.y = PAGE_HEIGHT - TOP

    def new_page(self) -> None:
        if self.current:
            self.pages.append(self.current)
        self.current = []
        self.y = PAGE_HEIGHT - TOP

    def ensure_space(self, needed: int = LINE_HEIGHT) -> None:
        if self.y - needed < BOTTOM:
            self.new_page()

    def add_text(self, text: str, size: int = 10, font: str = "F1", indent: int = 0, gap: int = 0) -> None:
        self.ensure_space(LINE_HEIGHT + gap)
        x = LEFT + indent
        escaped = pdf_escape(clean_text(text))
        self.current.append(f"BT /{font} {size} Tf {x} {self.y} Td ({escaped}) Tj ET")
        self.y -= LINE_HEIGHT + gap

    def add_wrapped(self, text: str, size: int = 10, font: str = "F1", indent: int = 0, width: int = 90, gap_after: int = 4) -> None:
        for line in wrap_line(clean_text(text), width):
            self.add_text(line, size=size, font=font, indent=indent)
        self.y -= gap_after

    def finish(self) -> None:
        if self.current:
            self.pages.append(self.current)
            self.current = []


def render_markdown(md: str) -> PdfBuilder:
    pdf = PdfBuilder()
    in_code = False

    for raw_line in md.splitlines():
        line = raw_line.rstrip()

        if line.startswith("```"):
            in_code = not in_code
            pdf.y -= 4
            continue

        if in_code:
            pdf.add_wrapped(line, size=8, font="F2", indent=14, width=86, gap_after=0)
            continue

        if not line:
            pdf.y -= 6
            if pdf.y < BOTTOM:
                pdf.new_page()
            continue

        if line.startswith("# "):
            pdf.ensure_space(34)
            pdf.add_wrapped(line[2:], size=18, font="F1", width=52, gap_after=10)
            continue

        if line.startswith("## "):
            pdf.ensure_space(28)
            pdf.add_wrapped(line[3:], size=14, font="F1", width=68, gap_after=6)
            continue

        if line.startswith("### "):
            pdf.ensure_space(24)
            pdf.add_wrapped(line[4:], size=12, font="F1", width=78, gap_after=4)
            continue

        if line.startswith("- "):
            pdf.add_wrapped("- " + line[2:], size=10, indent=12, width=82, gap_after=1)
            continue

        if len(line) > 2 and line[0].isdigit() and ". " in line[:5]:
            pdf.add_wrapped(line, size=10, indent=12, width=82, gap_after=1)
            continue

        pdf.add_wrapped(line, size=10, width=92, gap_after=3)

    pdf.finish()
    return pdf


def build_pdf(builder: PdfBuilder) -> bytes:
    objects: list[bytes] = []

    def add_object(content: str | bytes) -> int:
        if isinstance(content, str):
            content = content.encode("latin-1")
        objects.append(content)
        return len(objects)

    catalog_id = add_object("<< /Type /Catalog /Pages 2 0 R >>")
    pages_placeholder_id = add_object(b"")
    font_helvetica_id = add_object("<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>")
    font_courier_id = add_object("<< /Type /Font /Subtype /Type1 /BaseFont /Courier >>")

    page_ids: list[int] = []
    for page_lines in builder.pages:
        stream = "\n".join(page_lines).encode("latin-1")
        stream_id = add_object(
            b"<< /Length " + str(len(stream)).encode("ascii") + b" >>\nstream\n" + stream + b"\nendstream"
        )
        page_id = add_object(
            f"<< /Type /Page /Parent {pages_placeholder_id} 0 R "
            f"/MediaBox [0 0 {PAGE_WIDTH} {PAGE_HEIGHT}] "
            f"/Resources << /Font << /F1 {font_helvetica_id} 0 R /F2 {font_courier_id} 0 R >> >> "
            f"/Contents {stream_id} 0 R >>"
        )
        page_ids.append(page_id)

    kids = " ".join(f"{page_id} 0 R" for page_id in page_ids)
    objects[pages_placeholder_id - 1] = f"<< /Type /Pages /Kids [{kids}] /Count {len(page_ids)} >>".encode("latin-1")

    output = bytearray(b"%PDF-1.4\n%\xe2\xe3\xcf\xd3\n")
    offsets = [0]
    for index, content in enumerate(objects, start=1):
        offsets.append(len(output))
        output.extend(f"{index} 0 obj\n".encode("ascii"))
        output.extend(content)
        output.extend(b"\nendobj\n")

    xref_pos = len(output)
    output.extend(f"xref\n0 {len(objects) + 1}\n".encode("ascii"))
    output.extend(b"0000000000 65535 f \n")
    for offset in offsets[1:]:
        output.extend(f"{offset:010d} 00000 n \n".encode("ascii"))
    output.extend(
        f"trailer\n<< /Size {len(objects) + 1} /Root {catalog_id} 0 R >>\n"
        f"startxref\n{xref_pos}\n%%EOF\n".encode("ascii")
    )
    return bytes(output)


def main() -> None:
    markdown = SOURCE.read_text(encoding="utf-8")
    builder = render_markdown(markdown)
    OUTPUT.write_bytes(build_pdf(builder))
    print(OUTPUT)


if __name__ == "__main__":
    main()
