import React from 'react';
import { Sparkles, Copy, Check } from 'lucide-react';
import { PERSONAS } from '../constants/personas';
import { MODES } from '../constants/modes';
import { useT } from '../i18n';
import type { Message, PersonaId } from '../types';

interface OracleBubbleProps {
  msg: Message;
  idx: number;
  copiedId: string | null;
  regeneratingId: string | null;
  onCopy: (text: string, id?: string) => Promise<void>;
  onSwitch: (idx: number, targetPersonaId: PersonaId) => Promise<void>;
}

export const OracleBubble = React.memo(function OracleBubble({ msg, idx, copiedId, regeneratingId, onCopy, onSwitch }: OracleBubbleProps) {
  const t = useT();
  const msgPersona = PERSONAS[msg.personaId ?? 'lumina'] || PERSONAS.lumina;
  const msgMode    = MODES[msg.modeId ? (msg.modeId.toUpperCase() as 'PURE' | 'CARD') : 'PURE'] || MODES.PURE;
  const msgId      = msg.id || String(idx);
  const isRegen    = regeneratingId === msgId;

  return (
    <div style={{ width: '100%', animation: 'oracleReveal 1.2s cubic-bezier(0.16,1,0.3,1) forwards' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginLeft: 14, marginBottom: 8 }}>
        <span style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 10, letterSpacing: '0.35em', fontWeight: 800, textTransform: 'uppercase', color: msgPersona.accent }}>
          {msgPersona.icon} {msgPersona.name}
        </span>
        {msgMode && <span style={{ fontSize: 10, color: '#cbd5e1', letterSpacing: '0.2em', textTransform: 'uppercase' }}>· {t(`mode.${msgMode.id}.name`)}</span>}
      </div>
      <div className="oracle-bubble" style={{
        position: 'relative', padding: '24px 28px', background: 'rgba(255,255,255,0.95)', backdropFilter: 'blur(8px)',
        borderRadius: 24, border: `1px solid ${msgPersona.border}`, boxShadow: '0 8px 32px rgba(0,0,0,0.03)',
        opacity: isRegen ? 0.4 : 1, transition: 'opacity 0.4s'
      }}>
        {isRegen && (
          <div aria-busy="true" style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10 }}>
            <div style={{ display: 'flex', gap: 5 }} aria-hidden="true">
              {[0, 1, 2].map(i => (
                <span key={i} style={{ width: 6, height: 6, borderRadius: 999, background: msgPersona.accent, animation: `breathe 1.4s ease-in-out ${i * 0.18}s infinite` }} />
              ))}
            </div>
          </div>
        )}
        {msg.drawnCards && msg.drawnCards.length > 0 && (
          <div style={{ marginBottom: 20, padding: '14px 16px', background: `linear-gradient(to bottom right, #ffffff, ${msgPersona.soft})`, borderRadius: 16, border: `1px solid ${msgPersona.border}` }}>
            <div style={{ display:'flex', alignItems:'center', gap:6, fontSize: 10, letterSpacing: '0.2em', color: '#94a3b8', textTransform: 'uppercase', marginBottom: 10 }}>
              <Sparkles size={12} style={{ color: msgPersona.accent, animation: 'pulse 3s ease-in-out infinite' }} /> Drawn Symbols
            </div>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              {msg.drawnCards.map((c, ci) => (
                <span key={c.name} style={{ fontSize: 12, fontWeight: 700, color: msgPersona.accent, background: '#fff', border: `1px solid ${msgPersona.border}`, padding: '6px 12px', borderRadius: 999, boxShadow: `0 2px 10px ${msgPersona.accent}14`, animation: `cardReveal 0.6s cubic-bezier(0.16,1,0.3,1) ${0.15 + ci * 0.12}s both` }}>{c.name}</span>
              ))}
            </div>
          </div>
        )}
        <div style={{ fontSize: 15, lineHeight: 2.1, letterSpacing: '0.04em', color: '#374151', fontWeight: 300 }}>
          {msg.text.split('\n').map((line, i) => {
            const isHeader = /^[①②③【]/.test(line);
            return <p key={i} style={{
              marginBottom: line === '' ? 4 : 14, fontWeight: isHeader ? 700 : 300, fontSize: isHeader ? 12 : 15,
              color: isHeader ? msgPersona.accent : '#374151', borderBottom: isHeader ? `1px solid ${msgPersona.accent}22` : 'none',
              paddingBottom: isHeader ? 6 : 0, marginTop: isHeader ? 16 : 0, letterSpacing: isHeader ? '0.15em' : '0.04em',
            }}>{line || '\u00A0'}</p>;
          })}
        </div>
        <div className="bubble-actions" style={{ marginTop: 24, paddingTop: 10, borderTop: '1px solid #f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', gap: 2 }}>
            {Object.values(PERSONAS).map(px => (
              <button key={px.id} title={t('a11y.regenerateWithTitle', { name: px.name })} onClick={() => onSwitch(idx, px.id)} disabled={!!regeneratingId} aria-label={t('a11y.regenerateWith', { name: px.name })}
                style={{
                  minWidth: 44, minHeight: 44, borderRadius: 999, border: 'none', 
                  cursor: !!regeneratingId ? 'not-allowed' : 'pointer',
                  background: msg.personaId === px.id ? `${px.accent}18` : 'transparent',
                  color: msg.personaId === px.id ? px.accent : '#cbd5e1', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s'
                }}>{px.icon}</button>
            ))}
          </div>
          <button onClick={() => onCopy(msg.text, msgId)} aria-label={t('a11y.copyText')} style={{
            minWidth: 44, minHeight: 44, borderRadius: 999, cursor: 'pointer', border: 'none', background: 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: copiedId === msgId ? '#22c55e' : '#cbd5e1', transition: 'color 0.2s'
          }}>{copiedId === msgId ? <Check size={16} style={{ animation: 'pop 0.3s ease' }}/> : <Copy size={16}/>}</button>
        </div>
      </div>
    </div>
  );
});
