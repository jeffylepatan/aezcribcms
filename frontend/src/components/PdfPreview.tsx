'use client';

import React, { useState } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';

// Use CDN worker for pdf.js; this avoids bundling the worker.
// Use an explicit HTTPS CDN URL for the pdf.worker to avoid mixed-scheme fetch failures.
// If your environment blocks CDN worker loading, copy `pdf.worker.min.js` into `/public` and
// set the workerSrc to `/pdf.worker.min.js` instead.
pdfjs.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

export default function PdfPreview({ url, onClose }: { url: string; onClose: () => void }) {
  const [numPages, setNumPages] = useState<number | null>(null);
  const [page, setPage] = useState(1);
  const [scale, setScale] = useState(1.0);
  const [loadError, setLoadError] = useState<string | null>(null);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-5xl w-full max-h-[90vh] overflow-auto">
        <div className="flex items-center justify-between p-3 border-b">
          <div className="flex items-center gap-3">
            <button onClick={() => setPage((p) => Math.max(1, p - 1))} className="px-3 py-1 rounded bg-gray-100">Prev</button>
            <span className="text-sm">{page}{numPages ? ` / ${numPages}` : ''}</span>
            <button onClick={() => setPage((p) => (numPages ? Math.min(numPages, p + 1) : p + 1))} className="px-3 py-1 rounded bg-gray-100">Next</button>
            <div className="ml-3 flex items-center gap-2">
              <button onClick={() => setScale((s) => Math.max(0.5, s - 0.25))} className="px-2 py-1 rounded bg-gray-100">-</button>
              <span className="text-sm">{Math.round(scale * 100)}%</span>
              <button onClick={() => setScale((s) => Math.min(3, s + 0.25))} className="px-2 py-1 rounded bg-gray-100">+</button>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <a href={url} target="_blank" rel="noopener noreferrer" className="text-sm px-3 py-1 rounded bg-green-100">Open in new tab</a>
            <button onClick={onClose} className="text-sm px-3 py-1 rounded bg-red-100">Close</button>
          </div>
        </div>

        <div className="p-4 flex justify-center">
          {!loadError ? (
            <Document
              file={url}
              onLoadSuccess={(doc: any) => { setNumPages(doc.numPages); if (page > doc.numPages) setPage(1); }}
              onLoadError={(err: any) => {
                console.error('PDF load error:', err);
                setLoadError(err?.message || String(err));
              }}
              loading={<div className="text-center p-8">Loading preview…</div>}
              error={null}
            >
              <Page pageNumber={page} scale={scale} loading={<div className="text-center p-8">Rendering page…</div>} />
            </Document>
          ) : (
            <div className="w-full">
              <div className="mb-3 text-sm text-red-700">
                Failed to load PDF preview: {loadError}. Showing fallback preview below. This can happen due to CORS or PDF worker issues.
              </div>
              <div className="w-full h-[70vh]">
                <iframe src={url} className="w-full h-full" title="PDF fallback preview" />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
