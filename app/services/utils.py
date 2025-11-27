# app/services/utils.py
import PyPDF2
from typing import List
import io


def extract_text_from_pdf(pdf_file) -> str:
    """
    Extract text from PDF file
    
    Args:
        pdf_file: File-like object or BytesIO containing PDF
        
    Returns:
        str: Extracted text from all pages
    """
    try:
        pdf_reader = PyPDF2.PdfReader(pdf_file)
        text = ""
        
        for page in pdf_reader.pages:
            text += page.extract_text() + "\n"
        
        return text.strip()
    except Exception as e:
        raise Exception(f"Error extracting text from PDF: {str(e)}")


def chunk_text(text: str, chunk_size: int = 500, overlap: int = 50) -> List[str]:
    """
    Split text into chunks with overlap
    
    Args:
        text: Text to chunk
        chunk_size: Size of each chunk in characters
        overlap: Overlap between chunks in characters
        
    Returns:
        List[str]: List of text chunks
    """
    chunks = []
    
    # Remove extra whitespace
    text = " ".join(text.split())
    
    # Create chunks
    start = 0
    while start < len(text):
        end = start + chunk_size
        chunk = text[start:end].strip()
        
        if chunk:
            chunks.append(chunk)
        
        start += (chunk_size - overlap)
    
    return chunks


def clean_text(text: str) -> str:
    """Clean and normalize text"""
    # Remove extra whitespace
    text = " ".join(text.split())
    
    # Remove special characters that might cause issues
    text = text.replace('\x00', '')
    
    return text.strip()