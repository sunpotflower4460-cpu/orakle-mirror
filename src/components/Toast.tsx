import React, { useEffect } from 'react';

// ─── UI Components ────────────────────────────────────────────────────────────

interface ToastProps {
  message: string;
  onDone: () => void;
}

export function Toast({ message, onDone }: ToastProps) {
  useEffect(() => { const t = setTimeout(onDone, 2000); return () => clearTimeout(t); }, [onDone]);
  return (
    <div role="status" aria-live="polite" style={{
      position: 'fixed', top: 'calc(72px + var(--sat))', left: '50%', transform: 'translateX(-50%)',
      background: 'var(--om-cta-bg)', color: '#fff', padding: '10px 24px', borderRadius: 999,
      fontSize: 11, letterSpacing: '0.2em', textTransform: 'uppercase',
      zIndex: 1200, whiteSpace: 'normal', textAlign: 'center',
      maxWidth: 'min(92vw, 420px)', boxShadow: 'var(--om-cta-shadow)',
      animation: 'fadeUp 0.3s ease'
    }}>{message}</div>
  );
}
