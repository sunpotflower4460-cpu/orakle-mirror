import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ChevronLeft } from 'lucide-react';
import { DECKS } from '../../constants/decks';
import { SPREADS } from '../../constants/spreads';
import { useT } from '../../i18n';
import { drawCardsQuantum } from '../../lib/draw';
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

  const pickerDecks = useMemo(
    () => deckOptions.filter(deck => deck.ready || deck.id === 'userCards'),
    [deckOptions],
  );

  const selectedDeck = pickerDecks.find(deck => deck.id === selectedDeckId)
    ?? pickerDecks[0]
    ?? DECKS[0];
  const selectedSpread = SPREADS.find(spread => spread.id === selectedSpreadId) ?? SPREADS[0];
  const spreadCardCount = selectedSpread.positionKeys.length;
  const hasEnoughCards = selectedDeck.cards.length >= spreadCardCount;
  const canDraw = Boolean(selectedDeck && selectedSpread && selectedDeck.ready && hasEnoughCards);

  // Phase 4.16: 「引く」操作で演出を即開始しつつ、その裏で QRNG を取得する。
  // 取得が済むと drawnCards が埋まり、DrawStage がカードを伏せから開く。
  // 取得が演出より遅れても、DrawStage 側がカード確定前に完了させない（静かに待つ）。
  // QRNG はレイテンシがばらつくため、連続「引き直し」で先行リクエストが後着しても
  // 最新の操作だけが反映されるよう、ドロートークンで in-flight を識別する。
  const drawTokenRef = useRef(0);
  const startDraw = useCallback(async () => {
    if (!canDraw) return;
    const token = ++drawTokenRef.current;
    setDrawnCards([]);
    setStep('drawing');
    const { cards } = await drawCardsQuantum(selectedDeck, spreadCardCount);
    if (drawTokenRef.current !== token) return; // 後続の引き直し / 画面遷移が発生したら破棄
    setDrawnCards(cards);
  }, [canDraw, selectedDeck, spreadCardCount]);

  const handleDraw = () => {
    void startDraw();
  };

  const handleDrawComplete = () => {
    setStep('result');
  };

  const handleDrawAgain = () => {
    void startDraw();
  };

  const handleChangeSetup = () => {
    drawTokenRef.current += 1; // in-flight の引きを無効化
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

  const drawHint = !canDraw
    ? (deckMessage
      || (selectedDeck.id === 'userCards' && selectedDeck.cards.length === 0
        ? t('selfReading.deck.userCards.empty')
        : selectedDeck.ready && !hasEnoughCards
          ? t('sr.deck.notEnoughForSpread')
          : t('sr.drawPreparing')))
    : null;

  return (
    <div style={{
      flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', overflow: 'hidden',
      paddingTop: 'calc(18px + var(--sat))',
      paddingLeft: 'calc(18px + var(--sal))',
      paddingRight: 'calc(18px + var(--sar))',
    }}>
      <div style={{
        flex: 1, minHeight: 0, overflowY: 'auto',
        paddingBottom: step === 'setup' ? 12 : 'calc(28px + var(--sab))',
      }}>
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

          {step === 'setup' && (
            <div style={{
              borderRadius: 32,
              border: '1px solid rgba(210,219,236,0.42)',
              background: 'linear-gradient(150deg, rgba(255,255,255,0.86), rgba(255,247,251,0.76), rgba(244,249,255,0.68))',
              boxShadow: 'var(--om-shadow-card)',
              padding: '30px 22px',
              textAlign: 'center',
            }}>
              <div className="om-star-divider om-star-divider--sm" aria-hidden="true" style={{ marginBottom: 12 }}>
                <span>✦</span>
              </div>
              <h1 style={{ margin: 0, fontSize: 22, letterSpacing: '0.18em', color: '#263044', fontWeight: 500 }}>{t('sr.home.title')}</h1>
              <p style={{ margin: '14px auto 0', maxWidth: 430, color: '#7f8998', fontSize: 13, lineHeight: 1.9, letterSpacing: '0.04em' }}>{t('sr.home.body')}</p>
            </div>
          )}

          {step === 'setup' ? (
            <>
              <DeckPicker decks={pickerDecks} selectedDeckId={selectedDeckId} selectedSpreadCount={spreadCardCount} onSelectDeck={setSelectedDeckId} />
              <SpreadPicker selectedSpreadId={selectedSpreadId} onSelectSpread={setSelectedSpreadId} />
              <QuestionInput value={question} onChange={setQuestion} />

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 10 }}>
                <button
                  type="button"
                  aria-label={t('a11y.sr.createOpen')}
                  onClick={() => setStep('creator')}
                  style={{
                    minHeight: 48,
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
                    minHeight: 48,
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

      {step === 'setup' && (
        <div style={{
          flexShrink: 0, maxWidth: 660, width: '100%', margin: '0 auto',
          padding: '10px 0 calc(16px + var(--sab))',
          borderTop: '1px solid rgba(220,210,216,0.28)',
          background: 'linear-gradient(180deg, rgba(255,252,253,0.55), rgba(255,250,252,0.96))',
        }}>
          <button
            type="button"
            disabled={!canDraw}
            onClick={handleDraw}
            className="om-cta"
            style={{
              width: '100%',
              minHeight: 52,
              borderRadius: 18,
              fontSize: 12,
              letterSpacing: '0.16em',
              opacity: canDraw ? 1 : 0.55,
            }}
          >
            {t('sr.draw')}
          </button>
          {drawHint && (
            <p style={{ color: '#8b95a5', fontSize: 12, lineHeight: 1.8, letterSpacing: '0.04em', textAlign: 'center', margin: '8px 0 0' }}>
              {drawHint}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
