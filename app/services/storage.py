# app/services/storage.py
from __future__ import annotations

import io
import os
import uuid
import json
import logging
from datetime import datetime
from pathlib import Path
from typing import Dict, Any, List, Tuple, Optional

try:
    # PyPDF2 is lightweight and already in most RAG stacks
    from PyPDF2 import PdfReader
except Exception as e:  # pragma: no cover
    PdfReader = None  # We'll raise a helpful error at runtime.

# Local services
from app.services.vectorstore import vs_add

log = logging.getLogger("app.services.storage")

# Where uploaded files live (git-ignored)
UPLOAD_DIR = Path(os.getenv("UPLOAD_DIR", "uploaded_files")).resolve()
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)

# Where we store simple metadata about indexed PDFs
ROOT = Path(__file__).resolve().parents[2]
KB_FILE = ROOT / "knowledge_meta.json"


# ---------- small utils ----------

def _read_pdf_text(pdf_path: Path) -> Tuple[str, int]:
    """Extracts plain text from a PDF and returns (text, page_count)."""
    if PdfReader is None:
        raise RuntimeError(
            "PyPDF2 is not installed. Please add 'PyPDF2' to requirements.txt and pip install."
        )
    reader = PdfReader(str(pdf_path))
    pages = len(reader.pages)
    parts: List[str] = []
    for i in range(pages):
        try:
            txt = reader.pages[i].extract_text() or ""
        except Exception:
            txt = ""
        if txt.strip():
            parts.append(txt)
    text = "\n\n".join(parts).strip()
    return text, pages


def _chunk_text(
    text: str,
    chunk_chars: int = 1400,
    overlap: int = 200,
) -> List[str]:
    """Simple, robust character-based chunker."""
    text = (text or "").strip()
    if not text:
        return []

    chunks: List[str] = []
    start = 0
    n = len(text)
    while start < n:
        end = min(start + chunk_chars, n)
        # try to break on a nearby sentence boundary
        window = text[start:end]
        split_at = max(
            window.rfind("\n\n"),
            window.rfind(". "),
            window.rfind("? "),
            window.rfind("! "),
        )
        if split_at > 400:  # don't split too early
            end = start + split_at + 1

        chunks.append(text[start:end].strip())
        if end >= n:
            break
        start = max(0, end - overlap)

    return [c for c in chunks if c]


# ---------- main public API ----------

def save_and_index_pdf(
    file_path: str | Path,
    *,
    source: str = "upload",
    collection: Optional[str] = None,  # ignored here; collection is configured in vectorstore
) -> Dict[str, Any]:
    """
    Save (already on disk) PDF, extract text, chunk, embed, and index in Chroma.

    Returns:
        {
          "ok": true/false,
          "filename": "...",
          "pages": int,
          "chunks_indexed": int,
          "collection_info": {...},   # when ok == true
          "error": "..."              # when ok == false
        }
    """
    path = Path(file_path).resolve()
    if not path.exists():
        raise FileNotFoundError(f"File not found: {path}")

    # Ensure the file is inside UPLOAD_DIR (copy if user gave a path from Downloads/etc.)
    if UPLOAD_DIR not in path.parents:
        target = UPLOAD_DIR / path.name
        # Avoid clobbering a different file with same name
        if target.exists() and not target.samefile(path):
            target = UPLOAD_DIR / f"{target.stem}-{uuid.uuid4().hex[:8]}{target.suffix}"
        if not target.exists():
            target.write_bytes(path.read_bytes())
        path = target

    # Extract text
    try:
        text, pages = _read_pdf_text(path)
    except Exception as e:
        log.exception("PDF text extraction failed for %s", path)
        return {
            "ok": False,
            "filename": path.name,
            "pages": 0,
            "chunks_indexed": 0,
            "error": f"Text extraction failed: {e}",
        }

    if not text:
        return {
            "ok": False,
            "filename": path.name,
            "pages": pages,
            "chunks_indexed": 0,
            "error": "No text extracted from PDF (it may be scanned images). Enable OCR if needed.",
        }

    # Chunk
    chunks = _chunk_text(text, chunk_chars=1400, overlap=200)
    if not chunks:
        return {
            "ok": False,
            "filename": path.name,
            "pages": pages,
            "chunks_indexed": 0,
            "error": "Could not create chunks from extracted text.",
        }

    # Prepare docs for the vectorstore
    docs: List[Dict[str, Any]] = []
    for i, ch in enumerate(chunks, start=1):
        docs.append(
            {
                "id": f"{path.name}:{i}",
                "text": ch,
                "meta": {
                    "source": source,
                    "path": str(path),
                    "filename": path.name,
                    "chunk_index": i,
                    "chunks_total": len(chunks),
                    "pages": pages,
                },
            }
        )

    # Index in Chroma (vs_add should return: ids, info)
    try:
        ids, info = vs_add(docs)
    except Exception as e:
        log.exception("Indexing failed for %s", path)
        return {
            "ok": False,
            "filename": path.name,
            "pages": pages,
            "chunks_indexed": 0,
            "error": f"Indexing failed: {e}",
        }

    result = {
        "ok": True,
        "filename": path.name,
        "pages": pages,
        "chunks_indexed": len(ids),
        "collection_info": info,
    }
    log.info("Indexed PDF '%s' -> %s chunks", path.name, len(ids))

    # Persist simple metadata for the Knowledge Base Manager (/v1/knowledge)
    try:
        existing: List[Dict[str, Any]] = []
        if KB_FILE.exists():
            existing = json.loads(KB_FILE.read_text(encoding="utf-8"))
        existing.append(
            {
                "filename": path.name,
                "pages": pages,
                "chunks_indexed": len(ids),
                "added_at": datetime.utcnow().isoformat() + "Z",
            }
        )
        KB_FILE.write_text(json.dumps(existing, indent=2), encoding="utf-8")
    except Exception:
        # metadata tracking is non-critical, don't break main flow
        log.warning("Failed to update knowledge_meta.json", exc_info=True)

    return result


def extractive_answer(question: str, context: str) -> str:
    """
    Keep it deterministic & lightweight: return the best matching sentence window.
    (You can swap this for a real QA model later.)
    """
    if not context:
        return "No context available."
    # very naive: return first 500 chars of context as 'answer'
    return context[:500]
