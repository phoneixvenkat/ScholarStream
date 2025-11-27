// src/components/UploadManager.jsx

import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { UploadCloud, FileText, AlertCircle, CheckCircle2, Loader2 } from "lucide-react";

const API_PREFIX = "http://localhost:8000/v1";

const UploadManager = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [uploadSuccess, setUploadSuccess] = useState("");
  const [knowledgeDocs, setKnowledgeDocs] = useState([]);
  const [loadingKnowledge, setLoadingKnowledge] = useState(false);

  const handleFileChange = (e) => {
    setSelectedFile(e.target.files[0] ?? null);
    setUploadError("");
    setUploadSuccess("");
  };

  const handleDrop = (e) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setSelectedFile(e.dataTransfer.files[0]);
      setUploadError("");
      setUploadSuccess("");
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const fetchKnowledgeBase = useCallback(async () => {
    try {
      setLoadingKnowledge(true);
      setUploadError("");
      const res = await axios.get(`${API_PREFIX}/knowledge`);
      const data = res.data || {};
      const docs =
        data.documents ||
        data.items ||
        data.knowledge ||
        data.docs ||
        [];
      setKnowledgeDocs(Array.isArray(docs) ? docs : []);
    } catch (err) {
      console.error("Failed to fetch knowledge base", err);
      setKnowledgeDocs([]);
    } finally {
      setLoadingKnowledge(false);
    }
  }, []);

  useEffect(() => {
    fetchKnowledgeBase();
  }, [fetchKnowledgeBase]);

  const handleUpload = async () => {
    if (!selectedFile) {
      setUploadError("Please select a PDF file to upload.");
      setUploadSuccess("");
      return;
    }

    if (selectedFile.type !== "application/pdf") {
      setUploadError("Only PDF files are supported.");
      setUploadSuccess("");
      return;
    }

    const formData = new FormData();
    formData.append("file", selectedFile);

    try {
      setUploading(true);
      setUploadError("");
      setUploadSuccess("");

      await axios.post(`${API_PREFIX}/upload`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      setUploadSuccess("Document uploaded and indexed successfully.");
      setSelectedFile(null);
      await fetchKnowledgeBase();
    } catch (err) {
      console.error("Upload failed", err);
      const msg =
        err?.response?.data?.detail ||
        err?.message ||
        "Upload failed. Please check the backend and try again.";
      setUploadError(msg);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-8">
      <section className="bg-slate-900/60 border border-slate-700/70 rounded-2xl p-8 shadow-lg shadow-black/30">
        <h2 className="text-xl font-semibold text-slate-50 mb-2">
          Upload PDF Documents
        </h2>
        <p className="text-sm text-slate-400 mb-6">
          Upload PDF documents to add them to the RAG knowledge base.
        </p>

        <div
          className="border-2 border-dashed border-slate-600/70 rounded-xl px-6 py-10 flex flex-col items-center justify-center gap-4 bg-slate-900/40 hover:border-sky-500/80 transition-colors cursor-pointer"
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onClick={() => document.getElementById("pdf-input")?.click()}
        >
          <UploadCloud className="w-10 h-10 text-sky-400 mb-1" />
          <p className="text-slate-200 font-medium">
            Drag & drop a PDF here, or click to browse
          </p>
          <p className="text-xs text-slate-500">
            Only PDF files are supported for ingestion
          </p>

          <input
            id="pdf-input"
            type="file"
            accept="application/pdf"
            className="hidden"
            onChange={handleFileChange}
          />

          {selectedFile && (
            <div className="mt-4 inline-flex items-center gap-2 rounded-full bg-slate-800/80 px-4 py-2 text-sm text-slate-100">
              <FileText className="w-4 h-4 text-sky-400" />
              <span className="truncate max-w-xs">{selectedFile.name}</span>
            </div>
          )}

          <button
            type="button"
            onClick={handleUpload}
            disabled={uploading}
            className="mt-6 inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-sky-500 hover:bg-sky-400 text-sm font-medium text-white disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
          >
            {uploading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Uploading...
              </>
            ) : (
              <>
                <UploadCloud className="w-4 h-4" />
                Upload PDF
              </>
            )}
          </button>
        </div>

        {uploadError && (
          <div className="mt-5 flex items-center gap-2 rounded-lg bg-red-900/30 border border-red-700/60 px-4 py-3 text-sm text-red-200">
            <AlertCircle className="w-4 h-4" />
            <span>{uploadError}</span>
          </div>
        )}

        {uploadSuccess && (
          <div className="mt-5 flex items-center gap-2 rounded-lg bg-emerald-900/30 border border-emerald-700/60 px-4 py-3 text-sm text-emerald-200">
            <CheckCircle2 className="w-4 h-4" />
            <span>{uploadSuccess}</span>
          </div>
        )}
      </section>

      <section className="bg-slate-900/60 border border-slate-700/70 rounded-2xl p-8 shadow-lg shadow-black/30">
        <h2 className="text-xl font-semibold text-slate-50 mb-2">
          Knowledge Base
        </h2>
        <p className="text-sm text-slate-400 mb-4">
          Documents currently indexed and available for retrieval.
        </p>

        {loadingKnowledge ? (
          <div className="flex items-center gap-2 text-sm text-slate-400">
            <Loader2 className="w-4 h-4 animate-spin" />
            Loading knowledge base...
          </div>
        ) : knowledgeDocs.length === 0 ? (
          <p className="text-sm text-slate-500">
            No documents uploaded yet. Upload a PDF to populate the knowledge
            base.
          </p>
        ) : (
          <ul className="divide-y divide-slate-800/80">
            {knowledgeDocs.map((doc, idx) => (
              <li
                key={doc.id ?? idx}
                className="py-3 flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <FileText className="w-4 h-4 text-sky-400" />
                  <div>
                    <p className="text-sm font-medium text-slate-100">
                      {doc.title || doc.name || doc.filename || `Document ${idx + 1}`}
                    </p>
                    {doc.source && (
                      <p className="text-xs text-slate-500">
                        Source: {doc.source}
                      </p>
                    )}
                  </div>
                </div>
                {doc.page_count && (
                  <span className="text-xs text-slate-500">
                    {doc.page_count} pages
                  </span>
                )}
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
};

export default UploadManager;
