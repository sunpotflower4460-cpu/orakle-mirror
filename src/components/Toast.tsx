// @ts-nocheck
import React, { useEffect } from 'react';

// ─── UI Components ────────────────────────────────────────────────────────────

export function Toast({ message, onDone }) {
  useEffect(() => { const t = setTimeout(onDone, 2000); return () => clearTimeout(t); }, [onDone]);
  return (
    <div role="status" aria-live="polite" style={{
      position: 'fixed', top: 'calc(72px + var(--sat))', left: '50%', transform: 'translateX(-50%)',
      background: '#0f172a', color: '#fff', padding: '10px 24px', borderRadius: 999,
      fontSize: 11, letterSpacing: '0.2em', textTransform: 'uppercase',
      zIndex: 500, whiteSpace: 'nowrap', boxShadow: '0 8px 32px rgba(0,0,0,0.25)',
      animation: 'fadeUp 0.3s ease'
    }}>{message}</div>
  );
}
