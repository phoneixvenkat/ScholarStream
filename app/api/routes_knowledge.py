# app/api/routes_knowledge.py

from __future__ import annotations

import json
from pathlib import Path
from typing import List, Dict, Any
from datetime import datetime

from fastapi import APIRouter
from app.core.schemas import KnowledgeDoc, KnowledgeListResponse

router = APIRouter(prefix="/v1", tags=["knowledge"])

ROOT = Path(__file__).resolve().parents[2]
KB_FILE = ROOT / "knowledge_meta.json"


def _load_meta() -> List[Dict[str, Any]]:
    if not KB_FILE.exists():
        return []
    return json.loads(KB_FILE.read_text(encoding="utf-8"))


def _save_meta(rows: List[Dict[str, Any]]):
    KB_FILE.write_text(json.dumps(rows, indent=2), encoding="utf-8")


def _row_to_doc(row: Dict[str, Any]) -> KnowledgeDoc:
    return KnowledgeDoc(
        id=row.get("id") or row.get("doc_id") or row.get("filename") or "",
        filename=row.get("filename") or row.get("name") or "Unknown document",
        path=row.get("path") or "",
        size_bytes=row.get("size_bytes") or row.get("bytes") or 0,
        chunks=row.get("chunks") or row.get("num_chunks") or 0,
        pages=row.get("pages") or row.get("page_count") or row.get("num_pages") or 0,
        created_at=(
            row.get("created_at")
            or row.get("uploaded_at")
            or datetime.utcnow().isoformat() + "Z"
        ),
    )


@router.get("/knowledge", response_model=KnowledgeListResponse)
def list_knowledge() -> KnowledgeListResponse:
    rows = _load_meta()
    docs = [_row_to_doc(r) for r in rows]
    return KnowledgeListResponse(docs=docs)
