// @ts-nocheck
import React, { useEffect } from 'react';
import { X } from 'lucide-react';
import { MODES } from '../constants/modes';
import { PERSONAS } from '../constants/personas';
import { Browser } from '../lib/capacitorMocks';

export function HelpModal({ onClose }) {
  useEffect(() => {
    const handleEsc = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handleEsc);
    return () => document.removeEventListener('keydown', handleEsc);
  }, [onClose]);

  const openLink = (url) => {
    Browser.open({ url }).catch(() => window.open(url, '_blank', 'noopener,noreferrer'));
  };

  return (
    <div role="dialog" aria-modal="true" aria-labelledby="helpTitle" style={{
      position: 'fixed', inset: 0, zIndex: 400,
      background: 'rgba(255,255,255,0.75)', backdropFilter: 'blur(8px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '16px', paddingTop: 'calc(16px + var(--sat))', paddingBottom: 'calc(16px + var(--sab))',
      animation: 'fadeIn 0.2s ease'
    }} onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={{
        background: '#fff', maxWidth: 420, width: '100%', maxHeight: '100%',
        borderRadius: 28, boxShadow: '0 32px 80px rgba(0,0,0,0.12)',
        border: '1px solid #f1f5f9', overflowY: 'auto', padding: 28
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, paddingBottom: 14, borderBottom: '1px solid #f8fafc' }}>
          <h2 id="helpTitle" style={{ fontSize: 11, letterSpacing: '0.4em', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', margin: 0 }}>Mirror Guide</h2>
          <button aria-label="閉じる" onClick={onClose} style={{ minWidth: 44, minHeight: 44, background: 'none', border: 'none', cursor: 'pointer', color: '#cbd5e1', display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}><X size={18}/></button>
        </div>
        <section style={{ marginBottom: 24 }}>
          <div style={{ fontSize: 10, letterSpacing: '0.35em', fontWeight: 800, color: '#cbd5e1', textTransform: 'uppercase', marginBottom: 14 }}>Channels — 対話の目的</div>
          {Object.values(MODES).map(m => (
            <div key={m.id} style={{ marginBottom: 12, paddingLeft: 12, borderLeft: '2px solid #f1f5f9' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, fontWeight: 700, color: '#334155', marginBottom: 3 }}>{m.icon} {m.name}</div>
              <p style={{ fontSize: 12, color: '#64748b', lineHeight: 1.7 }}>{m.guidance}</p>
            </div>
          ))}
        </section>
        <section style={{ marginBottom: 24 }}>
          <div style={{ fontSize: 10, letterSpacing: '0.35em', fontWeight: 800, color: '#cbd5e1', textTransform: 'uppercase', marginBottom: 14 }}>Oracles — 話し手の個性</div>
          {Object.values(PERSONAS).map(px => (
            <div key={px.id} style={{ marginBottom: 12, paddingLeft: 12, borderLeft: `2px solid ${px.accent}40` }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, fontWeight: 700, color: px.accent, marginBottom: 3 }}>{px.icon} {px.name} <span style={{ color: '#94a3b8', fontWeight: 400 }}>— {px.title}</span></div>
              <p style={{ fontSize: 12, color: '#64748b', lineHeight: 1.7 }}>{px.guidance}</p>
            </div>
          ))}
        </section>
        <div style={{ marginTop: 24, padding: 16, background: '#f8fafc', borderRadius: 12, fontSize: 11, color: '#64748b', lineHeight: 1.6 }}>
          <strong>【免責・制限事項】</strong><br/>
          本アプリの神託やカードリーディングは娯楽および自己内省を目的としており、専門的な医療・法律・財務アドバイスの代替となるものではありません。<br/><br/>
          ※ ペルソナの変更（別の視点での再生成）も、1回としてカウントされます。
        </div>
        
        {/* App Store審査必須要件：プライバシーポリシーと利用規約への安全なリンク */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: 20, marginTop: 24 }}>
          {/* 【本番環境】実際のURLに差し替えてください */}
          <button onClick={() => openLink('https://your-website.com/terms')} style={{ background: 'none', border: 'none', padding: 0, fontSize: 11, color: '#94a3b8', textDecoration: 'underline', cursor: 'pointer' }}>利用規約</button>
          <button onClick={() => openLink('https://your-website.com/privacy')} style={{ background: 'none', border: 'none', padding: 0, fontSize: 11, color: '#94a3b8', textDecoration: 'underline', cursor: 'pointer' }}>プライバシーポリシー</button>
        </div>

        <button onClick={onClose} style={{
          width: '100%', padding: '14px 0', background: '#0f172a', color: '#fff', minHeight: 48,
          borderRadius: 999, fontSize: 11, letterSpacing: '0.25em', textTransform: 'uppercase',
          fontWeight: 700, cursor: 'pointer', border: 'none', marginTop: 24
        }}>鏡へ戻る</button>
      </div>
    </div>
  );
}
