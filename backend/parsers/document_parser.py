import os
import re
from typing import List, Dict, Any, Optional

class DocumentParserError(Exception):
    pass

class ParsedPage:
    def __init__(
        self,
        page_number: int,
        text: str,
        sections: Optional[List[Dict[str, Any]]] = None,
        tables: Optional[List[List[List[str]]]] = None
    ):
        self.page_number = page_number
        self.text = text
        self.sections = sections or []
        self.tables = tables or []

    def to_dict(self):
        return {
            "page_number": self.page_number,
            "text": self.text,
            "sections": self.sections,
            "tables": self.tables
        }

class DocumentParser:
    @staticmethod
    def parse_pdf(file_path: str) -> List[ParsedPage]:
        # Try PyMuPDF (fitz) first, fallback to pypdf
        try:
            import fitz
            return DocumentParser._parse_pdf_fitz(file_path)
        except ImportError:
            return DocumentParser._parse_pdf_pypdf(file_path)

    @staticmethod
    def _parse_pdf_fitz(file_path: str) -> List[ParsedPage]:
        import fitz
        try:
            doc = fitz.open(file_path)
        except Exception as e:
            raise DocumentParserError(f"Invalid or corrupted PDF file: {str(e)}")
            
        if doc.is_encrypted:
            raise DocumentParserError("Password protected PDF is not supported.")
        if doc.page_count == 0:
            raise DocumentParserError("PDF document is empty.")
            
        pages = []
        total_extracted_chars = 0
        
        for i in range(doc.page_count):
            page = doc.load_page(i)
            page_num = i + 1
            blocks = page.get_text("dict").get("blocks", [])
            page_text = page.get_text("text").strip()
            
            # --- Scanned Page OCR Fallback ---
            if len(page_text) < 40 and hasattr(page, "get_textpage_ocr"):
                try:
                    ocr_page = page.get_textpage_ocr(language="eng", dpi=300, full=True)
                    ocr_text = ocr_page.extractText().strip()
                    if len(ocr_text) > len(page_text):
                        page_text = ocr_text
                except Exception as ocr_err:
                    print(f"[DocumentParser] OCR notice on page {page_num}: {ocr_err}")

            # --- Native Table Extraction (PyMuPDF find_tables) ---
            extracted_tables = []
            if hasattr(page, "find_tables"):
                try:
                    tabs = page.find_tables()
                    for tab in tabs:
                        t_data = tab.extract()
                        if t_data and len(t_data) > 1:
                            cleaned_table = []
                            for row in t_data:
                                cleaned_row = [str(c or "").strip().replace("\n", " ") for c in row]
                                if any(cleaned_row):
                                    cleaned_table.append(cleaned_row)
                            if cleaned_table:
                                extracted_tables.append(cleaned_table)
                                md_table = "\n".join([" | ".join(row) for row in cleaned_table])
                                page_text += f"\n\n[TABLE SPECIFICATION (Page {page_num})]:\n{md_table}"
                except Exception as t_err:
                    print(f"[DocumentParser] Table extraction notice on page {page_num}: {t_err}")

            total_extracted_chars += len(page_text)
            
            sections = []
            current_section = "General"
            
            for b in blocks:
                if "lines" in b:
                    for line in b["lines"]:
                        for span in line["spans"]:
                            span_text = span["text"].strip()
                            if span.get("size", 10) > 13 or re.match(r"^(?:Section|\d+\.|\d+\.\d+|[A-Z0-9\.\s]{3,30}:)", span_text):
                                if len(span_text) > 3 and len(span_text) < 80:
                                    current_section = span_text
                                    sections.append({
                                        "title": current_section,
                                        "font_size": span.get("size", 10)
                                    })
            
            pages.append(ParsedPage(
                page_number=page_num,
                text=page_text,
                sections=sections,
                tables=extracted_tables
            ))
            
        doc.close()
        avg_chars = total_extracted_chars / max(1, len(pages))
        if avg_chars < 15:
            raise DocumentParserError("This document contains little extractable text even after OCR attempts.")
            
        return pages

    @staticmethod
    def _parse_pdf_pypdf(file_path: str) -> List[ParsedPage]:
        import pypdf
        try:
            reader = pypdf.PdfReader(file_path)
        except Exception as e:
            raise DocumentParserError(f"Invalid or corrupted PDF file: {str(e)}")
            
        if reader.is_encrypted:
            raise DocumentParserError("Password protected PDF is not supported.")
        if len(reader.pages) == 0:
            raise DocumentParserError("PDF document is empty.")
            
        pages = []
        total_extracted_chars = 0
        
        for idx, page in enumerate(reader.pages):
            page_num = idx + 1
            text = (page.extract_text() or "").strip()
            total_extracted_chars += len(text)
            
            # Extract section headings from text patterns
            sections = []
            for line in text.split("\n")[:10]:
                line_str = line.strip()
                if re.match(r"^(?:Section|\d+\.|\d+\.\d+|[A-Z0-9\.\s]{3,30}:)", line_str) and len(line_str) < 80:
                    sections.append({"title": line_str, "font_size": 14})
                    
            pages.append(ParsedPage(
                page_number=page_num,
                text=text,
                sections=sections
            ))
            
        avg_chars = total_extracted_chars / max(1, len(pages))
        if avg_chars < 15:
            raise DocumentParserError("This document appears to contain little extractable text.")
            
        return pages

    @staticmethod
    def parse_docx(file_path: str) -> List[ParsedPage]:
        import docx
        try:
            doc = docx.Document(file_path)
        except Exception as e:
            raise DocumentParserError(f"Malformed or unsupported DOCX file: {str(e)}")
            
        pages = []
        current_page_num = 1
        current_page_text = []
        current_sections = []
        current_tables = []
        current_word_count = 0

        # Helper to process blocks (paragraphs and tables)
        for child in doc.element.body:
            tag = child.tag.split("}")[-1] if "}" in child.tag else child.tag
            
            if tag == "p":
                text = child.text.strip() if child.text else ""
                # Also collect text from child runs
                if not text:
                    text = "".join(node.text for node in child.iter() if node.text and node.tag.endswith("t")).strip()
                if not text:
                    continue
                
                if re.match(r"^(?:Section|\d+\.|\d+\.\d+|[A-Z0-9\.\s]{3,30}:)", text):
                    current_sections.append({"title": text, "style": "Heading"})
                    
                current_page_text.append(text)
                current_word_count += len(text.split())

            elif tag == "tbl":
                # Parse DOCX table
                table_rows = []
                for tr in child.iter():
                    if tr.tag.endswith("tr"):
                        row_cells = []
                        for tc in tr.iter():
                            if tc.tag.endswith("tc"):
                                cell_text = "".join(node.text for node in tc.iter() if node.text and node.tag.endswith("t")).strip()
                                row_cells.append(cell_text.replace("\n", " "))
                        if any(row_cells):
                            table_rows.append(row_cells)
                
                if table_rows:
                    current_tables.append(table_rows)
                    md_rows = [" | ".join(row) for row in table_rows]
                    table_md = f"\n[TABLE DATA (Page {current_page_num})]:\n" + "\n".join(md_rows)
                    current_page_text.append(table_md)
                    current_word_count += sum(len(r.split()) for r in md_rows)

            if current_word_count >= 500:
                pages.append(ParsedPage(
                    page_number=current_page_num,
                    text="\n\n".join(current_page_text),
                    sections=current_sections,
                    tables=current_tables
                ))
                current_page_num += 1
                current_page_text = []
                current_sections = []
                current_tables = []
                current_word_count = 0
                
        if current_page_text:
            pages.append(ParsedPage(
                page_number=current_page_num,
                text="\n\n".join(current_page_text),
                sections=current_sections,
                tables=current_tables
            ))
            
        if not pages:
            raise DocumentParserError("DOCX document has no readable text content.")
            
        return pages

    @classmethod
    def parse_file(cls, file_path: str) -> List[ParsedPage]:
        ext = os.path.splitext(file_path)[1].lower()
        if ext == ".pdf":
            return cls.parse_pdf(file_path)
        elif ext in [".docx", ".doc"]:
            return cls.parse_docx(file_path)
        else:
            raise DocumentParserError(f"Unsupported file format '{ext}'. Only .pdf and .docx are supported.")
