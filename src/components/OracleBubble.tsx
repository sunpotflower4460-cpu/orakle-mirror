import React from 'react';
import { Sparkles, Copy, Check } from 'lucide-react';
import { PERSONAS } from '../constants/personas';
import { MODES } from '../constants/modes';
import { useT } from '../i18n';
import type { Message, OracleCard, PersonaId } from '../types';

interface OracleBubbleProps {
  msg: Message;
  idx: number;
  copiedId: string | null;
  regeneratingId: string | null;
  onCopy: (text: string, id?: string) => Promise<void>;
  onSwitch: (idx: number, targetPersonaId: PersonaId) => Promise<void>;
}

interface DrawnCardViewProps {
  card: OracleCard;
  index: number;
  accent: string;
  border: string;
  soft: string;
}

function DrawnCardView({ card, index, accent, border, soft }: DrawnCardViewProps) {
  const [imageFailed, setImageFailed] = React.useState(false);
  const hasImage = Boolean(card.image) && !imageFailed;

  return (
    <article
      style={{
        minWidth: 128,
        maxWidth: 156,
        flex: '1 1 132px',
        animation: `cardReveal 0.6s cubic-bezier(0.16,1,0.3,1) ${0.15 + index * 0.12}s both`,
      }}
    >
      <div
        style={{
          position: 'relative',
          aspectRatio: '3 / 4',
          borderRadius: 18,
          border: `1px solid ${border}`,
          background: hasImage
            ? '#f8fafc'
            : `linear-gradient(160deg, rgba(255,255,255,0.98), ${soft} 52%, rgba(255,247,248,0.95) 100%)`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'hidden',
          boxShadow: `0 10px 24px ${accent}10`,
        }}
      >
        {hasImage ? (
          <img
            src={card.image}
            alt={card.imageAlt || card.name}
            loading="lazy"
            onError={() => setImageFailed(true)}
            style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
          />
        ) : (
          <div
            aria-label={`${card.name} のカード画像枠`}
            style={{
              width: '74%',
              height: '80%',
              borderRadius: 16,
              border: `1px solid ${accent}24`,
              background: 'linear-gradient(145deg, rgba(255,255,255,0.78), rgba(255,255,255,0.28))',
              boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.85)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: accent,
              opacity: 0.68,
            }}
          >
            <Sparkles size={18} style={{ animation: 'pulse 3s ease-in-out infinite' }} />
          </div>
        )}
        <div
          aria-hidden="true"
          style={{
            position: 'absolute',
            inset: 0,
            background: hasImage
              ? 'linear-gradient(to bottom, rgba(255,255,255,0.1), rgba(255,255,255,0) 44%, rgba(15,23,42,0.03))'
              : 'linear-gradient(to bottom, rgba(255,255,255,0.18), rgba(255,255,255,0) 52%, rgba(15,23,42,0.02))',
            pointerEvents: 'none',
          }}
        />
      </div>
      <div style={{ padding: '10px 4px 0' }}>
        <div style={{ fontSize: 14, lineHeight: 1.45, fontWeight: 700, color: accent, letterSpacing: '0.03em', marginBottom: 4 }}>
          {card.name}
        </div>
        <div style={{ fontSize: 11, lineHeight: 1.65, color: '#64748b', fontWeight: 400 }}>
          {card.meaning}
        </div>
      </div>
    </article>
  );
}

export const OracleBubble = React.memo(function OracleBubble({ msg, idx, copiedId, regeneratingId, onCopy, onSwitch }: OracleBubbleProps) {
  const t = useT();
  const msgPersona = PERSONAS[msg.personaId ?? 'lumina'] || PERSONAS.lumina;
  const msgMode    = MODES[msg.modeId ? (msg.modeId.toUpperCase() as 'PURE' | 'CARD') : 'PURE'] || MODES.PURE;
  const msgId      = msg.id || String(idx);
  const isRegen    = regeneratingId === msgId;

  return (
    <div className="oracle-bubble-shell" style={{ width: '100%', animation: 'oracleReveal 1.2s cubic-bezier(0.16,1,0.3,1) forwards' }}>
      <div className="oracle-bubble-meta" style={{ display: 'flex', alignItems: 'center', gap: 8, marginLeft: 14, marginBottom: 8 }}>
        <span style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 10, letterSpacing: '0.35em', fontWeight: 800, textTransform: 'uppercase', color: msgPersona.accent }}>
          {msgPersona.icon} {msgPersona.name}
        </span>
        {msgMode && <span style={{ fontSize: 10, color: '#cbd5e1', letterSpacing: '0.2em', textTransform: 'uppercase' }}>· {t(`mode.${msgMode.id}.name`)}</span>}
      </div>
      <div className="oracle-bubble oracle-bubble-card" style={{
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
          <div style={{ marginBottom: 22, padding: '15px 15px 0', background: `linear-gradient(to bottom right, #ffffff, ${msgPersona.soft})`, borderRadius: 22, border: `1px solid ${msgPersona.border}` }}>
            <div style={{ display:'flex', alignItems:'center', gap:6, fontSize: 11, letterSpacing: '0.08em', color: '#7b8494', marginBottom: 12 }}>
              <Sparkles size={12} style={{ color: msgPersona.accent, animation: 'pulse 3s ease-in-out infinite' }} /> {t('cards.drawnTitle')}
            </div>
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 22, overflow: 'hidden' }}>
              {msg.drawnCards.map((c, ci) => (
                <DrawnCardView key={`${c.name}-${ci}`} card={c} index={ci} accent={msgPersona.accent} border={msgPersona.border} soft={msgPersona.soft} />
              ))}
            </div>
          </div>
        )}
        <div className="oracle-bubble-text" style={{ fontSize: 15, lineHeight: 2.1, letterSpacing: '0.04em', color: '#374151', fontWeight: 300 }}>
          {msg.text.split('\n').map((line, i) => {
            const isHeader = /^[①②③【]/.test(line);
            return <p key={i} style={{
              marginBottom: line === '' ? 4 : 14, fontWeight: isHeader ? 700 : 300, fontSize: isHeader ? 12 : 15,
              color: isHeader ? msgPersona.accent : '#374151', borderBottom: isHeader ? `1px solid ${msgPersona.accent}22` : 'none',
              paddingBottom: isHeader ? 6 : 0, marginTop: isHeader ? 16 : 0, letterSpacing: isHeader ? '0.15em' : '0.04em',
            }}>{line || '\u00A0'}</p>;
          })}
        </div>
        {/* Phase A: \u4E26\u8D70\u30AD\u30FC\u30EF\u30FC\u30C9\u5C64\u3002\u672C\u6587\u3068\u306F\u72EC\u7ACB\u306B\u3001\u91CF\u5B50\u4E71\u6570\u3067\u300C\u5834\u304B\u3089\u9078\u3070\u308C\u305F\u300D\u8A00\u8449\u3092
            \u9759\u304B\u306B\u6DFB\u3048\u308B\u3002\u672C\u6587\u30FB\u30B3\u30D4\u30FC\u5BFE\u8C61\u306B\u306F\u4E00\u5207\u89E6\u308C\u306A\u3044\u3002\u9069\u5408\u5224\u5B9A\u3082\u5F37\u8ABF\u3082\u3057\u306A\u3044\u3002 */}
        {msg.keywords && msg.keywords.length > 0 && (
          <div className="oracle-bubble-keywords" style={{ marginTop: 22, display: 'flex', flexDirection: 'column', gap: 7, animation: 'cardReveal 0.7s cubic-bezier(0.16,1,0.3,1) 0.25s both' }}>
            <div style={{ fontSize: 10, letterSpacing: '0.18em', color: '#aab2bf', fontWeight: 500 }}>
              {t('keywords.title')}
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 9, fontSize: 13, letterSpacing: '0.12em', color: '#7b8494', fontWeight: 400 }}>
              {msg.keywords.map((k, ki) => (
                <React.Fragment key={`${k.word}-${ki}`}>
                  {ki > 0 && <span aria-hidden="true" style={{ color: '#d4dae3' }}>\u00B7</span>}
                  <span>{k.word}</span>
                </React.Fragment>
              ))}
            </div>
          </div>
        )}
        <div className="bubble-actions oracle-bubble-footer" style={{ marginTop: 24, paddingTop: 10, borderTop: '1px solid #f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div className="oracle-bubble-switchers" style={{ display: 'flex', gap: 2 }}>
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
