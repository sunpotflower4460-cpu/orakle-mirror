import React from 'react';
import { RotateCcw, Settings2, Sparkles } from 'lucide-react';
import { useT } from '../../i18n';
import type { OracleCard, SelfReadingSpread } from '../../types';

interface ReadingResultProps {
  cards: OracleCard[];
  spread: SelfReadingSpread;
  question: string;
  onDrawAgain: () => void;
  onChangeSetup: () => void;
}

function ResultCard({ card, positionLabel }: { card: OracleCard; positionLabel: string }) {
  const [imageFailed, setImageFailed] = React.useState(false);
  const hasImage = Boolean(card.image) && !imageFailed;

  return (
    <article
      style={{
        borderRadius: 24,
        border: '1px solid rgba(210,219,236,0.44)',
        background: 'rgba(255,255,255,0.82)',
        boxShadow: 'var(--om-shadow-soft)',
        padding: 16,
        display: 'grid',
        gridTemplateColumns: 'minmax(82px, 112px) minmax(0, 1fr)',
        gap: 16,
        alignItems: 'center',
      }}
    >
      <div
        style={{
          aspectRatio: '3 / 4',
          borderRadius: 18,
          border: '1px solid rgba(215,120,148,0.26)',
          background: hasImage ? '#f8fafc' : 'linear-gradient(160deg, rgba(255,255,255,0.98), rgba(255,242,247,0.94) 54%, rgba(244,249,255,0.92))',
          boxShadow: '0 14px 26px rgba(215,120,148,0.10)',
          overflow: 'hidden',
          display: 'grid',
          placeItems: 'center',
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
            aria-hidden
            style={{
              width: '74%',
              height: '78%',
              borderRadius: 16,
              border: '1px solid rgba(215,120,148,0.22)',
              background: 'linear-gradient(145deg, rgba(255,255,255,0.82), rgba(255,255,255,0.30))',
              boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.86)',
              display: 'grid',
              placeItems: 'center',
              color: '#d77894',
            }}
          >
            <Sparkles size={18} strokeWidth={1.4} />
          </div>
        )}
      </div>

      <div style={{ minWidth: 0 }}>
        <div style={{ color: '#d77894', fontSize: 10, letterSpacing: '0.18em', fontWeight: 800, marginBottom: 8 }}>{positionLabel}</div>
        <h3 style={{ margin: 0, color: '#263044', fontSize: 16, lineHeight: 1.5, letterSpacing: '0.08em', fontWeight: 700 }}>{card.name}</h3>
        <p style={{ margin: '8px 0 0', color: '#64748b', fontSize: 13, lineHeight: 1.8, letterSpacing: '0.04em' }}>{card.meaning}</p>
      </div>
    </article>
  );
}

export function ReadingResult({ cards, spread, question, onDrawAgain, onChangeSetup }: ReadingResultProps) {
  const t = useT();
  const trimmedQuestion = question.trim();

  return (
    <section aria-label={t('a11y.sr.result')} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{ borderRadius: 28, border: '1px solid rgba(210,219,236,0.42)', background: 'linear-gradient(150deg, rgba(255,255,255,0.88), rgba(255,247,251,0.78), rgba(244,249,255,0.70))', boxShadow: 'var(--om-shadow-card)', padding: '22px 18px' }}>
        <div style={{ color: '#d77894', fontSize: 12, marginBottom: 10, textAlign: 'center' }}>✦</div>
        <h2 style={{ margin: 0, color: '#263044', textAlign: 'center', fontSize: 18, letterSpacing: '0.16em', fontWeight: 600 }}>{t('sr.result.title')}</h2>
        {trimmedQuestion && (
          <p style={{ margin: '16px 0 0', borderRadius: 20, border: '1px solid rgba(210,219,236,0.36)', background: 'rgba(255,255,255,0.62)', padding: '12px 14px', color: '#64748b', fontSize: 13, lineHeight: 1.8, letterSpacing: '0.04em' }}>
            <span style={{ display: 'block', color: '#8b95a5', fontSize: 10, letterSpacing: '0.16em', fontWeight: 800, marginBottom: 4 }}>{t('sr.result.question')}</span>
            {trimmedQuestion}
          </p>
        )}
        <p style={{ margin: '14px 0 0', color: '#7f8998', textAlign: 'center', fontSize: 12, letterSpacing: '0.08em' }}>{t('sr.result.spread')}: {t(spread.nameKey)}</p>
      </div>

      <div style={{ display: 'grid', gap: 12 }}>
        {cards.map((card, index) => (
          <ResultCard key={`${card.name}-${index}`} card={card} positionLabel={t(spread.positionKeys[index] ?? spread.positionKeys[0])} />
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 10 }}>
        <button type="button" onClick={onDrawAgain} style={{ minHeight: 48, borderRadius: 18, border: 'none', background: 'linear-gradient(135deg, #263044, #465a8a)', color: 'rgba(255,255,255,0.92)', fontSize: 12, fontWeight: 700, letterSpacing: '0.12em', cursor: 'pointer', boxShadow: '0 14px 28px rgba(38,48,68,0.16)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
          <RotateCcw size={15} strokeWidth={1.7} />
          {t('sr.result.drawAgain')}
        </button>
        <button type="button" onClick={onChangeSetup} style={{ minHeight: 48, borderRadius: 18, border: '1px solid rgba(210,219,236,0.48)', background: 'rgba(255,255,255,0.82)', color: '#263044', fontSize: 12, fontWeight: 700, letterSpacing: '0.08em', cursor: 'pointer', boxShadow: 'var(--om-shadow-soft)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
          <Settings2 size={15} strokeWidth={1.7} />
          {t('sr.result.changeSetup')}
        </button>
      </div>
    </section>
  );
}
