# app/api/routes_url.py
"""
URL ingestion endpoint - fetch web content and index it like a PDF
"""
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, HttpUrl, Field
from typing import Optional
import requests
from bs4 import BeautifulSoup
import time

from app.services.chunker import chunk_text
from app.services.vectorstore import add_documents
from app.services.embeddings import embed_texts

router = APIRouter(tags=["url"])


class URLRequest(BaseModel):
    url: HttpUrl
    title: Optional[str] = None  # Optional custom title


class URLResponse(BaseModel):
    ok: bool
    url: str
    title: str
    chars_extracted: int
    chunks_indexed: int
    elapsed_time: float


@router.post("/url/ingest", response_model=URLResponse)
def ingest_url(body: URLRequest):
    """
    Fetch content from a URL, extract text, chunk it, and index in vector store.
    
    Example:
        POST /v1/url/ingest
        {
            "url": "https://en.wikipedia.org/wiki/Transformer_(machine_learning_model)",
            "title": "Transformer Wikipedia"
        }
    """
    start_time = time.time()
    
    try:
        # Step 1: Fetch the webpage
        print(f"[URL] Fetching: {body.url}")
        headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
        response = requests.get(str(body.url), headers=headers, timeout=15)
        response.raise_for_status()
        
        # Step 2: Extract text content
        print("[URL] Parsing HTML...")
        soup = BeautifulSoup(response.text, "html.parser")
        
        # Remove script, style, nav, footer, ads
        for tag in soup(['script', 'style', 'nav', 'footer', 'aside', 'header']):
            tag.decompose()
        
        # Try to find main content (common patterns)
        main_content = (
            soup.find('article') or 
            soup.find('main') or 
            soup.find('div', class_=lambda x: x and 'content' in x.lower()) or
            soup.find('body')
        )
        
        if main_content:
            text = main_content.get_text(separator="\n", strip=True)
        else:
            text = soup.get_text(separator="\n", strip=True)
        
        # Clean up excessive whitespace
        lines = [line.strip() for line in text.split('\n') if line.strip()]
        text = '\n'.join(lines)
        
        if not text or len(text) < 100:
            raise HTTPException(
                status_code=400, 
                detail="Could not extract meaningful content from URL"
            )
        
        chars_extracted = len(text)
        print(f"[URL] Extracted {chars_extracted} characters")
        
        # Step 3: Chunk the text
        print("[URL] Chunking text...")
        chunks = chunk_text(text)
        
        if not chunks:
            raise HTTPException(
                status_code=400,
                detail="Text chunking failed - content too short or invalid"
            )
        
        # Step 4: Prepare metadata
        doc_title = body.title or soup.find('title').get_text() if soup.find('title') else str(body.url)
        doc_title = doc_title[:200]  # Limit title length
        
        # Format chunks with metadata
        documents = []
        for i, chunk in enumerate(chunks):
            documents.append({
                "text": chunk,
                "meta": {
                    "source": str(body.url),
                    "title": doc_title,
                    "chunk_id": i,
                    "type": "url",
                    "timestamp": time.time()
                }
            })
        
        # Step 5: Add to vector store
        print(f"[URL] Indexing {len(documents)} chunks...")
        ids, collection_info = add_documents(documents)
        
        elapsed_time = time.time() - start_time
        
        print(f"[URL] ✓ Successfully indexed {len(ids)} chunks in {elapsed_time:.2f}s")
        
        return URLResponse(
            ok=True,
            url=str(body.url),
            title=doc_title,
            chars_extracted=chars_extracted,
            chunks_indexed=len(ids),
            elapsed_time=elapsed_time
        )
        
    except requests.RequestException as e:
        raise HTTPException(
            status_code=400,
            detail=f"Failed to fetch URL: {str(e)}"
        )
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error processing URL: {str(e)}"
        )


@router.get("/url/test")
def test_url_extraction():
    """
    Test endpoint to verify URL fetching works
    """
    test_url = "https://en.wikipedia.org/wiki/Artificial_intelligence"
    
    try:
        response = requests.get(test_url, timeout=10)
        soup = BeautifulSoup(response.text, "html.parser")
        title = soup.find('title').get_text() if soup.find('title') else "No title"
        
        return {
            "ok": True,
            "test_url": test_url,
            "title": title,
            "status_code": response.status_code
        }
    except Exception as e:
        return {
            "ok": False,
            "error": str(e)
        }