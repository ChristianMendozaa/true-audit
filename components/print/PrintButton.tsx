'use client';

export default function PrintButton() {
  return (
    <button
      onClick={() => window.print()}
      className="no-print inline-flex items-center gap-2 px-5 py-2.5 bg-ink text-paper text-sm hover:bg-ink-soft transition-colors"
    >
      <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
        <rect x="2" y="1" width="10" height="8" rx="1" stroke="currentColor" strokeWidth="1.2"/>
        <path d="M4 9v4h6V9" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round"/>
        <line x1="2" y1="5" x2="12" y2="5" stroke="currentColor" strokeWidth="1" strokeLinecap="round"/>
      </svg>
      Imprimir / PDF
    </button>
  );
}
