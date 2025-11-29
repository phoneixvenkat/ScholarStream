# EDUrag: Multi-Model RAG System for Transformer Architecture Analysis

A Retrieval-Augmented Generation (RAG) system that compares responses from three open-source LLM models (Mistral-7B, LLaMA3-8B, and Phi-3-Mini) on domain-specific questions about Transformer architecture and NLP.

**Course:** DSCI 6004 - Natural Language Processing  
**Term Project:** RAG System Development and LLM Comparison  
**Date:** December 2025

---

## 🎯 Project Overview

This project implements a complete RAG pipeline to:
- Upload and index PDF documents (specifically the "Attention Is All You Need" paper)
- Perform hybrid retrieval (semantic + keyword search) using ChromaDB
- Generate answers using three different open-source LLMs
- Compare model performance across 15 domain-specific questions
- Analyze differences in response quality, accuracy, and reasoning

### Key Features

- ✅ **Multi-Model Comparison:** Side-by-side evaluation of Mistral, LLaMA3, and Phi-3
- ✅ **Hybrid Retrieval:** Combines semantic (vector) and keyword (BM25) search
- ✅ **RESTful API:** FastAPI backend with comprehensive endpoints
- ✅ **React Frontend:** Interactive UI for querying and comparison
- ✅ **Benchmark System:** Automated evaluation on 15 domain questions
- ✅ **Comprehensive Logging:** Tracks response times, token counts, and quality metrics

---

## 🏗️ System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     User Interface (React)                   │
└────────────────────────┬────────────────────────────────────┘
                         │ HTTP/REST API
┌────────────────────────┴────────────────────────────────────┐
│                    FastAPI Backend                           │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │   Upload     │  │    Query     │  │   Compare    │     │
│  │   Service    │  │   Service    │  │   Service    │     │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘     │
│         │                  │                  │              │
│  ┌──────┴──────────────────┴──────────────────┴────────┐   │
│  │           RAG Pipeline Manager                       │   │
│  │  ┌─────────────┐        ┌─────────────┐            │   │
│  │  │  Chunking   │        │  Retrieval  │            │   │
│  │  │  (500 char) │        │  (Hybrid)   │            │   │
│  │  └─────────────┘        └─────────────┘            │   │
│  └───────────────────────────────────────────────────┘   │
│         │                           │                      │
│  ┌──────┴──────┐           ┌────────┴────────┐           │
│  │ Vector DB   │           │  LLM Providers  │           │
│  │ (ChromaDB)  │           │  (Via Ollama)   │           │
│  │             │           │                  │           │
│  │ - Semantic  │           │  ┌───────────┐  │           │
│  │ - BM25      │           │  │ Mistral   │  │           │
│  │ - MiniLM    │           │  │ LLaMA3    │  │           │
│  └─────────────┘           │  │ Phi-3     │  │           │
│                            │  └───────────┘  │           │
│                            └─────────────────┘           │
└──────────────────────────────────────────────────────────┘
```

---

## 🚀 Installation & Setup

### Prerequisites

1. **Python 3.10+**
2. **Node.js 18+** (for frontend)
3. **Ollama** (for running LLMs locally)

### Step 1: Install Ollama and Models

```bash
# Install Ollama (visit https://ollama.ai for your OS)

# Pull the three models
ollama pull mistral
ollama pull llama3
ollama pull phi3

# Verify models are installed
ollama list
```

### Step 2: Clone Repository

```bash
git clone https://github.com/[your-username]/edurag-project.git
cd edurag-project
```

### Step 3: Backend Setup

```bash
# Create virtual environment
python -m venv .venv

# Activate virtual environment
# Windows:
.venv\Scripts\activate
# Linux/Mac:
source .venv/bin/activate

# Install dependencies
pip install -r requirements.txt
```

### Step 4: Frontend Setup

```bash
cd frontend
npm install
cd ..
```

---

## 🎮 Usage

### Starting the System

**Terminal 1 - Backend:**
```bash
# Activate virtual environment
.venv\Scripts\activate  # Windows
# source .venv/bin/activate  # Linux/Mac

# Start FastAPI server
python -m uvicorn app.main:app --reload
```

Backend will be available at: `http://127.0.0.1:8000`

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```

Frontend will be available at: `http://localhost:5173` (or similar)

### API Documentation

Interactive API docs: `http://127.0.0.1:8000/docs`

---

## 📡 API Endpoints

### Health Check
```bash
GET /health
```

### Document Management
```bash
# Upload PDF
POST /upload
Content-Type: multipart/form-data
Body: file (PDF file)
```

### Query Endpoints

**Single Model Query:**
```bash
POST /v1/answer
Content-Type: application/json
Body: {
  "question": "What is self-attention?",
  "top_k": 4,
  "model": "mistral"
}
```

**Multi-Model Comparison:**
```bash
POST /v1/compare
Content-Type: application/json
Body: {
  "question": "What is self-attention?",
  "top_k": 4,
  "models": ["mistral", "llama3", "phi3"]
}
```

**Benchmark Evaluation:**
```bash
POST /v1/benchmarks/run
Content-Type: application/json
Body: {
  "top_k": 4,
  "models": ["mistral", "llama3", "phi3"]
}
```

**Model Status:**
```bash
GET /v1/models/status
```

---

## 🧪 Running Evaluation

### Quick Test

```bash
# Using PowerShell (Windows):
$body = @{
    question = "Explain the Transformer architecture"
    top_k = 4
    models = @("mistral", "llama3", "phi3")
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://127.0.0.1:8000/v1/compare" `
    -Method Post `
    -ContentType "application/json" `
    -Body $body
```

```bash
# Using curl (Linux/Mac):
curl -X POST "http://127.0.0.1:8000/v1/compare" \
  -H "Content-Type: application/json" \
  -d '{
    "question": "Explain the Transformer architecture",
    "top_k": 4,
    "models": ["mistral", "llama3", "phi3"]
  }'
```

### Full Benchmark

```bash
# Run all 15 questions through all models
$body = @{
    top_k = 4
    models = @("mistral", "llama3", "phi3")
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://127.0.0.1:8000/v1/benchmarks/run" `
    -Method Post `
    -ContentType "application/json" `
    -Body $body | ConvertTo-Json -Depth 10 | Out-File results.json
```

---

## 📁 Project Structure

```
edurag-project/
├── app/
│   ├── api/                      # API route handlers
│   │   ├── routes_answer.py      # Single model queries
│   │   ├── routes_compare.py     # Multi-model comparison
│   │   ├── routes_benchmarks.py  # Benchmark evaluation
│   │   ├── routes_documents.py   # Document upload
│   │   └── routes_health.py      # Health checks
│   ├── services/                 # Business logic
│   │   ├── llm.py               # LLM integration
│   │   ├── vectorstore.py       # ChromaDB operations
│   │   ├── pipeline.py          # RAG pipeline
│   │   ├── generator.py         # Response generation
│   │   ├── storage.py           # Document processing
│   │   └── bm25_index.py        # Keyword search
│   ├── core/                     # Core utilities
│   │   └── schemas.py           # Pydantic models
│   └── main.py                   # FastAPI application
├── frontend/                     # React application
│   ├── src/
│   │   ├── components/          # React components
│   │   └── App.jsx              # Main app
│   └── package.json
├── benchmark_questions.json      # Evaluation questions
├── requirements.txt              # Python dependencies
├── README.md                     # This file
└── uploaded_files/              # PDF storage (created on first upload)
```

---

## 🔬 Evaluation Methodology

### Question Set

15 domain-specific questions covering:
- **Basic concepts** (5 questions): Fundamental Transformer concepts
- **Intermediate topics** (7 questions): Detailed mechanisms and comparisons
- **Advanced topics** (3 questions): Complex trade-offs and optimizations

### Evaluation Metrics

For each model response, we assess:

1. **Factual Accuracy (1-5):** Correctness of information from source
2. **Completeness (1-5):** Coverage of key aspects
3. **Clarity (1-5):** Organization and readability
4. **Context Utilization (1-5):** Effective use of retrieved chunks
5. **Response Time (ms):** Speed of generation
6. **Response Length (tokens):** Verbosity measure

### Comparison Dimensions

- Response quality across difficulty levels
- Handling of technical concepts
- Use of examples and explanations
- Hallucination patterns
- Speed vs accuracy trade-offs

---

## 📊 Key Findings

[**Note:** Fill this in after running your evaluation]

### Overall Performance

| Model | Avg Accuracy | Avg Completeness | Avg Clarity | Avg Time (ms) | Overall Score |
|-------|--------------|------------------|-------------|---------------|---------------|
| Mistral-7B | X.X/5 | X.X/5 | X.X/5 | XXX | X.X/5 |
| LLaMA3-8B | X.X/5 | X.X/5 | X.X/5 | XXX | X.X/5 |
| Phi-3-Mini | X.X/5 | X.X/5 | X.X/5 | XXX | X.X/5 |

### Model Strengths

**Mistral-7B:**
- [Finding 1]
- [Finding 2]

**LLaMA3-8B:**
- [Finding 1]
- [Finding 2]

**Phi-3-Mini:**
- [Finding 1]
- [Finding 2]

---

## 🛠️ Technical Details

### Models Used

1. **Mistral-7B**
   - Parameters: 7.3B
   - Context window: 8K tokens
   - Architecture: Transformer decoder

2. **LLaMA3-8B**
   - Parameters: 8B
   - Context window: 8K tokens
   - Architecture: Transformer decoder

3. **Phi-3-Mini**
   - Parameters: 3.8B
   - Context window: 4K tokens
   - Architecture: Optimized transformer

### Retrieval Configuration

- **Embedding Model:** sentence-transformers/all-MiniLM-L6-v2
- **Vector Database:** ChromaDB with persistent storage
- **Chunking:** 500 characters with 50 character overlap
- **Hybrid Retrieval:** 
  - Semantic search using cosine similarity
  - Keyword search using BM25
  - Score normalization and merging
- **Top-K:** 4 chunks retrieved per query

### Prompt Engineering

```
Context: [Retrieved chunks]

Question: [User question]

Answer the question based on the provided context. 
Be specific and cite relevant information from the context.
```

---

## 🐛 Troubleshooting

### Models Not Available

```bash
# Check Ollama is running
ollama list

# Pull missing models
ollama pull mistral
ollama pull llama3
ollama pull phi3
```

### ChromaDB Issues

```bash
# Delete and recreate database
rm -rf chroma_db/
# Restart server and re-upload PDF
```

### Port Already in Use

```bash
# Change port in command
python -m uvicorn app.main:app --reload --port 8001
```

### PDF Upload Fails

- Ensure `uploaded_files/` directory exists
- Check PDF is valid and not corrupted
- Verify sufficient disk space

---

## 📝 Citation

If you use this project, please cite:

```bibtex
@misc{edurag2025,
  title={EDUrag: Multi-Model RAG System for Transformer Architecture Analysis},
  author={[Your Name]},
  year={2025},
  howpublished={\url{https://github.com/[your-username]/edurag-project}}
}
```

### Key References

1. Vaswani et al. (2017). Attention Is All You Need. NeurIPS.
2. Lewis et al. (2020). Retrieval-Augmented Generation for Knowledge-Intensive NLP Tasks. NeurIPS.
3. Touvron et al. (2023). LLaMA: Open and Efficient Foundation Language Models.
4. Jiang et al. (2023). Mistral 7B.
5. Microsoft (2024). Phi-3 Technical Report.

---

## 📜 License

This project is for educational purposes as part of DSCI 6004 coursework.

---

## 👥 Contributors

- [Your Name] - [Your Email]
- [Team Member 2] (if applicable)
- [Team Member 3] (if applicable)

---

## 🙏 Acknowledgments

- Course: DSCI 6004 - Natural Language Processing
- Instructor: [Instructor Name]
- Institution: [Your University]
- Ollama team for local LLM deployment
- Anthropic for Claude assistance in development

---

## 📧 Contact

For questions or issues, please open an issue on GitHub or contact [your-email@example.com]

---

**Last Updated:** December 2025
