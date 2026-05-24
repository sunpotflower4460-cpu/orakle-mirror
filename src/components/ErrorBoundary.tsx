// @ts-nocheck
import React from 'react';
import { AlertCircle } from 'lucide-react';

// ─── Error Boundary ───────────────────────────────────────────────────────────
export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true };
  }
  componentDidCatch(error, errorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#0f172a', color: '#f1f5f9', fontFamily: 'sans-serif', padding: 20, paddingTop: 'env(safe-area-inset-top, 20px)', textAlign: 'center' }}>
          <AlertCircle size={48} color="#f43f5e" style={{ marginBottom: 20 }} />
          <h2 style={{ fontSize: 18, marginBottom: 10, letterSpacing: '0.1em' }}>予期せぬエラーが発生しました</h2>
          <p style={{ fontSize: 14, color: '#94a3b8', marginBottom: 30 }}>お手数ですが、アプリを再読み込みしてください。</p>
          <button onClick={() => window.location.reload()} style={{ padding: '12px 24px', background: '#334155', color: '#fff', border: 'none', borderRadius: 999, fontSize: 14, fontWeight: 'bold', cursor: 'pointer' }}>
            再読み込み
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
