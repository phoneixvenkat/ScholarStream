"""
Benchmark evaluation routes
"""
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Dict, Optional
import json
import time
from pathlib import Path

from app.services.pipeline import vs_query
from app.services.generator import build_rag_prompt
from app.services.llm import generate_multi_model_responses

router = APIRouter()

# Load benchmark questions
BENCHMARK_FILE = Path("benchmark_questions.json")

def load_benchmark_questions():
    """Load benchmark questions from JSON file"""
    if not BENCHMARK_FILE.exists():
        raise FileNotFoundError("benchmark_questions.json not found")
    
    with open(BENCHMARK_FILE, 'r') as f:
        return json.load(f)

class BenchmarkRequest(BaseModel):
    models: Optional[List[str]] = None
    top_k: int = 5
    max_tokens: int = 500

@router.post("/v1/benchmark/run")
async def run_benchmark(req: BenchmarkRequest):
    """
    Run complete benchmark test on all questions with all models
    """
    try:
        start_time = time.time()
        
        # Load questions
        benchmark_data = load_benchmark_questions()
        questions = benchmark_data["questions"]
        
        results = []
        
        for q_data in questions:
            question = q_data["question"]
            
            # Retrieve context
            chunks = vs_query(query=question, top_k=req.top_k, mode="hybrid")
            
            if not chunks:
                results.append({
                    "question_id": q_data["id"],
                    "question": question,
                    "error": "No relevant context found",
                    "responses": {}
                })
                continue
            
            # Build prompt
            rag_prompt = build_rag_prompt(question=question, chunks=chunks)
            
            # Get responses from all models
            multi_response = generate_multi_model_responses(
                prompt=rag_prompt,
                models=req.models,
                max_tokens=req.max_tokens
            )
            
            # Format responses
            model_responses = {}
            for model_name, result in multi_response["responses"].items():
                model_responses[model_name] = {
                    "answer": result["response"] if result["success"] else None,
                    "success": result["success"],
                    "error": result["error"]
                }
            
            results.append({
                "question_id": q_data["id"],
                "question": question,
                "category": q_data["category"],
                "expected_keywords": q_data["expected_keywords"],
                "responses": model_responses,
                "sources_count": len(chunks)
            })
        
        elapsed_time = time.time() - start_time
        
        return {
            "benchmark_name": benchmark_data["benchmark_name"],
            "total_questions": len(questions),
            "results": results,
            "elapsed_time": round(elapsed_time, 2)
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/v1/benchmark/questions")
async def get_benchmark_questions():
    """
    Get all benchmark questions
    """
    try:
        benchmark_data = load_benchmark_questions()
        return benchmark_data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

class EvaluationRequest(BaseModel):
    question_id: int
    model_name: str
    rating: int  # 1-5
    relevance: int  # 1-5
    accuracy: int  # 1-5
    completeness: int  # 1-5
    notes: Optional[str] = None

# In-memory storage (in production, use a database)
evaluations_store = []

@router.post("/v1/benchmark/evaluate")
async def evaluate_response(eval_req: EvaluationRequest):
    """
    Manually evaluate a model's response
    """
    try:
        evaluation = {
            "question_id": eval_req.question_id,
            "model_name": eval_req.model_name,
            "rating": eval_req.rating,
            "relevance": eval_req.relevance,
            "accuracy": eval_req.accuracy,
            "completeness": eval_req.completeness,
            "notes": eval_req.notes,
            "timestamp": time.time()
        }
        
        evaluations_store.append(evaluation)
        
        return {
            "success": True,
            "evaluation": evaluation
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/v1/benchmark/evaluations")
async def get_evaluations():
    """
    Get all evaluations
    """
    return {
        "evaluations": evaluations_store,
        "count": len(evaluations_store)
    }

@router.get("/v1/benchmark/summary")
async def get_evaluation_summary():
    """
    Get summary statistics of evaluations
    """
    if not evaluations_store:
        return {
            "message": "No evaluations yet",
            "models": {}
        }
    
    # Group by model
    model_stats = {}
    
    for eval_data in evaluations_store:
        model = eval_data["model_name"]
        if model not in model_stats:
            model_stats[model] = {
                "ratings": [],
                "relevance": [],
                "accuracy": [],
                "completeness": []
            }
        
        model_stats[model]["ratings"].append(eval_data["rating"])
        model_stats[model]["relevance"].append(eval_data["relevance"])
        model_stats[model]["accuracy"].append(eval_data["accuracy"])
        model_stats[model]["completeness"].append(eval_data["completeness"])
    
    # Calculate averages
    summary = {}
    for model, stats in model_stats.items():
        summary[model] = {
            "avg_rating": round(sum(stats["ratings"]) / len(stats["ratings"]), 2),
            "avg_relevance": round(sum(stats["relevance"]) / len(stats["relevance"]), 2),
            "avg_accuracy": round(sum(stats["accuracy"]) / len(stats["accuracy"]), 2),
            "avg_completeness": round(sum(stats["completeness"]) / len(stats["completeness"]), 2),
            "total_evaluations": len(stats["ratings"])
        }
    
    return {
        "models": summary,
        "total_evaluations": len(evaluations_store)
    }