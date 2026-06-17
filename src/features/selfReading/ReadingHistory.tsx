import { useEffect, useMemo, useState } from 'react';
import { ChevronLeft, Trash2 } from 'lucide-react';
import { DECKS } from '../../constants/decks';
import { SPREADS } from '../../constants/spreads';
import { useLocale, useT } from '../../i18n';
import { deleteSelfReading, loadSelfReadingStore } from '../../lib/selfReadingStorage';
import type { SelfReading } from '../../types';

interface ReadingHistoryProps {
  onBack: () => void;
}

export function ReadingHistory({ onBack }: ReadingHistoryProps) {
  const { locale } = useLocale();
  const t = useT();
  const [readings, setReadings] = useState<SelfReading[]>([]);
  const [message, setMessage] = useState('');

  useEffect(() => {
    let mounted = true;
    loadSelfReadingStore()
      .then(store => {
        if (mounted) setReadings(store.readings);
      })
      .catch(() => {
        if (mounted) setMessage(t('sr.history.loadFailed'));
      });
    return () => {
      mounted = false;
    };
  }, [t]);

  const dateFormatter = useMemo(() => new Intl.DateTimeFormat(locale, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }), [locale]);

  const handleDelete = async (readingId: string) => {
    try {
      const store = await deleteSelfReading(readingId);
      setReadings(store.readings);
      setMessage('');
    } catch {
      setMessage(t('sr.history.deleteFailed'));
    }
  };

  return (
    <section aria-labelledby="self-reading-history-title" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <button
        type="button"
        aria-label={t('a11y.sr.historyBack')}
        onClick={onBack}
        style={{
          alignSelf: 'flex-start',
          minHeight: 42,
          padding: '0 14px 0 10px',
          borderRadius: 999,
          border: '1px solid rgba(210,219,236,0.42)',
          background: 'rgba(255,255,255,0.76)',
          color: '#7f8998',
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          cursor: 'pointer',
          boxShadow: 'var(--om-shadow-soft)',
          fontSize: 12,
          letterSpacing: '0.08em',
        }}
      >
        <ChevronLeft size={16} strokeWidth={1.6} />
        {t('sr.history.back')}
      </button>

      <div style={{ borderRadius: 28, border: '1px solid rgba(210,219,236,0.42)', background: 'rgba(255,255,255,0.82)', boxShadow: 'var(--om-shadow-card)', padding: '22px 18px' }}>
        <h2 id="self-reading-history-title" style={{ margin: 0, color: '#263044', fontSize: 18, letterSpacing: '0.14em', fontWeight: 600 }}>{t('sr.history.title')}</h2>
        <p style={{ margin: '10px 0 0', color: '#7f8998', fontSize: 12, lineHeight: 1.8, letterSpacing: '0.04em' }}>{t('sr.history.localOnly')}</p>
      </div>

      {message && <p style={{ margin: 0, color: '#b45353', fontSize: 12, lineHeight: 1.8, letterSpacing: '0.04em' }}>{message}</p>}

      {readings.length === 0 ? (
        <p style={{ margin: 0, borderRadius: 24, border: '1px solid rgba(210,219,236,0.42)', background: 'rgba(255,250,252,0.76)', boxShadow: 'var(--om-shadow-soft)', padding: 16, color: '#8b95a5', fontSize: 12, lineHeight: 1.8, letterSpacing: '0.04em' }}>{t('sr.history.empty')}</p>
      ) : (
        <div style={{ display: 'grid', gap: 12 }}>
          {readings.map(reading => {
            const deck = DECKS.find(item => item.id === reading.deckId);
            const spread = SPREADS.find(item => item.id === reading.spreadId) ?? SPREADS[0];
            const deckName = reading.deckId === 'userCards' ? t('selfReading.deck.userCards.name') : t(deck?.nameKey ?? 'selfReading.deck.classic48.name');
            const question = reading.question?.trim();

            return (
              <article key={reading.id} style={{ borderRadius: 24, border: '1px solid rgba(210,219,236,0.42)', background: 'rgba(255,255,255,0.82)', boxShadow: 'var(--om-shadow-soft)', padding: 16, display: 'flex', flexDirection: 'column', gap: 12 }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) auto', gap: 12, alignItems: 'start' }}>
                  <div>
                    <p style={{ margin: 0, color: '#d77894', fontSize: 11, letterSpacing: '0.12em', fontWeight: 800 }}>{dateFormatter.format(new Date(reading.createdAt))}</p>
                    <h3 style={{ margin: '6px 0 0', color: '#263044', fontSize: 15, lineHeight: 1.5, letterSpacing: '0.08em', fontWeight: 700 }}>{deckName} · {t(spread.nameKey)}</h3>
                  </div>
                  <button type="button" aria-label={t('a11y.sr.historyDelete')} onClick={() => handleDelete(reading.id)} style={{ width: 38, height: 38, borderRadius: 14, border: '1px solid rgba(210,219,236,0.44)', background: 'rgba(255,255,255,0.82)', color: '#d77894', cursor: 'pointer', display: 'grid', placeItems: 'center' }}>
                    <Trash2 size={15} strokeWidth={1.7} />
                  </button>
                </div>

                {question && (
                  <p style={{ margin: 0, borderRadius: 18, border: '1px solid rgba(210,219,236,0.34)', background: 'rgba(255,250,252,0.70)', padding: 12, color: '#64748b', fontSize: 12, lineHeight: 1.8, letterSpacing: '0.04em' }}>
                    <span style={{ display: 'block', color: '#8b95a5', fontSize: 10, letterSpacing: '0.16em', fontWeight: 800, marginBottom: 4 }}>{t('sr.history.question')}</span>
                    {question}
                  </p>
                )}

                <div style={{ display: 'grid', gap: 10 }}>
                  {reading.cards.map((resultCard, index) => (
                    <div key={`${reading.id}-${index}`} style={{ borderRadius: 18, border: '1px solid rgba(210,219,236,0.34)', background: 'rgba(255,255,255,0.66)', padding: 12 }}>
                      <div style={{ color: '#d77894', fontSize: 10, letterSpacing: '0.16em', fontWeight: 800, marginBottom: 6 }}>{t((spread.positionKeys[index] ?? spread.positionKeys[0]))}</div>
                      <h4 style={{ margin: 0, color: '#263044', fontSize: 14, lineHeight: 1.5, letterSpacing: '0.08em', fontWeight: 700 }}>{resultCard.card.name}</h4>
                      <p style={{ margin: '6px 0 0', color: '#64748b', fontSize: 12, lineHeight: 1.8, letterSpacing: '0.04em' }}>{resultCard.card.meaning}</p>
                    </div>
                  ))}
                </div>
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}
