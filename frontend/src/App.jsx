import { useState } from 'react'
import Layout from './components/Layout'
import UploadManager from './components/UploadManager'
import ModelComparison from './components/ModelComparison'
import BenchmarkDashboard from './components/BenchmarkDashboard'
import EvaluationPanel from './components/EvaluationPanel'
import PerformancePanel from './components/PerformancePanel'

function App() {
  const [darkMode, setDarkMode] = useState(false)
  const [activeTab, setActiveTab] = useState('query')
  const [uploadedFiles, setUploadedFiles] = useState([])

  const toggleDarkMode = () => {
    setDarkMode(!darkMode)
    if (!darkMode) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }

  return (
    <Layout darkMode={darkMode} toggleDarkMode={toggleDarkMode}>
      {/* Tab Navigation */}
      <div className="mb-6 border-b border-gray-200 dark:border-gray-700">
        <nav className="flex space-x-8">
          {[
            { id: 'query', label: 'Query & Compare' },
            { id: 'benchmark', label: 'Benchmarks' },
            { id: 'evaluation', label: 'Evaluation' },
            { id: 'performance', label: 'Performance' },
            { id: 'upload', label: 'Upload Documents' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === tab.id
                  ? 'border-primary-600 text-primary-600 dark:text-primary-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="mt-6">
        {activeTab === 'query' && <ModelComparison />}
        {activeTab === 'benchmark' && <BenchmarkDashboard />}
        {activeTab === 'evaluation' && <EvaluationPanel />}
        {activeTab === 'performance' && <PerformancePanel />}
        {activeTab === 'upload' && (
          <UploadManager 
            uploadedFiles={uploadedFiles}
            setUploadedFiles={setUploadedFiles}
          />
        )}
      </div>
    </Layout>
  )
}

export default App