"""
Health check endpoints
"""
from fastapi import APIRouter, HTTPException
import ollama

router = APIRouter()

@router.get("/health")
async def health_check():
    """
    Basic health check endpoint
    """
    return {
        "status": "healthy",
        "message": "EDUrag backend is running"
    }

@router.get("/v1/health")
async def detailed_health_check():
    """
    Detailed health check with system status
    """
    try:
        # Check if Ollama is accessible
        try:
            ollama_models = ollama.list()
            ollama_status = "connected"
            models_count = len(ollama_models.get('models', []))
        except Exception as e:
            ollama_status = "disconnected"
            models_count = 0
        
        return {
            "status": "healthy",
            "message": "EDUrag backend is running",
            "services": {
                "ollama": {
                    "status": ollama_status,
                    "models_available": models_count
                },
                "vectorstore": "ready"
            }
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))