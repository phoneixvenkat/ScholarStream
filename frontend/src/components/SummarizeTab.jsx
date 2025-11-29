import { useState } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';

const API_BASE = 'http://127.0.0.1:8000/v1';

function SummarizeTab({ documents }) {
  const [loading, setLoading] = useState(false);
  const [summary, setSummary] = useState(null);
  const [maxChunks, setMaxChunks] = useState(10);

  const handleGenerateSummary = async () => {
    setLoading(true);
    const startTime = Date.now();

    try {
      const response = await axios.post(`${API_BASE}/summarize`, {
        max_chunks: maxChunks
      });

      const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);

      setSummary({
        text: response.data.summary,
        time: elapsed,
        chunks: maxChunks
      });

      toast.success('Summary generated!');
    } catch (error) {
      console.error('Error:', error);
      toast.error('Failed to generate summary');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-500/10 to-emerald-500/10 border border-green-500/20 rounded-xl p-6">
        <h2 className="text-2xl font-bold text-white mb-2">📊 AI-Powered Document Summary</h2>
        <p className="text-slate-300">
          Get a concise summary of all your indexed documents
        </p>
      </div>

      {/* Settings */}
      <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl border border-slate-700/50 p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Summary Settings:</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Chunks to Analyze:
            </label>
            <select
              value={maxChunks}
              onChange={(e) => setMaxChunks(Number(e.target.value))}
              className="w-full px-4 py-2 bg-slate-900/50 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
              disabled={loading}
            >
              <option value={5}>5</option>
              <option value={8}>8</option>
              <option value={10}>10</option>
              <option value={15}>15</option>
              <option value={20}>20</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Focus Area:
            </label>
            <select
              className="w-full px-4 py-2 bg-slate-900/50 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
              disabled={loading}
            >
              <option value="all">All Topics</option>
            </select>
          </div>
        </div>

        <div className="flex justify-center mt-6">
          <button
            onClick={handleGenerateSummary}
            disabled={loading}
            className="px-8 py-3 bg-green-500 hover:bg-green-600 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {loading ? (
              <>
                <span className="animate-spin">⏳</span>
                <span>Generating Summary...</span>
              </>
            ) : (
              <>
                <span>✨</span>
                <span>Generate Summary</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Summary Display */}
      {summary && (
        <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl border border-slate-700/50 overflow-hidden">
          <div className="p-4 border-b border-slate-700/50 flex items-center justify-between bg-gradient-to-r from-green-500/10 to-emerald-500/10">
            <h3 className="text-lg font-semibold text-white">
              📄 Summary
            </h3>
            <span className="text-sm text-slate-400">Generated in {summary.time}s</span>
          </div>

          <div className="p-6">
            <div className="prose prose-invert max-w-none">
              <p className="text-slate-200 leading-relaxed whitespace-pre-wrap text-lg">
                {summary.text}
              </p>
            </div>

            <div className="mt-6 p-4 bg-slate-900/50 rounded-lg">
              <p className="text-sm text-slate-400">
                📊 Analyzed {summary.chunks} sections from {documents.length} document{documents.length !== 1 ? 's' : ''}
              </p>
            </div>

            <div className="flex gap-3 mt-6">
              <button 
                onClick={() => {
                  navigator.clipboard.writeText(summary.text);
                  toast.success('Copied to clipboard!');
                }}
                className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg text-sm transition-colors"
              >
                📋 Copy
              </button>
              <button className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg text-sm transition-colors">
                💾 Export
              </button>
              <button
                onClick={() => setSummary(null)}
                className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-sm transition-colors"
              >
                🔄 Regenerate
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default SummarizeTab;
