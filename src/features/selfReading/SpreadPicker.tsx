import { SPREADS } from '../../constants/spreads';
import { useT } from '../../i18n';
import type { SelfReadingSpreadId } from '../../types';

interface SpreadPickerProps {
  selectedSpreadId: SelfReadingSpreadId;
  onSelectSpread: (spreadId: SelfReadingSpreadId) => void;
}

export function SpreadPicker({ selectedSpreadId, onSelectSpread }: SpreadPickerProps) {
  const t = useT();

  return (
    <section aria-labelledby="self-reading-spread-title" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div id="self-reading-spread-title" style={{ fontSize: 10, letterSpacing: '0.24em', color: '#8994a6', textTransform: 'uppercase', fontWeight: 700 }}>{t('sr.spread.pick')}</div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: 10 }}>
        {SPREADS.map(spread => {
          const isSelected = selectedSpreadId === spread.id;
          return (
            <button
              key={spread.id}
              type="button"
              aria-pressed={isSelected}
              onClick={() => onSelectSpread(spread.id)}
              style={{
                minHeight: 86,
                padding: '14px 10px',
                borderRadius: 20,
                border: isSelected ? '1px solid rgba(215,120,148,0.56)' : '1px solid rgba(210,219,236,0.42)',
                background: isSelected ? 'rgba(255,255,255,0.94)' : 'rgba(255,255,255,0.66)',
                boxShadow: isSelected ? 'var(--om-shadow-card)' : 'var(--om-shadow-soft)',
                color: isSelected ? '#263044' : '#7f8998',
                cursor: 'pointer',
                fontSize: 12,
                lineHeight: 1.6,
                letterSpacing: '0.06em',
                fontWeight: 600,
              }}
            >
              {t(spread.nameKey)}
            </button>
          );
        })}
      </div>
    </section>
  );
}
