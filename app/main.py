from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api import (
    routes_health,
    routes_documents,
    routes_query,
    routes_url,
    routes_quiz,
    routes_summarize
)

app = FastAPI(
    title="EDUrag API",
    description="Multi-Model RAG System for Document Q&A",
    version="2.0.0"
)

# CORS Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register all routers
app.include_router(routes_health.router, prefix="/v1", tags=["health"])
app.include_router(routes_documents.router, prefix="/v1", tags=["documents"])
app.include_router(routes_query.router, prefix="/v1", tags=["query"])
app.include_router(routes_url.router, prefix="/v1", tags=["url"])
app.include_router(routes_quiz.router, prefix="/v1", tags=["quiz"])
app.include_router(routes_summarize.router, prefix="/v1", tags=["summarize"])

# Root endpoint
@app.get("/")
async def root():
    return {
        "message": "EDUrag API - Multi-Model RAG System",
        "version": "2.0.0",
        "docs": "/docs",
        "features": [
            "PDF Document Upload & Indexing",
            "URL Content Ingestion",
            "Hybrid Retrieval (Semantic + BM25)",
            "Question Answering with Phi-3",
            "Smart Summarization (Phi-3)",
            "Quiz Generation (Phi-3)"
        ]
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)