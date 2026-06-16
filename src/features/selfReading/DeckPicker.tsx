import { useT } from '../../i18n';
import type { SelfReadingDeck, SelfReadingDeckId } from '../../types';

interface DeckPickerProps {
  decks: readonly SelfReadingDeck[];
  selectedDeckId: SelfReadingDeckId;
  selectedSpreadCount: number;
  onSelectDeck: (deckId: SelfReadingDeckId) => void;
}

export function DeckPicker({ decks, selectedDeckId, selectedSpreadCount, onSelectDeck }: DeckPickerProps) {
  const t = useT();

  return (
    <section aria-labelledby="self-reading-deck-title" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div>
        <div id="self-reading-deck-title" style={{ fontSize: 10, letterSpacing: '0.24em', color: '#8994a6', textTransform: 'uppercase', fontWeight: 700 }}>{t('sr.deck.pick')}</div>
      </div>
      <div style={{ display: 'grid', gap: 10 }}>
        {decks.map(deck => {
          const isSelected = selectedDeckId === deck.id;
          const hasEnoughCards = deck.cards.length >= selectedSpreadCount;
          const isSelectable = deck.ready && hasEnoughCards;
          const statusKey = deck.id === 'userCards' && deck.cards.length === 0
            ? 'selfReading.deck.userCards.empty'
            : deck.ready && !hasEnoughCards
              ? 'selfReading.deck.userCards.notEnough'
              : 'sr.deck.comingSoon';
          return (
            <button
              key={deck.id}
              type="button"
              disabled={!isSelectable}
              aria-pressed={isSelected}
              onClick={() => onSelectDeck(deck.id)}
              style={{
                width: '100%',
                textAlign: 'left',
                padding: '16px 18px',
                borderRadius: 22,
                border: isSelected ? '1px solid rgba(215,120,148,0.52)' : '1px solid rgba(210,219,236,0.42)',
                background: isSelected ? 'rgba(255,255,255,0.94)' : 'rgba(255,255,255,0.68)',
                boxShadow: isSelected ? 'var(--om-shadow-card)' : 'var(--om-shadow-soft)',
                cursor: isSelectable ? 'pointer' : 'not-allowed',
                opacity: isSelectable ? 1 : 0.58,
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                gap: 12,
              }}
            >
              <span style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <span style={{ fontSize: 14, letterSpacing: '0.08em', color: '#263044', fontWeight: 600 }}>{t(deck.nameKey)}</span>
                <span style={{ fontSize: 12, lineHeight: 1.7, color: '#7f8998' }}>{t(deck.descriptionKey)}</span>
              </span>
              {!isSelectable && (
                <span style={{ flexShrink: 0, fontSize: 10, letterSpacing: '0.16em', color: '#d77894', fontWeight: 700 }}>{t(statusKey)}</span>
              )}
            </button>
          );
        })}
      </div>
    </section>
  );
}
