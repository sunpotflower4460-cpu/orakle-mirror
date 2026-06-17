import { useCallback, useEffect, useMemo, useState } from 'react';
import { ChevronLeft } from 'lucide-react';
import { DECKS } from '../../constants/decks';
import { SPREADS } from '../../constants/spreads';
import { useT } from '../../i18n';
import { drawCards } from '../../lib/draw';
import { loadSelfReadingStore, saveSelfReading } from '../../lib/selfReadingStorage';
import type { OracleCard, SelfReading, SelfReadingDeck, SelfReadingDeckId, SelfReadingSpreadId, UserCard } from '../../types';
import { DeckPicker } from './DeckPicker';
import { QuestionInput } from './QuestionInput';
import { SpreadPicker } from './SpreadPicker';
import { DrawStage } from './DrawStage';
import { ReadingResult } from './ReadingResult';
import { CardCreator } from './CardCreator';
import { ReadingHistory } from './ReadingHistory';

interface SelfReadingViewProps {
  onBack: () => void;
}

type SelfReadingStep = 'setup' | 'drawing' | 'result' | 'creator' | 'history';

export function SelfReadingView({ onBack }: SelfReadingViewProps) {
  const t = useT();
  const [selectedDeckId, setSelectedDeckId] = useState<SelfReadingDeckId>('classic48');
  const [selectedSpreadId, setSelectedSpreadId] = useState<SelfReadingSpreadId>('one');
  const [question, setQuestion] = useState<string>('');
  const [step, setStep] = useState<SelfReadingStep>('setup');
  const [drawnCards, setDrawnCards] = useState<OracleCard[]>([]);
  const [userCards, setUserCards] = useState<UserCard[]>([]);
  const [deckMessage, setDeckMessage] = useState('');

  const refreshUserCards = useCallback(async () => {
    try {
      const store = await loadSelfReadingStore();
      setUserCards(store.userCards);
      setDeckMessage('');
    } catch {
      setUserCards([]);
      setDeckMessage(t('sr.deck.loadFailed'));
    }
  }, [t]);

  useEffect(() => {
    void refreshUserCards();
  }, [refreshUserCards]);

  const deckOptions = useMemo<readonly SelfReadingDeck[]>(() => [
    ...DECKS,
    {
      id: 'userCards',
      nameKey: 'selfReading.deck.userCards.name',
      descriptionKey: 'selfReading.deck.userCards.description',
      ready: userCards.length > 0,
      cards: userCards,
    },
  ], [userCards]);

  const selectedDeck = deckOptions.find(deck => deck.id === selectedDeckId) ?? deckOptions[0];
  const selectedSpread = SPREADS.find(spread => spread.id === selectedSpreadId) ?? SPREADS[0];
  const spreadCardCount = selectedSpread.positionKeys.length;
  const hasEnoughCards = selectedDeck.cards.length >= spreadCardCount;
  const canDraw = Boolean(selectedDeck && selectedSpread && selectedDeck.ready && hasEnoughCards);

  const handleDraw = () => {
    if (!canDraw) return;
    setDrawnCards(drawCards(selectedDeck, spreadCardCount));
    setStep('drawing');
  };

  const handleDrawComplete = () => {
    setStep('result');
  };

  const handleDrawAgain = () => {
    if (!canDraw) return;
    setDrawnCards(drawCards(selectedDeck, spreadCardCount));
    setStep('drawing');
  };

  const handleChangeSetup = () => {
    setDrawnCards([]);
    setStep('setup');
  };

  const handleSaveReading = async () => {
    const trimmedQuestion = question.trim();
    const reading: SelfReading = {
      id: `self-reading-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      createdAt: Date.now(),
      deckId: selectedDeck.id,
      spreadId: selectedSpread.id,
      ...(trimmedQuestion ? { question: trimmedQuestion } : {}),
      cards: drawnCards.map((card, index) => ({
        card,
        positionId: selectedSpread.positionKeys[index] ?? selectedSpread.positionKeys[0],
      })),
    };

    await saveSelfReading(reading);
  };

  return (
    <div style={{ flex: 1, overflowY: 'auto', padding: 'calc(18px + var(--sat)) calc(18px + var(--sar)) calc(28px + var(--sab)) calc(18px + var(--sal))' }}>
      <div style={{ maxWidth: 660, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 22 }}>
        <button
          type="button"
          aria-label={t('a11y.sr.back')}
          onClick={onBack}
          style={{
            alignSelf: 'flex-start',
            minHeight: 44,
            padding: '0 16px 0 12px',
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
          {t('sr.back')}
        </button>

        <div style={{
          borderRadius: 32,
          border: '1px solid rgba(210,219,236,0.42)',
          background: 'linear-gradient(150deg, rgba(255,255,255,0.86), rgba(255,247,251,0.76), rgba(244,249,255,0.68))',
          boxShadow: 'var(--om-shadow-card)',
          padding: '30px 22px',
          textAlign: 'center',
        }}>
          <div style={{ color: '#d77894', fontSize: 12, marginBottom: 12 }}>✦</div>
          <h1 style={{ margin: 0, fontSize: 22, letterSpacing: '0.18em', color: '#263044', fontWeight: 500 }}>{t('sr.home.title')}</h1>
          <p style={{ margin: '14px auto 0', maxWidth: 430, color: '#7f8998', fontSize: 13, lineHeight: 1.9, letterSpacing: '0.04em' }}>{t('sr.home.body')}</p>
        </div>

        {step === 'setup' ? (
          <>
            <DeckPicker decks={deckOptions} selectedDeckId={selectedDeckId} selectedSpreadCount={spreadCardCount} onSelectDeck={setSelectedDeckId} />
            <SpreadPicker selectedSpreadId={selectedSpreadId} onSelectSpread={setSelectedSpreadId} />
            <QuestionInput value={question} onChange={setQuestion} />

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 10 }}>
              <button
                type="button"
                aria-label={t('a11y.sr.createOpen')}
                onClick={() => setStep('creator')}
                style={{
                  minHeight: 46,
                  borderRadius: 18,
                  border: '1px solid rgba(210,219,236,0.46)',
                  background: 'rgba(255,255,255,0.70)',
                  color: '#7f8998',
                  fontSize: 12,
                  fontWeight: 700,
                  letterSpacing: '0.10em',
                  cursor: 'pointer',
                  boxShadow: 'var(--om-shadow-soft)',
                }}
              >
                {t('sr.create.open')}
              </button>
              <button
                type="button"
                aria-label={t('a11y.sr.historyOpen')}
                onClick={() => setStep('history')}
                style={{
                  minHeight: 46,
                  borderRadius: 18,
                  border: '1px solid rgba(210,219,236,0.46)',
                  background: 'rgba(255,255,255,0.70)',
                  color: '#7f8998',
                  fontSize: 12,
                  fontWeight: 700,
                  letterSpacing: '0.10em',
                  cursor: 'pointer',
                  boxShadow: 'var(--om-shadow-soft)',
                }}
              >
                {t('sr.history.open')}
              </button>
            </div>

            <div style={{
              borderRadius: 24,
              border: '1px solid rgba(210,219,236,0.42)',
              background: 'rgba(255,250,252,0.76)',
              boxShadow: 'var(--om-shadow-soft)',
              padding: 16,
              display: 'flex',
              flexDirection: 'column',
              gap: 10,
            }}>
              <button
                type="button"
                disabled={!canDraw}
                onClick={handleDraw}
                style={{
                  width: '100%',
                  minHeight: 52,
                  borderRadius: 18,
                  border: 'none',
                  background: canDraw
                    ? 'linear-gradient(135deg, #263044, #465a8a)'
                    : 'linear-gradient(135deg, rgba(13,19,40,0.42), rgba(20,28,56,0.34))',
                  color: 'rgba(255,255,255,0.9)',
                  fontSize: 12,
                  fontWeight: 700,
                  letterSpacing: '0.16em',
                  cursor: canDraw ? 'pointer' : 'not-allowed',
                  boxShadow: canDraw ? '0 14px 28px rgba(38,48,68,0.16)' : 'none',
                }}
              >
                {t('sr.draw')}
              </button>
              {!canDraw && (
                <p style={{ color: '#8b95a5', fontSize: 12, lineHeight: 1.8, letterSpacing: '0.04em', textAlign: 'center' }}>
                  {deckMessage || (selectedDeck.ready && !hasEnoughCards ? t('sr.deck.notEnoughForSpread') : t('sr.drawPreparing'))}
                </p>
              )}
            </div>
          </>
        ) : step === 'history' ? (
          <ReadingHistory onBack={() => setStep('setup')} />
        ) : step === 'creator' ? (
          <CardCreator
            onBack={() => {
              void refreshUserCards();
              setStep('setup');
            }}
            onUserCardsChange={setUserCards}
          />
        ) : step === 'drawing' ? (
          <DrawStage cards={drawnCards} spread={selectedSpread} onComplete={handleDrawComplete} />
        ) : (
          <ReadingResult
            cards={drawnCards}
            spread={selectedSpread}
            question={question}
            onSaveReading={handleSaveReading}
            onDrawAgain={handleDrawAgain}
            onChangeSetup={handleChangeSetup}
          />
        )}
      </div>
    </div>
  );
}
