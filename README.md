# 🧠 EduRAG — Learn From Your Documents  
_Retrieval-Augmented Generation System (FastAPI + Streamlit + ChromaDB)_

## 🚀 Features
- Upload PDFs/TXT or ingest URLs
- Hybrid (BM25 + Vector) search retrieval
- Ask questions and get context-aware answers with citations
- Auto-generate quizzes from uploaded content
- REST API (`FastAPI`) + Interactive UI (`Streamlit`)
- Modular codebase for scaling and research

## 🧰 Tech Stack
`Python 3.12` · `FastAPI` · `Streamlit` · `ChromaDB` · `Sentence-Transformers` · `PyTorch`

## ⚙️ Quickstart
```bash
# 1️⃣ Clone the repo
git clone https://github.com/phoneixvenkat/EDUrag.git
cd EDUrag

# 2️⃣ Set up venv
python -m venv .venv
.venv\Scripts\activate

# 3️⃣ Install dependencies
pip install -r requirements.txt

# 4️⃣ Run backend (FastAPI)
uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload

# 5️⃣ Run frontend (Streamlit)
$env:BACKEND_URL="http://127.0.0.1:8000"
streamlit run app/app_ui.py

feedback.md — user feedback plan

deliverables.md — final submission list

| Method | Route        | Description                          |
| :----: | :----------- | :----------------------------------- |
| `POST` | `/v1/upload` | Upload a document and index it       |
| `POST` | `/v1/query`  | Retrieve top chunks                  |
| `POST` | `/v1/answer` | Get generated answers with citations |
| `POST` | `/v1/quiz`   | Auto-generate quizzes                |
|  `GET` | `/healthz`   | Health check                         |


📚 Docs

See /docs folder for:

domain_corpus.md — your dataset/domain

approach_flow.md — pipeline & flowchart

citations.md — source referencing

feedback.md — user feedback plan

deliverables.md — final submission list
## 📊 Evaluation Results

This system was evaluated on 10 domain-specific questions about Transformer architecture from the "Attention Is All You Need" paper.

### Performance Summary (Mistral-7B)

| Metric | Value |
|--------|-------|
| Average Accuracy | 4.4/5.0 |
| Average Completeness | 4.5/5.0 |
| Average Clarity | 4.5/5.0 |
| **Overall Score** | **4.5/5.0** |
| Average Response Time | 4.3 minutes |

### Key Findings

1. **Zero Hallucination**: Model demonstrated exceptional factual grounding
2. **Epistemic Humility**: Explicitly acknowledged when context was insufficient
3. **Strong Citation Behavior**: 60% of responses included source references
4. **Retrieval-Dependent**: Performance directly correlated with retrieval quality
5. **Consistent Performance**: 80% of questions scored 4.0 or higher

### Evaluation Details

See our complete paper: [Link to paper PDF]

**Research Paper:** "Multi-Model RAG System Evaluation: Comparing Open-Source LLMs on Transformer Architecture Knowledge"
