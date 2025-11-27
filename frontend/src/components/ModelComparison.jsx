// src/components/ModelComparison.jsx

import { useState } from "react";
import { Send, Loader, Copy, CheckCircle, Clock, AlertCircle } from "lucide-react";
import axios from "axios";

const API_PREFIX = "http://localhost:8000/v1";

function ModelComparison() {
  const [query, setQuery] = useState("");
  const [searchType, setSearchType] = useState("hybrid");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);
  const [copiedIndex, setCopiedIndex] = useState(null);
  const [errorMsg, setErrorMsg] = useState("");

  const models = [
    { id: "mistral", name: "Mistral 7B", color: "blue" },
    { id: "llama3", name: "LLaMA 3 8B", color: "purple" },
    { id: "phi3", name: "Phi-3 Mini", color: "green" },
  ];

  const handleQuery = async () => {
    if (!query.trim()) return;

    setLoading(true);
    setResults(null);
    setErrorMsg("");

    try {
      // Call all three models in parallel, using backend schema:
      // question, model, mode, top_k
      const requests = models.map((model) =>
        axios
          .post(`${API_PREFIX}/answer`, {
            question: query,
            model: model.id,
            mode: searchType, // "semantic" | "keyword" | "hybrid"
            top_k: 5,
          })
          .then((res) => ({
            model: model.id,
            ...res.data,
            timestamp: Date.now(),
          }))
          .catch((err) => {
            const detail = err?.response?.data?.detail;
            let message = "Model unavailable";
            if (Array.isArray(detail)) {
              message = detail.map((d) => d.msg ?? "").join("; ");
            } else if (typeof detail === "string") {
              message = detail;
            } else if (err.message) {
              message = err.message;
            }
            return {
              model: model.id,
              error: message,
              timestamp: Date.now(),
            };
          })
      );

      const responses = await Promise.all(requests);

      const resultsObj = {};
      responses.forEach((res) => {
        resultsObj[res.model] = res;
      });

      setResults(resultsObj);
    } catch (error) {
      console.error("Error querying models:", error);
      const detail = error?.response?.data?.detail;
      if (Array.isArray(detail)) {
        setErrorMsg(detail.map((d) => d.msg ?? "").join("; "));
      } else if (typeof detail === "string") {
        setErrorMsg(detail);
      } else {
        setErrorMsg(error.message || "Unexpected error while querying models.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = (text, index) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const getColorClass = (color, type = "bg") => {
    const colors = {
      blue: type === "bg" ? "bg-blue-600" : "border-blue-600",
      purple: type === "bg" ? "bg-purple-600" : "border-purple-600",
      green: type === "bg" ? "bg-green-600" : "border-green-600",
    };
    return colors[color];
  };

  return (
    <div className="space-y-6">
      {/* Query Input Section */}
      <div className="card">
        <h2 className="text-xl font-semibold mb-4">Ask a Question</h2>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">
              Your Question
            </label>
            <textarea
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Enter your question here..."
              className="input min-h-[100px] resize-none"
              onKeyDown={(e) => {
                if (e.key === "Enter" && e.ctrlKey) {
                  e.preventDefault();
                  handleQuery();
                }
              }}
            />
          </div>

          <div className="flex items-center space-x-4">
            <div className="flex-1">
              <label className="block text-sm font-medium mb-2">
                Search Type
              </label>
              <select
                value={searchType}
                onChange={(e) => setSearchType(e.target.value)}
                className="input"
              >
                <option value="semantic">Semantic (Vector)</option>
                <option value="keyword">Keyword (BM25)</option>
                <option value="hybrid">Hybrid (Both)</option>
              </select>
            </div>

            <button
              onClick={handleQuery}
              disabled={loading || !query.trim()}
              className="btn-primary flex items-center space-x-2 mt-7"
            >
              {loading ? (
                <>
                  <Loader className="w-4 h-4 animate-spin" />
                  <span>Processing...</span>
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span>Compare Models</span>
                </>
              )}
            </button>
          </div>

          <p className="text-sm text-gray-500 dark:text-gray-400">
            Press Ctrl+Enter to submit • Comparing {models.length} models
          </p>

          {errorMsg && (
            <div className="mt-2 flex items-start space-x-2 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 px-3 py-2 text-sm text-red-700 dark:text-red-200">
              <AlertCircle className="w-4 h-4 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}
        </div>
      </div>

      {/* Results Section */}
      {results && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {models.map((model, index) => {
            const result = results[model.id];
            const hasError = result && result.error;

            return (
              <div
                key={model.id}
                className={`card border-t-4 ${getColorClass(
                  model.color,
                  "border"
                )}`}
              >
                {/* Model Header */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-2">
                    <div
                      className={`w-3 h-3 rounded-full ${getColorClass(
                        model.color
                      )}`}
                    />
                    <h3 className="font-semibold">{model.name}</h3>
                  </div>

                  {result && result.time_ms && (
                    <div className="flex items-center space-x-1 text-sm text-gray-500">
                      <Clock className="w-4 h-4" />
                      <span>{result.time_ms}ms</span>
                    </div>
                  )}
                </div>

                {/* Response */}
                <div className="space-y-3">
                  {hasError ? (
                    <div className="bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-200 p-4 rounded-lg">
                      <p className="text-sm font-medium">Error</p>
                      <p className="text-sm mt-1">{result.error}</p>
                    </div>
                  ) : (
                    <>
                      <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                        <p className="text-sm leading-relaxed whitespace-pre-wrap">
                          {result?.answer || "No response"}
                        </p>
                      </div>

                      {Array.isArray(result?.used_chunks) &&
                        result.used_chunks.length > 0 && (
                          <details className="text-sm">
                            <summary className="cursor-pointer text-gray-500 hover:text-gray-700 dark:hover:text-gray-300">
                              View Retrieved Context (
                              {result.used_chunks.length} chunks)
                            </summary>
                            <div className="mt-2 space-y-2">
                              {result.used_chunks.slice(0, 3).map((ctx, i) => (
                                <div
                                  key={i}
                                  className="bg-gray-50 dark:bg-gray-700 p-3 rounded text-xs"
                                >
                                  {ctx.text || ctx.content || ""}
                                </div>
                              ))}
                            </div>
                          </details>
                        )}

                      <button
                        onClick={() => handleCopy(result?.answer || "", index)}
                        className="btn-secondary w-full flex items-center justify-center space-x-2"
                      >
                        {copiedIndex === index ? (
                          <>
                            <CheckCircle className="w-4 h-4" />
                            <span>Copied!</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-4 h-4" />
                            <span>Copy Response</span>
                          </>
                        )}
                      </button>
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {loading && (
        <div className="text-center py-12">
          <Loader className="w-8 h-8 animate-spin mx-auto text-primary-600" />
          <p className="mt-4 text-gray-500 dark:text-gray-400">
            Querying all models...
          </p>
        </div>
      )}
    </div>
  );
}

export default ModelComparison;
