# app/api/routes_summarize.py
"""
Fast summarization using Phi-3-Mini (smaller, faster model)
"""
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from app.services.pipeline import vs_query
from app.services.llm import generate_response

router = APIRouter(tags=["summarize"])


class SummarizeRequest(BaseModel):
    max_chunks: int = 10


class SummarizeResponse(BaseModel):
    summary: str


@router.post("/summarize", response_model=SummarizeResponse)
def summarize(req: SummarizeRequest) -> SummarizeResponse:
    """
    Generate summary using Phi-3-Mini (faster model).
    
    Uses smaller model for speed while maintaining quality.
    """
    
    print("[Summary-Phi3] Generating summary with Phi-3-Mini...")
    
    try:
        # Get fewer chunks for speed
        chunks = vs_query(
            query="main topics key concepts overview",
            top_k=min(req.max_chunks, 8),  # Limit chunks for speed
            mode="semantic"
        )
        
        if not chunks:
            raise HTTPException(
                status_code=404,
                detail="No content indexed. Please upload a document or URL first."
            )
        
        # Build shorter context for faster generation
        context_parts = []
        for i, chunk in enumerate(chunks[:5], 1):  # Only use top 5
            text = chunk.get('text', '') if isinstance(chunk, dict) else getattr(chunk, 'text', '')
            if text:
                # Limit chunk length
                text = text[:400]
                context_parts.append(f"Section {i}:\n{text}")
        
        context = "\n\n".join(context_parts)
        
        # Shorter, simpler prompt for speed
        prompt = f"""Summarize the main ideas from this content in 3-4 sentences.

CONTENT:
{context}

Provide a clear, concise summary:"""

        # Use Phi-3-Mini for faster generation!
        result = generate_response(
            prompt=prompt,
            model_name="phi3",  # Smaller, faster model
            max_tokens=300,  # Shorter response = faster
            temperature=0.5
        )
        
        summary = result.get('response', '').strip()
        
        if not summary:
            raise ValueError("Empty summary generated")
        
        # Add metadata
        summary_with_meta = f"{summary}\n\n---\n📊 Analyzed {len(chunks)} sections from indexed documents."
        
        print(f"[Summary-Phi3] ✓ Summary generated with Phi-3-Mini")
        
        return SummarizeResponse(summary=summary_with_meta)
        
    except Exception as e:
        print(f"[Summary-Phi3] Error: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Summarization failed: {str(e)}"
        )