# app/api/routes_evaluate.py

from __future__ import annotations

import json
from pathlib import Path
from typing import List, Dict, Any

from fastapi import APIRouter

from app.core.schemas import EvaluationItem, EvaluationListResponse

router = APIRouter(prefix="/v1", tags=["evaluation"])

ROOT = Path(__file__).resolve().parents[2]
EVAL_FILE = ROOT / "evaluations.json"


def _load_evals() -> List[Dict[str, Any]]:
    if not EVAL_FILE.exists():
        return []
    return json.loads(EVAL_FILE.read_text(encoding="utf-8"))


def _save_evals(evals: List[Dict[str, Any]]):
    EVAL_FILE.write_text(json.dumps(evals, indent=2), encoding="utf-8")


@router.get("/evaluate", response_model=EvaluationListResponse)
def list_evaluations() -> EvaluationListResponse:
    rows = _load_evals()
    return EvaluationListResponse(
        items=[EvaluationItem(**r) for r in rows]
    )


@router.post("/evaluate", response_model=EvaluationItem)
def save_evaluation(item: EvaluationItem) -> EvaluationItem:
    rows = _load_evals()
    rows.append(item.dict())
    _save_evals(rows)
    return item
