from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Optional
from app.services.generator import gen_answer

router = APIRouter()

class QueryRequest(BaseModel):
    query: str
    model: str = "phi3"
    mode: str = "hybrid"
    top_k: int = 5

class QueryResponse(BaseModel):
    answer: str
    chunks: List[dict]
    sources: List[dict]
    model: str
    elapsed_time: float

@router.post("/query", response_model=QueryResponse)
async def query_documents(request: QueryRequest):
    """
    Query documents and generate an answer using RAG
    """
    try:
        print(f"\n[Query] Question: {request.query}")
        print(f"[Query] Model: {request.model}, Mode: {request.mode}")
        
        # Use existing gen_answer function from generator.py
        answer_text, used_chunks, meta = gen_answer(
            question=request.query,
            top_k=request.top_k,
            mode=request.mode,
            model=request.model
        )
        
        elapsed_time = meta.get("time_ms", 0) / 1000.0  # Convert ms to seconds
        
        print(f"[Query] ✓ Answer generated in {elapsed_time:.2f}s\n")
        
        # Format sources for frontend
        sources = [
            {
                "content": chunk.get("text", "")[:200] + "..." if len(chunk.get("text", "")) > 200 else chunk.get("text", ""),
                "index": idx
            }
            for idx, chunk in enumerate(used_chunks[:3])  # Return top 3 sources
        ]
        
        return QueryResponse(
            answer=answer_text,
            chunks=used_chunks,
            sources=sources,
            model=request.model,
            elapsed_time=round(elapsed_time, 2)
        )
        
    except Exception as e:
        print(f"[Query] Error: {str(e)}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Error processing query: {str(e)}")