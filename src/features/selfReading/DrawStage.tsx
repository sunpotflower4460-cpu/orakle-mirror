import React from 'react';
import { RotateCcw, Sparkles } from 'lucide-react';
import { useT } from '../../i18n';
import type { OracleCard, SelfReadingSpread } from '../../types';
import { SELF_READING_STYLES } from './selfReadingStyles';

interface DrawStageProps {
  cards: OracleCard[];
  spread: SelfReadingSpread;
  onReset: () => void;
}

const shuffleCards = [
  { x: '-34px', y: '8px', r: '-14deg', x2: '15px', y2: '3px', r2: '8deg' },
  { x: '30px', y: '-7px', r: '12deg', x2: '-13px', y2: '-2px', r2: '-7deg' },
  { x: '-18px', y: '-13px', r: '8deg', x2: '8px', y2: '-5px', r2: '-4deg' },
  { x: '42px', y: '15px', r: '-10deg', x2: '-19px', y2: '5px', r2: '6deg' },
  { x: '-42px', y: '18px', r: '16deg', x2: '19px', y2: '6px', r2: '-9deg' },
  { x: '12px', y: '-18px', r: '-7deg', x2: '-5px', y2: '-6px', r2: '4deg' },
];

function SelfReadingCardFace({ card }: { card: OracleCard }) {
  const [imageFailed, setImageFailed] = React.useState(false);
  const hasImage = Boolean(card.image) && !imageFailed;

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <div style={{ flex: '1 1 auto', minHeight: 0, display: 'grid', placeItems: 'center', padding: 10 }}>
        {hasImage ? (
          <img
            src={card.image}
            alt={card.imageAlt || card.name}
            loading="lazy"
            onError={() => setImageFailed(true)}
            style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 12, display: 'block' }}
          />
        ) : (
          <div
            aria-hidden
            style={{
              width: '76%',
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
      <div style={{ padding: '0 10px 12px', textAlign: 'center' }}>
        <div style={{ color: '#263044', fontSize: 12, lineHeight: 1.45, letterSpacing: '0.06em', fontWeight: 700 }}>{card.name}</div>
        <div style={{ marginTop: 5, color: '#7f8998', fontSize: 10, lineHeight: 1.45, letterSpacing: '0.03em' }}>{card.meaning}</div>
      </div>
    </div>
  );
}

export function DrawStage({ cards, spread, onReset }: DrawStageProps) {
  const t = useT();
  const spreadClass = `sr-spread-${spread.id}`;

  return (
    <section className="sr-draw-stage" aria-label={t('a11y.sr.drawStage')}>
      <style>{SELF_READING_STYLES}</style>
      <div className="sr-draw-table">
        <div className="sr-shuffle" aria-hidden>
          {shuffleCards.map((card, index) => (
            <div
              key={index}
              className="sr-shuffle-card"
              style={{
                '--sr-x': card.x,
                '--sr-y': card.y,
                '--sr-r': card.r,
                '--sr-x2': card.x2,
                '--sr-y2': card.y2,
                '--sr-r2': card.r2,
                animationDelay: `${index * 0.035}s`,
              } as React.CSSProperties}
            />
          ))}
        </div>

        <div className={`sr-card-row ${spreadClass}`}>
          {cards.map((card, index) => (
            <article
              key={`${card.name}-${index}`}
              className="sr-card-shell"
              style={{ animationDelay: `${1.45 + index * 0.16}s` }}
            >
              <div className="sr-flip-card" style={{ animationDelay: `${2.0 + index * 0.34}s` }}>
                <div className="sr-card-side sr-card-back" aria-hidden />
                <div className="sr-card-side sr-card-front">
                  <SelfReadingCardFace card={card} />
                </div>
              </div>
            </article>
          ))}
        </div>

        <div className="sr-complete" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
          <p style={{ margin: 0, color: '#7f8998', fontSize: 12, lineHeight: 1.8, letterSpacing: '0.06em', textAlign: 'center' }}>{t('sr.draw.complete')}</p>
          <button
            type="button"
            onClick={onReset}
            style={{
              minHeight: 44,
              borderRadius: 999,
              border: '1px solid rgba(210,219,236,0.48)',
              background: 'rgba(255,255,255,0.82)',
              color: '#263044',
              padding: '0 16px',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              cursor: 'pointer',
              boxShadow: 'var(--om-shadow-soft)',
              fontSize: 12,
              letterSpacing: '0.08em',
              fontWeight: 700,
            }}
          >
            <RotateCcw size={15} strokeWidth={1.7} />
            {t('sr.draw.reset')}
          </button>
        </div>
      </div>
    </section>
  );
}
