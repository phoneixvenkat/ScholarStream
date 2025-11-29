import { useState } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';

const API_BASE = 'http://127.0.0.1:8000/v1';

function CompareTab({ documents }) {
  const [question, setQuestion] = useState('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);

  const handleCompare = async () => {
    if (!question.trim()) {
      toast.error('Please enter a question');
      return;
    }

    setLoading(true);
    const startTime = Date.now();

    try {
      const response = await axios.post(`${API_BASE}/compare`, {
        question: question,
        models: ['mistral', 'llama3', 'phi3']
      });

      const elapsed = ((Date.now() - startTime) / 1000 / 60).toFixed(1);

      setResults({
        responses: response.data.responses,
        time: elapsed
      });

      toast.success('Comparison complete!');
    } catch (error) {
      console.error('Error:', error);
      toast.error('Failed to compare models');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-orange-500/10 to-red-500/10 border border-orange-500/20 rounded-xl p-6">
        <h2 className="text-2xl font-bold text-white mb-2">⚖️ Compare AI Models Side-by-Side</h2>
        <p className="text-slate-300">
          Ask one question, get answers from 3 different models
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
          placeholder="What is self-attention?"
          rows={3}
          className="w-full px-4 py-3 bg-slate-900/50 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors resize-none"
          disabled={loading}
        />

        <div className="flex justify-center mt-6">
          <button
            onClick={handleCompare}
            disabled={loading || !question.trim()}
            className="px-8 py-3 bg-orange-500 hover:bg-orange-600 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {loading ? (
              <>
                <span className="animate-spin">⏳</span>
                <span>Comparing Models...</span>
              </>
            ) : (
              <>
                <span>🔬</span>
                <span>Compare 3 Models</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Comparison Results */}
      {results && results.responses && (
        <div className="space-y-4">
          {/* Model Responses Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Mistral */}
            {results.responses.mistral && (
              <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl border border-slate-700/50 overflow-hidden">
                <div className="p-4 border-b border-slate-700/50 bg-blue-500/10">
                  <h4 className="font-semibold text-white flex items-center gap-2">
                    🤖 Mistral-7B
                  </h4>
                  <p className="text-xs text-slate-400 mt-1">
                    Time: {results.responses.mistral.time || 'N/A'}
                  </p>
                </div>
                <div className="p-4">
                  <p className="text-sm text-slate-300 leading-relaxed">
                    {results.responses.mistral.answer?.substring(0, 300)}...
                  </p>
                  <div className="mt-3 text-xs text-slate-500">
                    Sources: {results.responses.mistral.sources?.length || 0}
                  </div>
                  <div className="flex gap-2 mt-3">
                    <button className="text-xs px-2 py-1 bg-green-500/20 hover:bg-green-500/30 text-green-400 rounded transition-colors">
                      👍
                    </button>
                    <button className="text-xs px-2 py-1 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded transition-colors">
                      👎
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* LLaMA3 */}
            {results.responses.llama3 && (
              <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl border border-slate-700/50 overflow-hidden">
                <div className="p-4 border-b border-slate-700/50 bg-purple-500/10">
                  <h4 className="font-semibold text-white flex items-center gap-2">
                    🦙 LLaMA3-8B
                  </h4>
                  <p className="text-xs text-slate-400 mt-1">
                    Time: {results.responses.llama3.time || 'N/A'}
                  </p>
                </div>
                <div className="p-4">
                  <p className="text-sm text-slate-300 leading-relaxed">
                    {results.responses.llama3.answer?.substring(0, 300)}...
                  </p>
                  <div className="mt-3 text-xs text-slate-500">
                    Sources: {results.responses.llama3.sources?.length || 0}
                  </div>
                  <div className="flex gap-2 mt-3">
                    <button className="text-xs px-2 py-1 bg-green-500/20 hover:bg-green-500/30 text-green-400 rounded transition-colors">
                      👍
                    </button>
                    <button className="text-xs px-2 py-1 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded transition-colors">
                      👎
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Phi-3 */}
            {results.responses.phi3 && (
              <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl border border-slate-700/50 overflow-hidden">
                <div className="p-4 border-b border-slate-700/50 bg-green-500/10">
                  <h4 className="font-semibold text-white flex items-center gap-2">
                    🔷 Phi-3-Mini
                  </h4>
                  <p className="text-xs text-slate-400 mt-1">
                    Time: {results.responses.phi3.time || 'N/A'}
                  </p>
                </div>
                <div className="p-4">
                  <p className="text-sm text-slate-300 leading-relaxed">
                    {results.responses.phi3.answer?.substring(0, 300)}...
                  </p>
                  <div className="mt-3 text-xs text-slate-500">
                    Sources: {results.responses.phi3.sources?.length || 0}
                  </div>
                  <div className="flex gap-2 mt-3">
                    <button className="text-xs px-2 py-1 bg-green-500/20 hover:bg-green-500/30 text-green-400 rounded transition-colors">
                      👍
                    </button>
                    <button className="text-xs px-2 py-1 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded transition-colors">
                      👎
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Winner */}
          <div className="bg-gradient-to-r from-yellow-500/10 to-orange-500/10 border border-yellow-500/20 rounded-xl p-4">
            <p className="text-center text-yellow-400 font-medium">
              🏆 Fastest: Phi-3-Mini | Most Sources: Mistral-7B
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

export default CompareTab;
