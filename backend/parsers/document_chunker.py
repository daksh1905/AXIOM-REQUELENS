from typing import List, Dict, Any
from backend.parsers.document_parser import ParsedPage

class DocumentChunk:
    def __init__(self, chunk_id: str, page_number: int, section: str, text: str, word_count: int):
        self.chunk_id = chunk_id
        self.page_number = page_number
        self.section = section
        self.text = text
        self.word_count = word_count

    def to_dict(self) -> Dict[str, Any]:
        return {
            "chunk_id": self.chunk_id,
            "page_number": self.page_number,
            "section": self.section,
            "text": self.text,
            "word_count": self.word_count
        }

class DocumentChunker:
    @staticmethod
    def chunk_pages(pages: List[ParsedPage], max_chunk_words: int = 500) -> List[DocumentChunk]:
        chunks = []
        chunk_idx = 1
        
        for p in pages:
            page_text = p.text
            paragraphs = [para.strip() for para in page_text.split("\n\n") if para.strip()]
            
            section_name = p.sections[0]["title"] if p.sections else f"Page {p.page_number}"
            
            current_chunk_words = []
            
            for para in paragraphs:
                words = para.split()
                if len(current_chunk_words) + len(words) > max_chunk_words and current_chunk_words:
                    chunk_text = " ".join(current_chunk_words)
                    chunks.append(DocumentChunk(
                        chunk_id=f"CHK-{chunk_idx:04d}",
                        page_number=p.page_number,
                        section=section_name,
                        text=chunk_text,
                        word_count=len(current_chunk_words)
                    ))
                    chunk_idx += 1
                    current_chunk_words = []
                    
                current_chunk_words.extend(words)
                
            if current_chunk_words:
                chunk_text = " ".join(current_chunk_words)
                chunks.append(DocumentChunk(
                    chunk_id=f"CHK-{chunk_idx:04d}",
                    page_number=p.page_number,
                    section=section_name,
                    text=chunk_text,
                    word_count=len(current_chunk_words)
                ))
                chunk_idx += 1
                
        return chunks

