# EDUrag - Installation & Setup Guide

This guide will help you clone and run the EDUrag project on your local machine.

---

## 📋 Prerequisites

Before starting, ensure you have:

- **Python 3.10+** installed ([Download Python](https://www.python.org/downloads/))
- **Node.js 18+** and npm installed ([Download Node.js](https://nodejs.org/))
- **Git** installed ([Download Git](https://git-scm.com/downloads))
- **Ollama** installed for running local LLMs ([Download Ollama](https://ollama.ai/download))
- At least **8GB RAM** (16GB recommended)
- At least **10GB free disk space**

---

## 🚀 Quick Start (Step-by-Step)

### **Step 1: Clone the Repository**

```bash
# Open terminal/command prompt and run:
git clone https://github.com/phoneixvenkat/EDUrag.git

# Navigate into the project directory:
cd EDUrag
```

---

### **Step 2: Download Required LLM Models**

Before running the backend, download the required models using Ollama:

```bash
# Download Phi-3-Mini (fastest, recommended for testing)
ollama pull phi3

# Download Mistral-7B (better quality, slower)
ollama pull mistral

# Download LLaMA3-8B (alternative option)
ollama pull llama3
```

**Note:** Each model is 4-7GB. Download at least `phi3` to get started quickly.

---

### **Step 3: Backend Setup**

#### **3.1. Navigate to Project Root**
```bash
cd EDUrag
```

#### **3.2. Create Virtual Environment**

**On Windows:**
```powershell
python -m venv .venv
.venv\Scripts\activate
```

**On Mac/Linux:**
```bash
python3 -m venv .venv
source .venv/bin/activate
```

#### **3.3. Install Python Dependencies**
```bash
pip install --upgrade pip
pip install -r requirements.txt
```

**If you get errors, install packages individually:**
```bash
pip install fastapi uvicorn python-multipart
pip install langchain langchain-community
pip install chromadb sentence-transformers
pip install pypdf beautifulsoup4 requests
pip install ollama pydantic
```

#### **3.4. Start the Backend Server**
```bash
python -m uvicorn app.main:app --reload
```

**You should see:**
```
INFO:     Uvicorn running on http://127.0.0.1:8000 (Press CTRL+C to quit)
INFO:     Started reloader process
INFO:     Started server process
INFO:     Application startup complete.
```

✅ Backend is now running at: **http://127.0.0.1:8000**

**Keep this terminal open!**

---

### **Step 4: Frontend Setup**

#### **4.1. Open a NEW Terminal/Command Prompt**

#### **4.2. Navigate to Frontend Directory**
```bash
cd EDUrag/frontend
```

#### **4.3. Install Node Dependencies**
```bash
npm install
```

**This will install:**
- React
- Vite
- TailwindCSS
- Axios
- React Hot Toast
- Recharts
- And other dependencies

#### **4.4. Start the Frontend**
```bash
npm run dev
```

**You should see:**
```
VITE v5.x.x  ready in xxx ms

➜  Local:   http://localhost:5173/
➜  Network: use --host to expose
```

✅ Frontend is now running at: **http://localhost:5173**

---

### **Step 5: Open the Application**

1. Open your browser
2. Go to: **http://localhost:5173**
3. You should see the EDUrag interface with the Upload tab!

---

## 🧪 Testing the Application

### **Test 1: Upload a PDF**
1. Click on the **Upload** tab
2. Drag & drop a PDF file or click to browse
3. Wait for upload to complete
4. You should see the content preview and chunks

### **Test 2: Ask a Question**
1. Click on the **Q&A** tab
2. Type a question: "what is this document about?"
3. Select model: **Phi-3-Mini (Fast)**
4. Click **Get Answer**
5. Wait 30-60 seconds for the answer

### **Test 3: Generate a Quiz**
1. Click on the **Quiz** tab
2. Select number of questions: **5**
3. Click **Generate Quiz**
4. Wait 60-90 seconds
5. Answer the questions!

### **Test 4: Generate Summary**
1. Click on **More** → **Summarize**
2. Click **Generate Summary**
3. Wait <1 second (Phi-3 is very fast!)
4. View the summary

---

## 📁 Project Structure

```
EDUrag/
├── app/                      # Backend (FastAPI)
│   ├── api/                  # API routes
│   │   ├── routes_documents.py
│   │   ├── routes_query.py
│   │   ├── routes_quiz.py
│   │   ├── routes_summarize.py
│   │   └── routes_url.py
│   ├── services/             # Business logic
│   │   ├── vectorstore.py
│   │   ├── llm.py
│   │   ├── generator.py
│   │   └── ...
│   ├── config.py             # Configuration
│   └── main.py               # FastAPI app entry point
│
├── frontend/                 # Frontend (React + Vite)
│   ├── src/
│   │   ├── components/       # React components
│   │   │   ├── UploadTab.jsx
│   │   │   ├── QATab.jsx
│   │   │   ├── QuizTab.jsx
│   │   │   ├── SummarizeTab.jsx
│   │   │   └── CompareTab.jsx
│   │   ├── App.jsx           # Main app component
│   │   └── main.jsx          # Entry point
│   ├── package.json          # Node dependencies
│   └── vite.config.js        # Vite configuration
│
├── data/                     # Data storage
│   ├── chroma_db/            # Vector database
│   └── uploads/              # Uploaded files
│
├── requirements.txt          # Python dependencies
├── README.md                 # Project overview
└── INSTALLATION.md           # This file
```

---

## 🔧 Troubleshooting

### **Problem: Backend won't start**

**Error: "ModuleNotFoundError: No module named 'XXX'"**
```bash
# Activate virtual environment first
.venv\Scripts\activate   # Windows
source .venv/bin/activate  # Mac/Linux

# Then install missing package
pip install XXX
```

**Error: "Port 8000 already in use"**
```bash
# Use a different port
python -m uvicorn app.main:app --reload --port 8001
```

---

### **Problem: Frontend won't start**

**Error: "npm: command not found"**
- Install Node.js from https://nodejs.org/

**Error: "npm install fails"**
```bash
# Delete node_modules and try again
rm -rf node_modules package-lock.json  # Mac/Linux
rmdir /s node_modules & del package-lock.json  # Windows

npm install
```

**Error: "Port 5173 already in use"**
```bash
# Kill the process or use different port
npm run dev -- --port 5174
```

---

### **Problem: Ollama not working**

**Error: "Connection refused to localhost:11434"**
```bash
# Check if Ollama is running
ollama list

# If not, start Ollama service
# On Windows: Open Ollama app
# On Mac: ollama serve
# On Linux: sudo systemctl start ollama
```

**Error: "Model not found"**
```bash
# Download the model
ollama pull phi3
```

---

### **Problem: ChromaDB errors**

**Error: "sqlite3.OperationalError"**
```bash
# Delete the ChromaDB folder and restart
rm -rf data/chroma_db  # Mac/Linux
rmdir /s data\chroma_db  # Windows

# Restart backend - it will recreate the database
```

---

### **Problem: Q&A returns no answer**

**Check:**
1. ✅ Did you upload a document first?
2. ✅ Is Ollama running? (`ollama list`)
3. ✅ Is the model downloaded? (`ollama pull phi3`)
4. ✅ Check backend terminal for errors

---

### **Problem: Slow performance**

**Solutions:**
1. Use **Phi-3-Mini** (fastest model)
2. Reduce number of chunks: `top_k: 3` instead of `5`
3. Use smaller PDFs for testing
4. Close other applications to free up RAM

---

## 🌐 API Endpoints

Once backend is running, you can test the API at:
- **API Docs:** http://127.0.0.1:8000/docs
- **Health Check:** http://127.0.0.1:8000/v1/health

**Available Endpoints:**
- `POST /v1/upload` - Upload PDF
- `POST /v1/url` - Fetch URL content
- `POST /v1/query` - Ask a question
- `POST /v1/quiz/generate` - Generate quiz
- `POST /v1/summarize` - Generate summary

---

## 💾 Data Persistence

**Important Notes:**

1. **Uploaded Documents:** Stored in `data/uploads/`
2. **Vector Database:** Stored in `data/chroma_db/`
3. **These folders persist between sessions**
4. **To reset:** Delete these folders and restart

---

## 🎓 Models Comparison

| Model | Size | Speed | Quality | Recommended For |
|-------|------|-------|---------|-----------------|
| **Phi-3-Mini** | 3.8B | ⚡ Very Fast | ✅ Good | Testing, Quick answers |
| **Mistral-7B** | 7.3B | 🐢 Slow | ✅✅ Better | Production, Detailed answers |
| **LLaMA3-8B** | 8B | 🐢 Slow | ✅✅ Better | Alternative to Mistral |

**Recommendation:** Start with **Phi-3** for faster testing!

---

## 📝 Configuration

### **Backend Configuration**

Edit `app/config.py` to change:
- Chunk size (default: 500 characters)
- Chunk overlap (default: 50 characters)
- Default model (default: phi3)
- API port (default: 8000)

### **Frontend Configuration**

Edit `frontend/src/components/QATab.jsx` to change:
- API base URL (default: http://127.0.0.1:8000/v1)
- Default model selection
- UI settings

---

## 🆘 Getting Help

**If you encounter issues:**

1. **Check the terminal logs** - Both backend and frontend show errors
2. **Check browser console** - Press F12 in browser
3. **Verify all prerequisites** - Python, Node.js, Ollama installed
4. **Read error messages carefully** - They usually tell you what's wrong
5. **Contact the team** - Share screenshots of errors

---

## ✅ Verification Checklist

Before asking for help, verify:

- [ ] Python 3.10+ installed (`python --version`)
- [ ] Node.js 18+ installed (`node --version`)
- [ ] Git installed (`git --version`)
- [ ] Ollama installed (`ollama list`)
- [ ] At least one model downloaded (`ollama list` shows phi3)
- [ ] Virtual environment activated (see `(.venv)` in terminal)
- [ ] Requirements installed (`pip list` shows fastapi, langchain, etc.)
- [ ] Backend running (http://127.0.0.1:8000/docs works)
- [ ] Frontend running (http://localhost:5173 works)

---

## 🎯 Quick Commands Reference

```bash
# Clone project
git clone https://github.com/phoneixvenkat/EDUrag.git
cd EDUrag

# Backend setup
python -m venv .venv
.venv\Scripts\activate          # Windows
source .venv/bin/activate       # Mac/Linux
pip install -r requirements.txt
python -m uvicorn app.main:app --reload

# Frontend setup (new terminal)
cd frontend
npm install
npm run dev

# Download models
ollama pull phi3
ollama pull mistral
ollama pull llama3
```

---

## 🚀 You're All Set!

Your EDUrag system should now be running!

**Test it out:**
1. Upload a PDF document
2. Ask questions about it
3. Generate quizzes
4. Create summaries
5. Compare different LLM responses

**Enjoy! 🎉**

---

## 📧 Support

**Project Repository:** https://github.com/phoneixvenkat/EDUrag

**Documentation:**
- README.md - Project overview
- INSTALLATION.md - This file
- API Docs - http://127.0.0.1:8000/docs (when running)

---

**Last Updated:** November 29, 2025
**Version:** 2.0.0
