# app/api/routes_quiz.py
"""
Quiz generation using Phi-3-Mini (faster, smaller LLM)
"""
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
from typing import List, Optional
import json

from app.services.pipeline import vs_query
from app.services.llm import generate_response

router = APIRouter(tags=["quiz"])


class QuizRequest(BaseModel):
    topic: str = Field("", description="Optional topic to focus quiz on")
    num_questions: int = Field(5, ge=3, le=10, description="Number of questions")
    difficulty: str = Field("medium", description="easy, medium, or hard")


class QuizQuestion(BaseModel):
    question: str
    type: str = "mcq"
    options: Optional[List[str]] = None
    answer: str
    explanation: str
    difficulty: str


class QuizResponse(BaseModel):
    ok: bool
    topic: str
    num_questions: int
    questions: List[QuizQuestion]


@router.post("/quiz/generate", response_model=QuizResponse)
def generate_quiz(req: QuizRequest):
    """
    Generate quiz questions using Phi-3-Mini (faster model).
    
    Uses the smallest model for speed while maintaining quality.
    """
    
    query = req.topic.strip() or "key concepts important information"
    
    print(f"[Quiz-Phi3] Retrieving chunks for: {query}")
    
    try:
        # Get fewer chunks for speed
        chunks = vs_query(
            query=query,
            top_k=min(8, req.num_questions * 2),  # Fewer chunks = faster
            mode="semantic"  # Semantic only for speed
        )
        
        if not chunks:
            raise HTTPException(
                status_code=404,
                detail="No content indexed. Please upload a document or URL first."
            )
        
        # Use only top 5 chunks for speed
        context_parts = []
        for i, chunk in enumerate(chunks[:5], 1):
            text = chunk.get('text', '') if isinstance(chunk, dict) else getattr(chunk, 'text', '')
            if text:
                # Limit chunk size for speed
                text = text[:300]
                context_parts.append(f"[{i}] {text}")
        
        context = "\n\n".join(context_parts)
        
        # Simplified, shorter prompt for faster generation
        prompt = f"""Generate {req.num_questions} quiz questions from this content.

CONTENT:
{context}

Create {req.num_questions} multiple choice questions. Each question has 4 options.

JSON format only:
{{
  "questions": [
    {{
      "question": "Your question here?",
      "options": ["A", "B", "C", "D"],
      "answer": "A",
      "explanation": "Why A is correct"
    }}
  ]
}}

Generate now:"""

        print(f"[Quiz-Phi3] Generating with Phi-3-Mini (faster model)...")
        
        # Use Phi-3-Mini for speed!
        result = generate_response(
            prompt=prompt,
            model_name="phi3",  # Smaller, faster model!
            max_tokens=1000,  # Less tokens = faster
            temperature=0.6
        )
        
        response_text = result.get('response', '').strip()
        
        # Clean response
        response_text = response_text.replace('```json', '').replace('```', '').strip()
        
        # Extract JSON
        start = response_text.find('{')
        end = response_text.rfind('}') + 1
        if start != -1 and end > start:
            response_text = response_text[start:end]
        
        quiz_data = json.loads(response_text)
        
        if 'questions' not in quiz_data:
            raise ValueError("Invalid format")
        
        questions = []
        for q in quiz_data['questions']:
            questions.append(QuizQuestion(
                question=q.get('question', ''),
                type="mcq",
                options=q.get('options', []),
                answer=q.get('answer', ''),
                explanation=q.get('explanation', 'See content above'),
                difficulty=req.difficulty
            ))
        
        if not questions:
            raise ValueError("No questions generated")
        
        print(f"[Quiz-Phi3] ✓ Generated {len(questions)} questions with Phi-3-Mini")
        
        return QuizResponse(
            ok=True,
            topic=req.topic or "General",
            num_questions=len(questions),
            questions=questions
        )
        
    except json.JSONDecodeError as e:
        print(f"[Quiz-Phi3] JSON error: {e}")
        print(f"[Quiz-Phi3] Response: {response_text[:300]}")
        
        raise HTTPException(
            status_code=500,
            detail="Failed to parse quiz. Model returned invalid format."
        )
    
    except Exception as e:
        print(f"[Quiz-Phi3] Error: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Quiz generation failed: {str(e)}"
        )


@router.get("/quiz/example")
def get_example_quiz():
    """Example quiz format"""
    return {
        "ok": True,
        "topic": "Example",
        "num_questions": 2,
        "questions": [
            {
                "question": "What mechanism do Transformers use instead of recurrence?",
                "type": "mcq",
                "options": [
                    "Self-attention",
                    "Convolution",
                    "Pooling",
                    "Recurrence"
                ],
                "answer": "Self-attention",
                "explanation": "Transformers replace recurrence with self-attention mechanisms.",
                "difficulty": "medium"
            }
        ]
    }