"use client";
import React, { createContext, useContext, useState, ReactNode, useCallback } from 'react';

type GlobalLoadingContextType = {
  loading: boolean;
  start: () => void;
  stop: () => void;
  runWithLoading: <T>(fn: () => Promise<T>) => Promise<T>;
};

const GlobalLoadingContext = createContext<GlobalLoadingContextType | null>(null);

export const useGlobalLoading = () => {
  const ctx = useContext(GlobalLoadingContext);
  if (!ctx) throw new Error('useGlobalLoading must be used within GlobalLoadingProvider');
  return ctx;
};

export function GlobalLoadingProvider({ children }: { children: ReactNode }) {
  const [loading, setLoading] = useState(false);

  const start = useCallback(() => setLoading(true), []);
  const stop = useCallback(() => setLoading(false), []);

  const runWithLoading = useCallback(async <T,>(fn: () => Promise<T>) => {
    start();
    try {
      const res = await fn();
      return res;
    } finally {
      stop();
    }
  }, [start, stop]);

  return (
    <GlobalLoadingContext.Provider value={{ loading, start, stop, runWithLoading }}>
      {children}
      {loading && (
        <div aria-hidden className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white/90 rounded-lg p-4 flex items-center gap-3 shadow-lg">
            <svg className="animate-spin h-6 w-6 text-gray-700" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
            </svg>
            <div className="text-sm text-gray-800">Working…</div>
          </div>
        </div>
      )}
    </GlobalLoadingContext.Provider>
  );
}

// Convenience hook: wraps an async handler so callers don't repeat start/stop logic
export function useRunWithLoading() {
  const { runWithLoading } = useGlobalLoading();
  return runWithLoading;
}

export default GlobalLoadingProvider;
