// src/components/EvaluationPanel.jsx

import { useEffect, useState } from "react";
import {
  ListChecks,
  BarChart2,
  Loader,
  AlertCircle,
  Star,
  ThumbsUp,
  ThumbsDown,
} from "lucide-react";
import axios from "axios";

const API_PREFIX = "http://localhost:8000/v1";

const MODELS = [
  { id: "mistral", label: "Mistral 7B" },
  { id: "llama3", label: "LLaMA 3 8B" },
  { id: "phi3", label: "Phi-3 Mini" },
];

function EvaluationPanel() {
  const [evalList, setEvalList] = useState([]);
  const [loadingList, setLoadingList] = useState(false);
  const [listError, setListError] = useState("");

  const [question, setQuestion] = useState("");
  const [expected, setExpected] = useState("");
  const [modelScores, setModelScores] = useState({
    mistral: 3,
    llama3: 3,
    phi3: 3,
  });
  const [notes, setNotes] = useState("");
  const [localEvals, setLocalEvals] = useState([]);

  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [saveSuccess, setSaveSuccess] = useState("");

  useEffect(() => {
    const fetchEvaluations = async () => {
      try {
        setLoadingList(true);
        setListError("");
        const res = await axios.get(`${API_PREFIX}/evaluate`, {
          timeout: 30000,
        });
        const data = res.data || {};
        const raw =
          data.items ||
          data.evaluations ||
          data.results ||
          data.history ||
          [];
        setEvalList(Array.isArray(raw) ? raw : []);
      } catch (err) {
        console.error("Failed to load evaluations", err);
        setListError(
          err?.response?.data?.detail ||
            "Could not load evaluations from backend."
        );
      } finally {
        setLoadingList(false);
      }
    };

    fetchEvaluations();
  }, []);

  const handleScoreChange = (modelId, value) => {
    const v = Number(value);
    if (Number.isNaN(v)) return;
    const clamped = Math.min(5, Math.max(1, v));
    setModelScores((prev) => ({ ...prev, [modelId]: clamped }));
  };

  const addLocalEvaluation = () => {
    if (!question.trim() || !expected.trim()) return;

    const entry = {
      id: Date.now().toString(),
      question: question.trim(),
      expected: expected.trim(),
      scores: { ...modelScores },
      notes: notes.trim(),
      created_at: new Date().toISOString(),
    };

    setLocalEvals((prev) => [entry, ...prev]);
    setQuestion("");
    setExpected("");
    setNotes("");
    setModelScores({ mistral: 3, llama3: 3, phi3: 3 });
  };

  const handleSaveToBackend = async () => {
    if (localEvals.length === 0) return;

    const latest = localEvals[0];

    const payload = {
      id: latest.id,
      name: "manual-eval",
      question: latest.question,
      expected: latest.expected,
      scores: latest.scores,
      notes: latest.notes,
      created_at: latest.created_at,
    };

    try {
      setSaving(true);
      setSaveError("");
      setSaveSuccess("");
      await axios.post(`${API_PREFIX}/evaluate`, payload, {
        timeout: 30000,
      });
      setSaveSuccess("Latest evaluation saved to backend.");
    } catch (err) {
      console.error("Failed to save evaluation", err);
      setSaveError(
        err?.response?.data?.detail ||
          "Failed to save evaluation to backend."
      );
    } finally {
      setSaving(false);
      setTimeout(() => {
        setSaveSuccess("");
        setSaveError("");
      }, 3500);
    }
  };

  const computeAverageScore = (evalEntry) => {
    const s = evalEntry.scores || {};
    const vals = Object.values(s).filter(
      (v) => typeof v === "number" && !Number.isNaN(v)
    );
    if (vals.length === 0) return null;
    const sum = vals.reduce((acc, v) => acc + v, 0);
    return (sum / vals.length).toFixed(2);
  };

  return (
    <div className="space-y-6">
      {/* Manual evaluation builder */}
      <div className="card space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <ListChecks className="w-5 h-5 text-primary-600 dark:text-primary-400" />
            <div>
              <h2 className="text-lg font-semibold">Manual Evaluation</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Create evaluation cases and score each model from 1–5.
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">
              Question / Prompt
            </label>
            <textarea
              className="input min-h-[80px] resize-none"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="Enter the question you asked the models..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Expected / Ideal Answer (reference)
            </label>
            <textarea
              className="input min-h-[80px] resize-none"
              value={expected}
              onChange={(e) => setExpected(e.target.value)}
              placeholder="Write the ideal answer you would like to see..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Model Scores (1–5)
            </label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {MODELS.map((m) => (
                <div
                  key={m.id}
                  className="flex items-center justify-between space-x-3 rounded-lg border border-gray-200 dark:border-gray-700 px-3 py-2"
                >
                  <div className="flex items-center space-x-2">
                    <Star className="w-4 h-4 text-yellow-500" />
                    <span className="text-sm font-medium">{m.label}</span>
                  </div>
                  <input
                    type="number"
                    min={1}
                    max={5}
                    value={modelScores[m.id]}
                    onChange={(e) => handleScoreChange(m.id, e.target.value)}
                    className="w-16 input px-2 py-1 text-center"
                  />
                </div>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Notes (optional)
            </label>
            <textarea
              className="input min-h-[60px] resize-none"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Qualitative comments about faithfulness, fluency, hallucinations, etc."
            />
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={addLocalEvaluation}
              className="btn-primary flex items-center space-x-2"
              disabled={!question.trim() || !expected.trim()}
            >
              <ThumbsUp className="w-4 h-4" />
              <span>Add to Local List</span>
            </button>

            <button
              type="button"
              onClick={handleSaveToBackend}
              disabled={saving || localEvals.length === 0}
              className="btn-secondary flex items-center space-x-2"
            >
              {saving ? (
                <>
                  <Loader className="w-4 h-4 animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <BarChart2 className="w-4 h-4" />
                  <span>Save Latest to Backend</span>
                </>
              )}
            </button>

            {saveSuccess && (
              <span className="text-sm text-green-600 dark:text-green-400 flex items-center space-x-1">
                <ThumbsUp className="w-4 h-4" />
                <span>{saveSuccess}</span>
              </span>
            )}

            {saveError && (
              <span className="text-sm text-red-600 dark:text-red-400 flex items-center space-x-1">
                <ThumbsDown className="w-4 h-4" />
                <span>{saveError}</span>
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Backend evaluation history */}
      <div className="card space-y-4">
        <div className="flex items-center space-x-2">
          <BarChart2 className="w-5 h-5 text-primary-600 dark:text-primary-400" />
          <div>
            <h3 className="text-base font-semibold">
              Stored Evaluations (Backend)
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Loaded from <code className="font-mono text-xs">/v1/evaluate</code>
            </p>
          </div>
        </div>

        {loadingList && (
          <div className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
            <Loader className="w-4 h-4 animate-spin" />
            <span>Loading evaluations...</span>
          </div>
        )}

        {listError && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg px-3 py-2 flex items-start space-x-2 text-sm">
            <AlertCircle className="w-4 h-4 text-red-600 dark:text-red-300 mt-0.5" />
            <span>{listError}</span>
          </div>
        )}

        {!loadingList && !listError && evalList.length === 0 && (
          <p className="text-sm text-gray-500 dark:text-gray-400">
            No evaluations stored yet.
          </p>
        )}

        {!loadingList && evalList.length > 0 && (
          <div className="space-y-3 max-h-80 overflow-y-auto">
            {evalList.map((e) => (
              <div
                key={e.id ?? e.name ?? e.question}
                className="rounded-lg border border-gray-200 dark:border-gray-700 p-3 text-sm space-y-1"
              >
                <div className="flex items-center justify-between">
                  <p className="font-medium truncate">
                    {e.name || e.question || "Evaluation"}
                  </p>
                  {computeAverageScore(e) && (
                    <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 dark:bg-gray-700">
                      Avg: {computeAverageScore(e)}
                    </span>
                  )}
                </div>
                {e.question && (
                  <p className="text-gray-600 dark:text-gray-300">
                    Q: {e.question}
                  </p>
                )}
                {e.expected && (
                  <p className="text-gray-500 dark:text-gray-400 text-xs">
                    Ref: {e.expected}
                  </p>
                )}
                {e.created_at && (
                  <p className="text-[11px] text-gray-400 mt-1">
                    {e.created_at}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Local-only evaluations list */}
      {localEvals.length > 0 && (
        <div className="card space-y-3">
          <div className="flex items-center space-x-2">
            <ListChecks className="w-4 h-4 text-primary-600 dark:text-primary-400" />
            <h3 className="text-base font-semibold">Local Evaluations</h3>
          </div>
          <div className="space-y-3 max-h-64 overflow-y-auto text-sm">
            {localEvals.map((e) => (
              <div
                key={e.id}
                className="rounded-lg border border-gray-200 dark:border-gray-700 p-3 space-y-1"
              >
                <p className="font-medium">{e.question}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Expected: {e.expected}
                </p>
                <div className="flex flex-wrap gap-2 text-xs mt-1">
                  {MODELS.map((m) => (
                    <span
                      key={m.id}
                      className="px-2 py-0.5 rounded-full bg-gray-100 dark:bg-gray-700"
                    >
                      {m.label}: {e.scores[m.id]}
                    </span>
                  ))}
                </div>
                {e.notes && (
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Notes: {e.notes}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default EvaluationPanel;
