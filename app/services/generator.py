# app/services/generator.py

from __future__ import annotations

from typing import List, Dict, Any
import time

from app.services.pipeline import vs_query
from app.services.llm import generate_response


def build_rag_prompt(question: str, chunks: List[Dict[str, Any]]) -> str:
    """
    Build a RAG prompt from question and retrieved chunks
    """
    context_parts = []
    for i, chunk in enumerate(chunks, 1):
        text = chunk.get("text", "")
        context_parts.append(f"[{i}] {text}")
    
    context_str = "\n\n".join(context_parts)
    
    prompt = f"""Based on the following context, answer the question.

Context:
{context_str}

Question: {question}

Answer the question based solely on the information provided in the context above. If the context doesn't contain enough information, say so."""
    
    return prompt


def gen_answer(
    question: str,
    top_k: int = 4,
    mode: str = "hybrid",
    model: str = "mistral",
) -> tuple[str, List[Dict[str, Any]], Dict[str, Any]]:
    """
    Main QA pipeline:
    - retrieve chunks
    - call selected LLM
    Returns:
        answer_text, used_chunks, meta
    """
    start_time = time.time()
    
    # Retrieve chunks
    chunks = vs_query(query=question, top_k=top_k, mode=mode)
    
    # Build prompt
    prompt = build_rag_prompt(question, chunks)
    
    # Generate answer
    llm_result = generate_response(
        prompt=prompt,
        model_name=model,
        max_tokens=500,
        temperature=0.7
    )
    
    elapsed_ms = (time.time() - start_time) * 1000
    
    # Format output to match expected structure
    llm_out = {
        "answer": llm_result["response"] if llm_result["success"] else "Error generating answer",
        "model": model,
        "time_ms": round(elapsed_ms, 2),
        "tokens": len(llm_result["response"].split()) if llm_result["success"] else 0,
        "success": llm_result["success"],
        "error": llm_result["error"]
    }

    return llm_out["answer"], chunks, llm_out


def gen_compare_all(
    question: str,
    top_k: int = 4,
    mode: str = "hybrid",
    models: List[str] | None = None,
) -> Dict[str, Any]:
    """
    Run the same RAG query through multiple models.

    Returns:
        {
          "results": {
            "mistral": { answer, model, time_ms, tokens, used_chunks },
            "llama3":  { ... },
            "phi3":    { ... }
          },
          "aggregate": { ... }
        }
    """
    if not models:
        models = ["mistral", "llama3", "phi3"]

    # Retrieve chunks once (same for all models)
    chunks = vs_query(query=question, top_k=top_k, mode=mode)
    
    # Build prompt once
    prompt = build_rag_prompt(question, chunks)

    results: Dict[str, Any] = {}
    
    for m in models:
        start_time = time.time()
        
        # Generate answer with this model
        llm_result = generate_response(
            prompt=prompt,
            model_name=m,
            max_tokens=500,
            temperature=0.7
        )
        
        elapsed_ms = (time.time() - start_time) * 1000
        
        out = {
            "answer": llm_result["response"] if llm_result["success"] else "Error",
            "model": m,
            "time_ms": round(elapsed_ms, 2),
            "tokens": len(llm_result["response"].split()) if llm_result["success"] else 0,
            "used_chunks": chunks,
            "success": llm_result["success"],
            "error": llm_result["error"]
        }
        results[m] = out

    # Aggregate simple metrics
    agg: Dict[str, Any] = {
        "total_queries": 1,
    }
    for m in models:
        key_time = f"avg_time_{m}"
        key_tok = f"avg_tokens_{m}"
        agg[key_time] = results[m]["time_ms"]
        agg[key_tok] = results[m]["tokens"]

    return {
        "results": results,
        "aggregate": agg,
    }


def gen_summary(max_chunks: int = 20) -> str:
    """
    Simple summarization over top chunks.
    For now, we just reuse the retrieval + LLM answer pattern with a fixed prompt.
    """
    pseudo_question = "Give a high-level summary of the key ideas in this knowledge base."
    chunks = vs_query(query=pseudo_question, top_k=max_chunks, mode="semantic")
    
    prompt = build_rag_prompt("Summarize the above context.", chunks)
    
    result = generate_response(
        prompt=prompt,
        model_name="mistral",
        max_tokens=500,
        temperature=0.7
    )
    
    return result["response"] if result["success"] else "Error generating summary"