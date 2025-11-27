// src/components/Layout.jsx

import React from "react";
import { Sun, Moon } from "lucide-react";

function Layout({ darkMode, toggleDarkMode, children }) {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-50 flex flex-col">
      {/* Top bar */}
      <header className="w-full border-b border-slate-800/80 bg-slate-950/90 backdrop-blur flex items-center justify-between px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-xl bg-sky-500 flex items-center justify-center text-xs font-bold shadow-lg shadow-sky-500/40">
            RAG
          </div>
          <div>
            <h1 className="text-lg font-semibold tracking-tight">
              RAG System
            </h1>
            <p className="text-xs text-slate-400">
              Multi-LLM Retrieval & Evaluation Dashboard
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={toggleDarkMode}
          className="inline-flex items-center gap-2 rounded-full border border-slate-700/80 bg-slate-900/80 px-3 py-2 text-xs font-medium text-slate-100 hover:border-sky-500/80 hover:text-sky-100 transition-colors"
        >
          {darkMode ? (
            <>
              <Moon className="w-4 h-4" />
              <span>Dark</span>
            </>
          ) : (
            <>
              <Sun className="w-4 h-4" />
              <span>Light</span>
            </>
          )}
        </button>
      </header>

      {/* Main content */}
      <main className="flex-1 w-full max-w-6xl mx-auto px-6 py-6">
        {children}
      </main>
    </div>
  );
}

export default Layout;
