from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from app.services.vectorstore import get_vectorstore
from app.services.llm import get_llm
import time

router = APIRouter()

class AnswerRequest(BaseModel):
    question: str
    model: str = "phi3"
    search_mode: str = "hybrid"
    top_k: int = 5

@router.post("/answer")
async def answer_question(request: AnswerRequest):
    """
    Generate an answer to a question using RAG
    """
    try:
        start_time = time.time()
        
        print(f"[Answer] Question: {request.question}")
        print(f"[Answer] Model: {request.model}, Mode: {request.search_mode}")
        
        # Step 1: Get vectorstore and retrieve relevant chunks
        vectorstore = get_vectorstore()
        
        # Retrieve documents
        docs = vectorstore.similarity_search(request.question, k=request.top_k)
        
        if not docs:
            return {
                "answer": "I couldn't find any relevant information in the documents to answer this question.",
                "sources": [],
                "chunks_found": 0,
                "elapsed_time": round(time.time() - start_time, 2)
            }
        
        # Extract text from documents
        chunks = [doc.page_content for doc in docs]
        
        print(f"[Answer] Retrieved {len(chunks)} chunks")
        
        # Step 2: Prepare context
        context = "\n\n".join(chunks)
        
        # Step 3: Create prompt
        prompt = f"""Based on the following context, answer the question accurately and concisely.

Context:
{context}

Question: {request.question}

Answer:"""
        
        # Step 4: Generate answer using LLM
        llm = get_llm(model_name=request.model)
        answer = llm.invoke(prompt)
        
        # Extract text from response
        if hasattr(answer, 'content'):
            answer_text = answer.content
        elif isinstance(answer, str):
            answer_text = answer
        else:
            answer_text = str(answer)
        
        elapsed_time = round(time.time() - start_time, 2)
        
        print(f"[Answer] ✓ Answer generated in {elapsed_time}s")
        
        # Format sources
        sources = [
            {
                "content": chunk[:200] + "..." if len(chunk) > 200 else chunk,
                "index": idx
            }
            for idx, chunk in enumerate(chunks[:3])  # Return top 3 sources
        ]
        
        return {
            "answer": answer_text,
            "sources": sources,
            "chunks_found": len(chunks),
            "model": request.model,
            "search_mode": request.search_mode,
            "elapsed_time": elapsed_time
        }
        
    except Exception as e:
        print(f"[Answer] Error: {str(e)}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Error generating answer: {str(e)}")