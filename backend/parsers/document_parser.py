import os
import re
from typing import List, Dict, Any, Optional

class DocumentParserError(Exception):
    pass

class ParsedPage:
    def __init__(self, page_number: int, text: str, sections: Optional[List[Dict[str, Any]]] = None):
        self.page_number = page_number
        self.text = text
        self.sections = sections or []

    def to_dict(self):
        return {
            "page_number": self.page_number,
            "text": self.text,
            "sections": self.sections
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
            blocks = page.get_text("dict")["blocks"]
            page_text = page.get_text("text").strip()
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
                sections=sections
            ))
            
        doc.close()
        avg_chars = total_extracted_chars / max(1, len(pages))
        if avg_chars < 30:
            raise DocumentParserError("This document appears to contain little extractable text. OCR may be required.")
            
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
        if avg_chars < 30:
            raise DocumentParserError("This document appears to contain little extractable text. OCR may be required.")
            
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
        current_word_count = 0
        
        for para in doc.paragraphs:
            text = para.text.strip()
            if not text:
                continue
                
            if para.style.name.startswith("Heading") or re.match(r"^\d+\.\d+", text):
                current_sections.append({"title": text, "style": para.style.name})
                
            current_page_text.append(text)
            current_word_count += len(text.split())
            
            if current_word_count >= 450:
                pages.append(ParsedPage(
                    page_number=current_page_num,
                    text="\n\n".join(current_page_text),
                    sections=current_sections
                ))
                current_page_num += 1
                current_page_text = []
                current_sections = []
                current_word_count = 0
                
        if current_page_text:
            pages.append(ParsedPage(
                page_number=current_page_num,
                text="\n\n".join(current_page_text),
                sections=current_sections
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
