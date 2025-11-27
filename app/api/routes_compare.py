"""
API routes for multi-model comparison
"""
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Optional
import time

from app.services.llm import generate_multi_model_responses, get_available_models, test_model_availability
from app.services.pipeline import vs_query
from app.services.generator import build_rag_prompt, gen_compare_all

router = APIRouter()

class CompareRequest(BaseModel):
    question: str
    models: Optional[List[str]] = None  # If None, use all models
    max_tokens: int = 500
    temperature: float = 0.7
    top_k: int = 5

@router.post("/v1/compare")
async def compare_models(req: CompareRequest):
    """
    Compare responses from multiple LLM models using RAG
    
    Returns responses from all selected models with the same retrieved context
    """
    try:
        # Use the existing gen_compare_all function
        result = gen_compare_all(
            question=req.question,
            top_k=req.top_k,
            mode="hybrid",
            models=req.models
        )
        
        # Format for API response
        responses = {}
        chunks = None
        
        for model_name, model_result in result["results"].items():
            responses[model_name] = {
                "answer": model_result["answer"],
                "success": model_result.get("success", True),
                "error": model_result.get("error", None),
                "time_ms": model_result["time_ms"]
            }
            
            # Get chunks from first model (they're all the same)
            if chunks is None:
                chunks = model_result.get("used_chunks", [])
        
        # Extract sources
        sources = [
            {
                "text": chunk.get("text", "")[:200] + "...",
                "metadata": chunk.get("metadata", {}),
                "score": chunk.get("score", 0)
            }
            for chunk in (chunks or [])
        ]
        
        return {
            "question": req.question,
            "responses": responses,
            "sources": sources,
            "models_compared": list(responses.keys()),
            "aggregate": result.get("aggregate", {})
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/v1/models")
async def list_models():
    """
    List all available LLM models
    """
    try:
        models = get_available_models()
        return {
            "models": models,
            "count": len(models)
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/v1/models/status")
async def check_models_status():
    """
    Check which models are actually available in Ollama
    """
    try:
        status = test_model_availability()
        return status
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))