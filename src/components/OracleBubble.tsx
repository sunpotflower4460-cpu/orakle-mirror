// @ts-nocheck
import React from 'react';
import { Loader2, Sparkles, Copy, Check } from 'lucide-react';
import { PERSONAS } from '../constants/personas';
import { MODES } from '../constants/modes';

export const OracleBubble = React.memo(function OracleBubble({ msg, idx, copiedId, regeneratingId, onCopy, onSwitch }) {
  const msgPersona = PERSONAS[msg.personaId] || PERSONAS.lumina;
  const msgMode    = MODES[msg.modeId ? msg.modeId.toUpperCase() : ''] || MODES.PURE;
  const isRegen    = regeneratingId === (msg.id || idx);

  return (
    <div style={{ width: '100%', animation: 'oracleReveal 1.2s cubic-bezier(0.16,1,0.3,1) forwards' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginLeft: 14, marginBottom: 8 }}>
        <span style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 10, letterSpacing: '0.35em', fontWeight: 800, textTransform: 'uppercase', color: msgPersona.accent }}>
          {msgPersona.icon} {msgPersona.name}
        </span>
        {msgMode && <span style={{ fontSize: 10, color: '#cbd5e1', letterSpacing: '0.2em', textTransform: 'uppercase' }}>· {msgMode.name}</span>}
      </div>
      <div className="oracle-bubble" style={{
        position: 'relative', padding: '24px 28px', background: 'rgba(255,255,255,0.95)', backdropFilter: 'blur(8px)',
        borderRadius: 24, border: `1px solid ${msgPersona.border}`, boxShadow: '0 8px 32px rgba(0,0,0,0.03)',
        opacity: isRegen ? 0.4 : 1, transition: 'opacity 0.4s'
      }}>
        {isRegen && (
          <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10 }}>
            <Loader2 size={24} style={{ color: '#cbd5e1', animation: 'spin 1s linear infinite' }}/>
          </div>
        )}
        {msg.drawnCards && msg.drawnCards.length > 0 && (
          <div style={{ marginBottom: 20, padding: '14px 16px', background: `linear-gradient(to bottom right, #ffffff, ${msgPersona.soft})`, borderRadius: 16, border: `1px solid ${msgPersona.border}` }}>
            <div style={{ display:'flex', alignItems:'center', gap:6, fontSize: 10, letterSpacing: '0.2em', color: '#94a3b8', textTransform: 'uppercase', marginBottom: 10 }}>
              <Sparkles size={12} /> Drawn Symbols
            </div>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              {msg.drawnCards.map((c) => (
                <span key={c.name} style={{ fontSize: 12, fontWeight: 700, color: msgPersona.accent, background: '#fff', border: `1px solid ${msgPersona.border}`, padding: '6px 12px', borderRadius: 999, boxShadow: '0 2px 8px rgba(0,0,0,0.02)' }}>{c.name}</span>
              ))}
            </div>
          </div>
        )}
        <div style={{ fontSize: 15, lineHeight: 2.1, letterSpacing: '0.04em', color: '#374151', fontWeight: 300 }}>
          {msg.text.split('\n').map((line, i) => {
            const isHeader = /^[①②③【]/.test(line);
            return <p key={i} style={{
              marginBottom: line === '' ? 4 : 14, fontWeight: isHeader ? 700 : 300, fontSize: isHeader ? 12 : 15,
              color: isHeader ? '#94a3b8' : '#374151', borderBottom: isHeader ? '1px solid #f1f5f9' : 'none',
              paddingBottom: isHeader ? 6 : 0, marginTop: isHeader ? 16 : 0, letterSpacing: isHeader ? '0.15em' : '0.04em',
            }}>{line || '\u00A0'}</p>;
          })}
        </div>
        <div className="bubble-actions" style={{ marginTop: 24, paddingTop: 10, borderTop: '1px solid #f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', gap: 2 }}>
            {Object.values(PERSONAS).map(px => (
              <button key={px.id} title={`${px.name}の視点で再生成 (1回消費)`} onClick={() => onSwitch(idx, px.id)} disabled={!!regeneratingId} aria-label={`${px.name}で再生成`}
                style={{
                  minWidth: 44, minHeight: 44, borderRadius: 999, border: 'none', 
                  cursor: !!regeneratingId ? 'not-allowed' : 'pointer',
                  background: msg.personaId === px.id ? `${px.accent}18` : 'transparent',
                  color: msg.personaId === px.id ? px.accent : '#cbd5e1', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s'
                }}>{px.icon}</button>
            ))}
          </div>
          <button onClick={() => onCopy(msg.text, msg.id || idx)} aria-label="テキストをコピー" style={{
            minWidth: 44, minHeight: 44, borderRadius: 999, cursor: 'pointer', border: 'none', background: 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: copiedId === (msg.id || idx) ? '#22c55e' : '#cbd5e1', transition: 'color 0.2s'
          }}>{copiedId === (msg.id || idx) ? <Check size={16}/> : <Copy size={16}/>}</button>
        </div>
      </div>
    </div>
  );
});
