import React, { useEffect, useState } from 'react';

// ─── UI Components ────────────────────────────────────────────────────────────

interface ToastProps {
  message: string;
  onDone: () => void;
}

export function Toast({ message, onDone }: ToastProps) {
  const [leaving, setLeaving] = useState(false);

  useEffect(() => {
    // 少し見せてから、退場アニメーションを挟んで消える。
    const leaveTimer = setTimeout(() => setLeaving(true), 1900);
    const doneTimer = setTimeout(onDone, 2200);
    return () => { clearTimeout(leaveTimer); clearTimeout(doneTimer); };
  }, [onDone]);

  return (
    <div role="status" aria-live="polite" style={{
      position: 'fixed', top: 'calc(72px + var(--sat))', left: '50%', transform: 'translateX(-50%)',
      background: '#0f172a', color: '#fff', padding: '10px 24px', borderRadius: 999,
      fontSize: 11, letterSpacing: '0.2em', textTransform: 'uppercase',
      zIndex: 1200, whiteSpace: 'nowrap', boxShadow: '0 8px 32px rgba(0,0,0,0.25)',
      animation: leaving ? 'fadeDownOut 0.3s ease forwards' : 'fadeUp 0.3s ease'
    }}>{message}</div>
  );
}
