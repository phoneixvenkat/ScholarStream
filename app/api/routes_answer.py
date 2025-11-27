"""
API routes for question answering
"""
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional
import time

from app.services.llm import generate_response
from app.services.pipeline import vs_query
from app.services.generator import build_rag_prompt

router = APIRouter()

class AnswerRequest(BaseModel):
    question: str
    model: str = "mistral"
    max_tokens: int = 500
    temperature: float = 0.7
    top_k: int = 5

@router.post("/v1/answer")
async def get_answer(req: AnswerRequest):
    """
    Get answer to a question using RAG
    """
    try:
        start_time = time.time()
        
        # Step 1: Retrieve relevant chunks
        chunks = vs_query(
            query=req.question,
            top_k=req.top_k,
            mode="hybrid"
        )
        
        if not chunks:
            raise HTTPException(
                status_code=404,
                detail="No relevant context found in knowledge base"
            )
        
        # Step 2: Build RAG prompt
        rag_prompt = build_rag_prompt(
            question=req.question,
            chunks=chunks
        )
        
        # Step 3: Generate answer using specified model
        result = generate_response(
            prompt=rag_prompt,
            model_name=req.model,
            max_tokens=req.max_tokens,
            temperature=req.temperature
        )
        
        if not result["success"]:
            raise HTTPException(
                status_code=500,
                detail=f"LLM generation failed: {result['error']}"
            )
        
        # Step 4: Format response
        sources = [
            {
                "text": chunk["text"][:200] + "...",
                "metadata": chunk.get("metadata", {}),
                "score": chunk.get("score", 0)
            }
            for chunk in chunks
        ]
        
        elapsed_time = time.time() - start_time
        
        return {
            "question": req.question,
            "answer": result["response"],
            "model": req.model,
            "sources": sources,
            "elapsed_time": round(elapsed_time, 2)
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))