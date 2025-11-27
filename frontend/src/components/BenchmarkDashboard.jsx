import { useState, useEffect } from 'react'
import { Play, Download, Loader, CheckCircle } from 'lucide-react'
import axios from 'axios'

function BenchmarkDashboard() {
  const [questions, setQuestions] = useState([])
  const [running, setRunning] = useState(false)
  const [results, setResults] = useState([])
  const [progress, setProgress] = useState(0)

  // Sample benchmark questions - replace with your actual questions
  const benchmarkQuestions = [
    "What is Retrieval-Augmented Generation (RAG)?",
    "How does semantic search differ from keyword search?",
    "What are the main components of a RAG system?",
    "Explain the role of vector embeddings in RAG.",
    "What is the purpose of chunking in document processing?",
    "How does BM25 ranking algorithm work?",
    "What are the advantages of hybrid search?",
    "Describe the process of indexing documents in a vector database.",
    "What metrics are used to evaluate RAG system performance?",
    "How can hallucinations be reduced in LLM responses?"
  ]

  useEffect(() => {
    setQuestions(benchmarkQuestions.map((q, i) => ({
      id: i + 1,
      question: q,
      status: 'pending'
    })))
  }, [])

  const runBenchmarks = async () => {
    setRunning(true)
    setResults([])
    setProgress(0)

    const models = ['mistral', 'llama3', 'phi3']
    const newResults = []

    for (let i = 0; i < questions.length; i++) {
      const question = questions[i]
      const questionResults = { question: question.question, models: {} }

      for (const model of models) {
        try {
          const startTime = Date.now()
          const response = await axios.post('http://localhost:8000/v1/answer', {
            query: question.question,
            model: model,
            search_type: 'hybrid'
          })
          const endTime = Date.now()

          questionResults.models[model] = {
            answer: response.data.answer,
            time: endTime - startTime,
            status: 'success'
          }
        } catch (error) {
          questionResults.models[model] = {
            answer: 'Error: ' + (error.response?.data?.detail || 'Failed'),
            time: 0,
            status: 'error'
          }
        }
      }

      newResults.push(questionResults)
      setResults([...newResults])
      setProgress(((i + 1) / questions.length) * 100)
    }

    setRunning(false)
  }

  const exportResults = () => {
    const csv = [
      ['Question', 'Mistral Answer', 'LLaMA3 Answer', 'Phi-3 Answer', 'Mistral Time (ms)', 'LLaMA3 Time (ms)', 'Phi-3 Time (ms)'],
      ...results.map(r => [
        r.question,
        r.models.mistral?.answer || 'N/A',
        r.models.llama3?.answer || 'N/A',
        r.models.phi3?.answer || 'N/A',
        r.models.mistral?.time || 0,
        r.models.llama3?.time || 0,
        r.models.phi3?.time || 0
      ])
    ].map(row => row.map(cell => `"${cell}"`).join(',')).join('\n')

    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `benchmark_results_${Date.now()}.csv`
    a.click()
  }

  return (
    <div className="space-y-6">
      {/* Control Panel */}
      <div className="card">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold">Benchmark Suite</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              {questions.length} questions across 3 models
            </p>
          </div>
          
          <div className="flex space-x-3">
            <button
              onClick={runBenchmarks}
              disabled={running}
              className="btn-primary flex items-center space-x-2"
            >
              {running ? (
                <>
                  <Loader className="w-4 h-4 animate-spin" />
                  <span>Running...</span>
                </>
              ) : (
                <>
                  <Play className="w-4 h-4" />
                  <span>Run All Benchmarks</span>
                </>
              )}
            </button>

            {results.length > 0 && (
              <button
                onClick={exportResults}
                className="btn-secondary flex items-center space-x-2"
              >
                <Download className="w-4 h-4" />
                <span>Export CSV</span>
              </button>
            )}
          </div>
        </div>

        {running && (
          <div className="mt-4">
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div
                className="bg-primary-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
              Progress: {Math.round(progress)}%
            </p>
          </div>
        )}
      </div>

      {/* Questions List */}
      <div className="card">
        <h3 className="text-lg font-semibold mb-4">Benchmark Questions</h3>
        <div className="space-y-2">
          {questions.map((q, index) => (
            <div
              key={q.id}
              className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
            >
              <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                {q.id}.
              </span>
              <span className="flex-1 text-sm">{q.question}</span>
              {results[index] && (
                <CheckCircle className="w-5 h-5 text-green-600" />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Results Table */}
      {results.length > 0 && (
        <div className="card overflow-x-auto">
          <h3 className="text-lg font-semibold mb-4">Results Summary</h3>
          <table className="w-full text-sm">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-4 py-3 text-left">#</th>
                <th className="px-4 py-3 text-left">Question</th>
                <th className="px-4 py-3 text-center">Mistral</th>
                <th className="px-4 py-3 text-center">LLaMA3</th>
                <th className="px-4 py-3 text-center">Phi-3</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {results.map((result, index) => (
                <tr key={index}>
                  <td className="px-4 py-3">{index + 1}</td>
                  <td className="px-4 py-3 max-w-md truncate">{result.question}</td>
                  <td className="px-4 py-3 text-center">
                    <span className="text-xs">{result.models.mistral?.time || 0}ms</span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className="text-xs">{result.models.llama3?.time || 0}ms</span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className="text-xs">{result.models.phi3?.time || 0}ms</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

export default BenchmarkDashboard