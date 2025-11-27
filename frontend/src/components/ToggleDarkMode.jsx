// src/components/ToggleDarkMode.jsx

import React, { useEffect, useState } from "react";
import { Sun, Moon } from "lucide-react";

const STORAGE_KEY = "rag-dashboard-theme";

const ToggleDarkMode = () => {
  const [dark, setDark] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === "light") {
      setDark(false);
      document.documentElement.classList.remove("dark");
    } else {
      setDark(true);
      document.documentElement.classList.add("dark");
    }
  }, []);

  useEffect(() => {
    if (dark) {
      document.documentElement.classList.add("dark");
      localStorage.setItem(STORAGE_KEY, "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem(STORAGE_KEY, "light");
    }
  }, [dark]);

  const toggle = () => setDark((prev) => !prev);

  return (
    <button
      type="button"
      onClick={toggle}
      className="inline-flex items-center justify-center rounded-full border border-slate-600/70 bg-slate-900/70 px-3 py-2 text-xs font-medium text-slate-100 hover:border-sky-500/80 hover:text-sky-100 transition-colors"
      aria-label="Toggle dark mode"
    >
      {dark ? (
        <div className="flex items-center gap-1">
          <Moon className="w-4 h-4" />
          <span>Dark</span>
        </div>
      ) : (
        <div className="flex items-center gap-1">
          <Sun className="w-4 h-4" />
          <span>Light</span>
        </div>
      )}
    </button>
  );
};

export default ToggleDarkMode;
