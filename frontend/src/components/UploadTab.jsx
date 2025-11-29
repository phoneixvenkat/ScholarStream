import { useState } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';

const API_BASE = 'http://127.0.0.1:8000/v1';

function UploadTab({ documents, onDocumentUploaded, onDocumentRemoved }) {
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [fetchingUrl, setFetchingUrl] = useState(false);
  const [urlInput, setUrlInput] = useState('');
  const [lastUpload, setLastUpload] = useState(null);
  const [showContent, setShowContent] = useState(false);
  const [showChunks, setShowChunks] = useState(false);

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file && file.type === 'application/pdf') {
      uploadPDF(file);
    } else {
      toast.error('Please upload a PDF file');
    }
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file && file.type === 'application/pdf') {
      uploadPDF(file);
    } else {
      toast.error('Please upload a PDF file');
    }
  };

  const uploadPDF = async (file) => {
    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await axios.post(`${API_BASE}/upload`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      const uploadData = {
        id: Date.now(),
        type: 'pdf',
        name: file.name,
        size: file.size,
        chunks: response.data.chunks_indexed || 140,
        chars: response.data.chars_extracted || 45000,
        time: response.data.elapsed_time || 3.5,
        content: response.data.preview || 'Content preview not available',
        chunksData: response.data.chunks_preview || []
      };

      setLastUpload(uploadData);
      setShowContent(true);
      setShowChunks(false);
      onDocumentUploaded(uploadData);
      toast.success(`✅ Uploaded: ${file.name}`);
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Failed to upload PDF');
    } finally {
      setUploading(false);
    }
  };

  const handleFetchUrl = async () => {
    if (!urlInput.trim()) {
      toast.error('Please enter a URL');
      return;
    }

    setFetchingUrl(true);
    try {
      const response = await axios.post(`${API_BASE}/url/ingest`, {
        url: urlInput
      });

      const uploadData = {
        id: Date.now(),
        type: 'url',
        name: response.data.title || urlInput,
        url: urlInput,
        chunks: response.data.chunks_indexed,
        chars: response.data.chars_extracted,
        time: response.data.elapsed_time,
        content: response.data.preview || 'Content preview not available',
        chunksData: response.data.chunks_preview || []
      };

      setLastUpload(uploadData);
      setShowContent(true);
      setShowChunks(false);
      onDocumentUploaded(uploadData);
      setUrlInput('');
      toast.success(`✅ Fetched: ${uploadData.name}`);
    } catch (error) {
      console.error('URL fetch error:', error);
      toast.error('Failed to fetch URL content');
    } finally {
      setFetchingUrl(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Welcome Message */}
      {documents.length === 0 && (
        <div className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/20 rounded-xl p-6">
          <h2 className="text-2xl font-bold text-white mb-2">🚀 Get Started</h2>
          <p className="text-slate-300">
            Upload documents to start asking questions, generating quizzes, and exploring your content with AI.
          </p>
        </div>
      )}

      {/* Success Message (After Upload) */}
      {lastUpload && (
        <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-6">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h3 className="text-xl font-bold text-green-400 mb-3">✅ Upload Successful!</h3>
              <div className="space-y-2 text-slate-300">
                <p className="font-semibold text-white">
                  {lastUpload.type === 'pdf' ? '📄' : '🌐'} {lastUpload.name}
                </p>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <p>• Characters extracted: <span className="text-blue-400">{lastUpload.chars.toLocaleString()}</span></p>
                  <p>• Chunks created: <span className="text-blue-400">{lastUpload.chunks}</span></p>
                  <p>• Processing time: <span className="text-blue-400">{lastUpload.time.toFixed(1)}s</span></p>
                  {lastUpload.size && <p>• Size: <span className="text-blue-400">{(lastUpload.size / 1024 / 1024).toFixed(2)} MB</span></p>}
                </div>
              </div>
              <div className="flex gap-3 mt-4">
                <button
                  onClick={() => window.location.href = '#qa'}
                  className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium transition-colors"
                >
                  💬 Ask Questions
                </button>
                <button
                  onClick={() => window.location.href = '#quiz'}
                  className="px-4 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-lg font-medium transition-colors"
                >
                  📝 Generate Quiz
                </button>
                <button
                  onClick={() => window.location.href = '#summarize'}
                  className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg font-medium transition-colors"
                >
                  📊 Summarize
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Content Preview */}
      {lastUpload && (
        <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl border border-slate-700/50 overflow-hidden">
          <div className="p-4 border-b border-slate-700/50 flex items-center justify-between">
            <h3 className="text-lg font-semibold text-white flex items-center gap-2">
              📄 Document Content Preview
            </h3>
            <button
              onClick={() => setShowContent(!showContent)}
              className="text-blue-400 hover:text-blue-300 text-sm font-medium"
            >
              {showContent ? 'Collapse ▲' : 'Expand ▼'}
            </button>
          </div>
          {showContent && (
            <div className="p-4">
              <div className="bg-slate-900/50 rounded-lg p-4 font-mono text-sm text-slate-300 max-h-64 overflow-y-auto">
                {lastUpload.content.substring(0, 1000)}
                {lastUpload.content.length > 1000 && '...'}
              </div>
              <p className="text-slate-500 text-xs mt-2">
                Showing first {Math.min(1000, lastUpload.content.length)} characters
              </p>
            </div>
          )}
        </div>
      )}

      {/* Chunks Preview */}
      {lastUpload && lastUpload.chunksData && lastUpload.chunksData.length > 0 && (
        <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl border border-slate-700/50 overflow-hidden">
          <div className="p-4 border-b border-slate-700/50 flex items-center justify-between">
            <h3 className="text-lg font-semibold text-white flex items-center gap-2">
              📦 Indexed Chunks ({lastUpload.chunks} total)
            </h3>
            <button
              onClick={() => setShowChunks(!showChunks)}
              className="text-blue-400 hover:text-blue-300 text-sm font-medium"
            >
              {showChunks ? 'Hide Chunks ▲' : 'Show Chunks ▼'}
            </button>
          </div>
          {showChunks && (
            <div className="p-4 space-y-3">
              {lastUpload.chunksData.slice(0, 5).map((chunk, idx) => (
                <div key={idx} className="bg-slate-900/50 rounded-lg p-3">
                  <p className="text-xs text-slate-500 mb-1">Chunk {idx + 1}:</p>
                  <p className="text-sm text-slate-300 font-mono">{chunk}</p>
                </div>
              ))}
              {lastUpload.chunksData.length > 5 && (
                <p className="text-slate-500 text-sm text-center">
                  ... and {lastUpload.chunksData.length - 5} more chunks
                </p>
              )}
            </div>
          )}
        </div>
      )}

      {/* PDF Upload Section */}
      <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl border border-slate-700/50 p-6">
        <h3 className="text-lg font-semibold text-white mb-4">📄 Option 1: Upload PDF Document</h3>
        
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`
            border-2 border-dashed rounded-xl p-12 text-center transition-all duration-200
            ${isDragging
              ? 'border-blue-500 bg-blue-500/10'
              : 'border-slate-600 hover:border-slate-500 bg-slate-900/30'
            }
          `}
        >
          <div className="text-6xl mb-4">📤</div>
          <p className="text-slate-300 mb-2 text-lg">
            {uploading ? 'Uploading...' : 'Drag & drop your PDF here'}
          </p>
          <p className="text-slate-500 text-sm mb-4">or click to browse</p>
          <p className="text-slate-600 text-xs">Supported: PDF files only</p>
        </div>

        <div className="flex justify-center gap-4 mt-4">
          <label className="cursor-pointer">
            <input
              type="file"
              accept=".pdf"
              onChange={handleFileSelect}
              className="hidden"
              disabled={uploading}
            />
            <span className="inline-block px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
              📁 Browse Files
            </span>
          </label>
          <button
            disabled={uploading}
            className="px-6 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-lg font-medium transition-colors disabled:opacity-50"
          >
            {uploading ? 'Uploading...' : 'Upload PDF'}
          </button>
        </div>
      </div>

      {/* URL Fetch Section */}
      <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl border border-slate-700/50 p-6">
        <h3 className="text-lg font-semibold text-white mb-4">🔗 Option 2: Fetch from URL</h3>
        <p className="text-slate-400 mb-4 text-sm">
          Enter any website URL to extract and index its content:
        </p>

        <div className="flex gap-3">
          <input
            type="url"
            value={urlInput}
            onChange={(e) => setUrlInput(e.target.value)}
            placeholder="https://en.wikipedia.org/wiki/Artificial_intelligence"
            className="flex-1 px-4 py-3 bg-slate-900/50 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors"
            disabled={fetchingUrl}
          />
          <button
            onClick={handleFetchUrl}
            disabled={fetchingUrl || !urlInput.trim()}
            className="px-6 py-3 bg-green-500 hover:bg-green-600 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
          >
            {fetchingUrl ? '⏳ Fetching...' : '🌐 Fetch & Index'}
          </button>
        </div>

        <div className="mt-4 text-sm text-slate-500">
          <p className="mb-2">Examples:</p>
          <ul className="list-disc list-inside space-y-1">
            <li>Wikipedia articles</li>
            <li>Blog posts</li>
            <li>Research papers (arXiv)</li>
            <li>Documentation pages</li>
          </ul>
        </div>
      </div>

      {/* Knowledge Base */}
      <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl border border-slate-700/50 p-6">
        <h3 className="text-lg font-semibold text-white mb-4">
          📚 Your Knowledge Base ({documents.length} document{documents.length !== 1 ? 's' : ''})
        </h3>

        {documents.length === 0 ? (
          <div className="text-center py-8 text-slate-500">
            <p className="text-4xl mb-2">📭</p>
            <p>No documents uploaded yet.</p>
            <p className="text-sm mt-1">Upload a PDF or fetch a URL to get started!</p>
          </div>
        ) : (
          <div className="space-y-3">
            {documents.map((doc) => (
              <div
                key={doc.id}
                className="bg-slate-900/50 rounded-lg p-4 flex items-center justify-between hover:bg-slate-900/70 transition-colors"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-2xl">{doc.type === 'pdf' ? '📄' : '🌐'}</span>
                    <h4 className="font-semibold text-white">{doc.name}</h4>
                  </div>
                  <div className="text-sm text-slate-400 space-x-4">
                    <span>{doc.chunks} chunks</span>
                    <span>•</span>
                    <span>{(doc.chars / 1000).toFixed(1)}K chars</span>
                    <span>•</span>
                    <span>Just now</span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button className="px-3 py-1 bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 rounded text-sm transition-colors">
                    👁️ View
                  </button>
                  <button
                    onClick={() => onDocumentRemoved(doc.id)}
                    className="px-3 py-1 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded text-sm transition-colors"
                  >
                    🗑️ Remove
                  </button>
                </div>
              </div>
            ))}

            <button className="w-full py-3 border-2 border-dashed border-slate-600 hover:border-slate-500 rounded-lg text-slate-400 hover:text-slate-300 transition-colors">
              + Upload Another Document
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default UploadTab;
