from __future__ import annotations

from typing import List, Optional, Literal, Dict, Any
from pydantic import BaseModel, Field


# ---------------------------------------------------------
# Common / shared types
# ---------------------------------------------------------

class RetrievedChunk(BaseModel):
    """
    Chunk returned from the retriever/vectorstore.
    """
    text: str
    score: float
    meta: Dict[str, Any] = Field(default_factory=dict)


# ---------------------------------------------------------
# /v1/answer  (LLM-grounded QA)
# ---------------------------------------------------------

class AnswerRequest(BaseModel):
    """
    Request body for the LLM-grounded QA endpoint.
    """
    question: str
    top_k: int = 6
    mode: Literal["semantic", "keyword", "hybrid"] = "hybrid"
    provider: Optional[str] = None   # e.g. "ollama"
    model: Optional[str] = None      # e.g. "mistral", "llama3", "phi3"


class AnswerResponse(BaseModel):
    """
    Response body for /v1/answer
    """
    answer: str
    used_chunks: List[RetrievedChunk]


# ---------------------------------------------------------
# /v1/upload  (document upload)
# ---------------------------------------------------------

class UploadResponse(BaseModel):
    ok: bool
    filename: str
    chunks_indexed: int
    collection_info: Dict[str, Any] | None = None


# ---------------------------------------------------------
# /v1/query  (raw retrieval only)
# ---------------------------------------------------------

class QueryRequest(BaseModel):
    query: str
    top_k: int = 6
    mode: Literal["semantic", "keyword", "hybrid"] = "semantic"


class QueryResponse(BaseModel):
    query: str
    results: List[RetrievedChunk]


# ---------------------------------------------------------
# /v1/summarize
# ---------------------------------------------------------

class SummarizeRequest(BaseModel):
    max_chunks: int = 20


class SummarizeResponse(BaseModel):
    summary: str


# ---------------------------------------------------------
# Benchmarks  (/v1/benchmarks)
# ---------------------------------------------------------

class BenchmarkQuestion(BaseModel):
    """
    One predefined benchmark question for the project.
    """
    id: str
    question: str
    category: str


class BenchmarkListResponse(BaseModel):
    """
    Returned by GET /v1/benchmarks
    """
    questions: List[BenchmarkQuestion]


class BenchmarkRunRequest(BaseModel):
    """
    POST /v1/benchmarks/run
    """
    model: str                       # e.g. "mistral"
    provider: Optional[str] = None   # e.g. "ollama"
    question_ids: Optional[List[str]] = None  # if None, run on all questions


class BenchmarkSingleResult(BaseModel):
    """
    Result of one model answering one benchmark question.
    """
    question_id: str
    model: str
    provider: str
    answer: str
    latency_ms: float
    token_count: int


class BenchmarkRunResponse(BaseModel):
    """
    Response for /v1/benchmarks/run
    """
    results: List[BenchmarkSingleResult]


# ---------------------------------------------------------
# Compare endpoint  (/v1/compare)
# ---------------------------------------------------------

class CompareRequest(BaseModel):
    """
    Request for multi-model comparison on a single question.
    """
    question: str
    models: List[str] = Field(
        default_factory=lambda: ["mistral", "llama3", "phi3"]
    )
    provider: Optional[str] = None
    top_k: int = 6
    mode: Literal["semantic", "keyword", "hybrid"] = "hybrid"


class CompareModelResult(BaseModel):
    """
    One model's answer/result in a comparison run.
    """
    model: str
    provider: str
    answer: str
    latency_ms: float
    token_count: int
    used_chunks: List[RetrievedChunk]


class SingleModelAnswer(CompareModelResult):
    """
    Backwards-compatible alias for older code that imports SingleModelAnswer.
    """
    pass


class CompareResponse(BaseModel):
    """
    Response for /v1/compare
    """
    question: str
    results: List[CompareModelResult]


# ---------------------------------------------------------
# Evaluation endpoints  (/v1/evaluate)
# ---------------------------------------------------------

class EvaluationItem(BaseModel):
    """
    Manual evaluation entry for one (question, model) pair.
    """
    question: str
    model: str
    provider: str
    answer: str

    accuracy: int           # 1–5
    relevance: int          # 1–5
    completeness: int       # 1–5
    hallucination: bool     # True if hallucination detected

    notes: Optional[str] = None


class EvaluationListResponse(BaseModel):
    """
    Wrapper for returning a list of evaluations.
    """
    items: List[EvaluationItem]


# ---------------------------------------------------------
# Knowledge base endpoints  (/v1/knowledge)
# ---------------------------------------------------------

class KnowledgeDoc(BaseModel):
    """
    Metadata for one document in the knowledge base.
    """
    filename: str
    path: str
    pages: int
    chunks: int
    size_bytes: int


class KnowledgeListResponse(BaseModel):
    """
    Response for listing knowledge base documents.
    """
    docs: List[KnowledgeDoc]
