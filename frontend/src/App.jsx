import { useState } from 'react';
import toast, { Toaster } from 'react-hot-toast';
import UploadTab from './components/UploadTab';
import QATab from './components/QATab';
import QuizTab from './components/QuizTab';
import SummarizeTab from './components/SummarizeTab';
import CompareTab from './components/CompareTab';

function App() {
  const [activeTab, setActiveTab] = useState('upload');
  const [hasDocuments, setHasDocuments] = useState(false);
  const [documents, setDocuments] = useState([]);
  const [showMoreMenu, setShowMoreMenu] = useState(false);

  const tabs = [
    { id: 'upload', label: '📤 Upload', icon: '📤', locked: false },
    { id: 'qa', label: '💬 Q&A', icon: '💬', locked: !hasDocuments },
    { id: 'quiz', label: '📝 Quiz', icon: '📝', locked: !hasDocuments },
    { id: 'more', label: '📊 More', icon: '📊', locked: !hasDocuments, isDropdown: true }
  ];

  const moreMenuItems = [
    { id: 'summarize', label: '📊 Summarize', icon: '📊' },
    { id: 'compare', label: '⚖️ Compare Models', icon: '⚖️' }
  ];

  const handleTabClick = (tabId) => {
    if (tabId === 'more') {
      setShowMoreMenu(!showMoreMenu);
    } else {
      setActiveTab(tabId);
      setShowMoreMenu(false);
    }
  };

  const handleDocumentUploaded = (newDoc) => {
    setDocuments([...documents, newDoc]);
    setHasDocuments(true);
    toast.success('✅ Document uploaded successfully!');
  };

  const handleDocumentRemoved = (docId) => {
    const updatedDocs = documents.filter(doc => doc.id !== docId);
    setDocuments(updatedDocs);
    if (updatedDocs.length === 0) {
      setHasDocuments(false);
      setActiveTab('upload');
    }
    toast.success('Document removed');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <Toaster position="top-right" />
      
      {/* Header */}
      <header className="bg-slate-800/50 backdrop-blur-sm border-b border-slate-700/50 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center text-white font-bold text-xl">
                RAG
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">EDUrag</h1>
                <p className="text-sm text-slate-400">Smart Document Q&A System</p>
              </div>
            </div>
            <button className="p-2 rounded-lg bg-slate-700/50 hover:bg-slate-700 transition-colors">
              <span className="text-2xl">🌙</span>
            </button>
          </div>
        </div>
      </header>

      {/* Tab Navigation */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
        <div className="relative">
          <div className="flex space-x-2 bg-slate-800/30 p-1 rounded-lg backdrop-blur-sm">
            {tabs.map((tab) => (
              <div key={tab.id} className="relative flex-1">
                <button
                  onClick={() => handleTabClick(tab.id)}
                  disabled={tab.locked}
                  className={`
                    w-full px-4 py-3 rounded-lg font-medium transition-all duration-200
                    ${activeTab === tab.id
                      ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/50'
                      : tab.locked
                      ? 'bg-slate-700/30 text-slate-500 cursor-not-allowed'
                      : 'bg-slate-700/50 text-slate-300 hover:bg-slate-700'
                    }
                  `}
                >
                  <div className="flex items-center justify-center space-x-2">
                    <span>{tab.icon}</span>
                    <span className="hidden sm:inline">{tab.label.replace(/^.+?\s/, '')}</span>
                    {tab.locked && <span className="text-xs">🔒</span>}
                    {tab.isDropdown && <span className="text-xs">▼</span>}
                  </div>
                </button>

                {/* More Menu Dropdown */}
                {tab.id === 'more' && showMoreMenu && !tab.locked && (
                  <div className="absolute top-full mt-2 right-0 w-64 bg-slate-800 rounded-lg shadow-xl border border-slate-700 overflow-hidden z-50">
                    {moreMenuItems.map((item) => (
                      <button
                        key={item.id}
                        onClick={() => {
                          setActiveTab(item.id);
                          setShowMoreMenu(false);
                        }}
                        className="w-full px-4 py-3 text-left text-slate-300 hover:bg-slate-700 transition-colors flex items-center space-x-3"
                      >
                        <span>{item.icon}</span>
                        <span>{item.label}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Status Indicator */}
          {!hasDocuments && (
            <div className="mt-4 p-3 bg-amber-500/10 border border-amber-500/20 rounded-lg">
              <p className="text-amber-200 text-sm text-center">
                ⚠️ Upload a document to unlock all features
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'upload' && (
          <UploadTab
            documents={documents}
            onDocumentUploaded={handleDocumentUploaded}
            onDocumentRemoved={handleDocumentRemoved}
          />
        )}
        {activeTab === 'qa' && hasDocuments && (
          <QATab documents={documents} />
        )}
        {activeTab === 'quiz' && hasDocuments && (
          <QuizTab documents={documents} />
        )}
        {activeTab === 'summarize' && hasDocuments && (
          <SummarizeTab documents={documents} />
        )}
        {activeTab === 'compare' && hasDocuments && (
          <CompareTab documents={documents} />
        )}
      </main>

      {/* Footer */}
      <footer className="mt-12 py-6 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-center text-slate-500 text-sm">
            EDUrag - Multi-Model RAG System | DSCI 6004 NLP Project
          </p>
        </div>
      </footer>
    </div>
  );
}

export default App;
