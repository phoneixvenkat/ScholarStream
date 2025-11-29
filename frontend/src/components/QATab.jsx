import { useState } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';

const API_BASE = 'http://127.0.0.1:8000/v1';

function QATab({ documents }) {
  const [question, setQuestion] = useState('');
  const [searchMode, setSearchMode] = useState('hybrid');
  const [model, setModel] = useState('phi3');
  const [loading, setLoading] = useState(false);
  const [answer, setAnswer] = useState(null);

  const handleAsk = async () => {
    if (!question.trim()) {
      toast.error('Please enter a question');
      return;
    }

    setLoading(true);
    const startTime = Date.now();

    try {
      const response = await axios.post(`${API_BASE}/query`, {
        query: question,
        model: model,
        mode: searchMode,
        top_k: 5
      });

      const elapsed = ((Date.now() - startTime) / 1000 / 60).toFixed(1);

      setAnswer({
        text: response.data.answer,
        sources: response.data.sources || [],
        model: response.data.model || model,
        time: elapsed
      });

      toast.success('Answer generated!');
    } catch (error) {
      console.error('Error:', error);
      toast.error('Failed to get answer: ' + (error.response?.data?.detail || error.message));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/20 rounded-xl p-6">
        <h2 className="text-2xl font-bold text-white mb-2">💬 Ask Questions About Your Documents</h2>
        <p className="text-slate-300">
          📚 Searching: {documents.length} document{documents.length !== 1 ? 's' : ''} ({documents.reduce((sum, doc) => sum + doc.chunks, 0)} chunks)
        </p>
      </div>

      {/* Question Input */}
      <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl border border-slate-700/50 p-6">
        <label className="block text-sm font-medium text-slate-300 mb-3">
          Your Question:
        </label>
        <textarea
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder="What is self-attention mechanism?"
          rows={4}
          className="w-full px-4 py-3 bg-slate-900/50 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors resize-none"
          disabled={loading}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Search Mode:
            </label>
            <select
              value={searchMode}
              onChange={(e) => setSearchMode(e.target.value)}
              className="w-full px-4 py-2 bg-slate-900/50 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
              disabled={loading}
            >
              <option value="hybrid">Hybrid (Recommended)</option>
              <option value="semantic">Semantic Only</option>
              <option value="bm25">BM25 Only</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Model:
            </label>
            <select
              value={model}
              onChange={(e) => setModel(e.target.value)}
              className="w-full px-4 py-2 bg-slate-900/50 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
              disabled={loading}
            >
              <option value="phi3">Phi-3-Mini (Fast)</option>
              <option value="mistral">Mistral-7B</option>
              <option value="llama3">LLaMA3-8B</option>
            </select>
          </div>
        </div>

        <div className="flex justify-center mt-6">
          <button
            onClick={handleAsk}
            disabled={loading || !question.trim()}
            className="px-8 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {loading ? (
              <>
                <span className="animate-spin">⏳</span>
                <span>Generating Answer...</span>
              </>
            ) : (
              <>
                <span>🚀</span>
                <span>Get Answer</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Answer Display */}
      {answer && (
        <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl border border-slate-700/50 overflow-hidden">
          <div className="p-4 border-b border-slate-700/50 flex items-center justify-between bg-gradient-to-r from-blue-500/10 to-purple-500/10">
            <h3 className="text-lg font-semibold text-white">
              📊 Answer ({answer.model})
            </h3>
            <span className="text-sm text-slate-400">{answer.time} min</span>
          </div>

          <div className="p-6">
            <div className="prose prose-invert max-w-none">
              <p className="text-slate-200 leading-relaxed whitespace-pre-wrap">
                {answer.text}
              </p>
            </div>

            {answer.sources && answer.sources.length > 0 && (
              <div className="mt-6 pt-6 border-t border-slate-700/50">
                <h4 className="text-sm font-semibold text-slate-300 mb-3">📚 Sources:</h4>
                <div className="space-y-2">
                  {answer.sources.map((source, idx) => (
                    <div key={idx} className="text-sm text-slate-400 bg-slate-900/30 p-3 rounded">
                      <p className="font-mono text-xs mb-1">Chunk {idx + 1}:</p>
                      <p className="line-clamp-2">{source.content}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex gap-3 mt-6">
              <button 
                onClick={() => {
                  navigator.clipboard.writeText(answer.text);
                  toast.success('Copied to clipboard!');
                }}
                className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg text-sm transition-colors"
              >
                📋 Copy
              </button>
              <button className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg text-sm transition-colors">
                💾 Save
              </button>
              <button className="px-4 py-2 bg-green-500/20 hover:bg-green-500/30 text-green-400 rounded-lg text-sm transition-colors">
                👍 Good
              </button>
              <button className="px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg text-sm transition-colors">
                👎 Bad
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default QATab;