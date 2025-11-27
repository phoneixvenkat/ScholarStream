"""
Main FastAPI application for EDUrag
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api import (
    routes_health,
    routes_documents,
    routes_query,
    routes_answer,
    routes_summarize,
    routes_compare,
    routes_quiz,      # NEW - Quiz generation
    routes_url        # NEW - URL ingestion
)

app = FastAPI(
    title="EDUrag API", 
    version="2.0.0",
    description="RAG system with PDF/URL ingestion, summarization, and quiz generation"
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers with /v1 prefix for consistency
app.include_router(routes_health.router, prefix="/v1", tags=["Health"])
app.include_router(routes_documents.router, prefix="/v1", tags=["Documents"])
app.include_router(routes_query.router, prefix="/v1", tags=["Query"])
app.include_router(routes_answer.router, prefix="/v1", tags=["Answer"])
app.include_router(routes_summarize.router, prefix="/v1", tags=["Summarize"])
app.include_router(routes_compare.router, prefix="/v1", tags=["Compare"])
app.include_router(routes_quiz.router, prefix="/v1", tags=["Quiz"])        # NEW
app.include_router(routes_url.router, prefix="/v1", tags=["URL"])          # NEW


@app.get("/")
def root():
    """Root endpoint with API information"""
    return {
        "name": "EDUrag API",
        "version": "2.0.0",
        "description": "Retrieval-Augmented Generation with multi-source support",
        "features": [
            "PDF document upload and indexing",
            "URL/website content ingestion",
            "Hybrid retrieval (semantic + BM25)",
            "Question answering with citations",
            "Auto-summarization",
            "Smart quiz generation",
            "Multi-model comparison"
        ],
        "docs": "/docs",
        "health": "/v1/health"
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)