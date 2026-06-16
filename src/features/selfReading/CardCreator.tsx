import { useEffect, useState } from 'react';
import { ChevronLeft, Trash2 } from 'lucide-react';
import { useT } from '../../i18n';
import { deleteUserCard, loadSelfReadingStore, saveUserCard } from '../../lib/selfReadingStorage';
import type { UserCard } from '../../types';

interface CardCreatorProps {
  onBack: () => void;
}

const createUserCardId = (): string => `user-card-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

export function CardCreator({ onBack }: CardCreatorProps) {
  const t = useT();
  const [name, setName] = useState('');
  const [meaning, setMeaning] = useState('');
  const [userCards, setUserCards] = useState<UserCard[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    let mounted = true;
    loadSelfReadingStore()
      .then(store => {
        if (mounted) setUserCards(store.userCards);
      })
      .catch(() => {
        if (mounted) setMessage(t('sr.create.saveFailed'));
      });
    return () => {
      mounted = false;
    };
  }, [t]);

  const handleSave = async () => {
    const trimmedName = name.trim();
    const trimmedMeaning = meaning.trim();
    if (!trimmedName || !trimmedMeaning) {
      setMessage(t('sr.create.emptyError'));
      return;
    }

    setIsSaving(true);
    setMessage('');
    try {
      const store = await saveUserCard({
        id: createUserCardId(),
        name: trimmedName,
        meaning: trimmedMeaning,
        createdAt: Date.now(),
      });
      setUserCards(store.userCards);
      setName('');
      setMeaning('');
      setMessage(t('sr.create.saved'));
    } catch {
      setMessage(t('sr.create.saveFailed'));
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (cardId: string) => {
    try {
      const store = await deleteUserCard(cardId);
      setUserCards(store.userCards);
    } catch {
      setMessage(t('sr.create.saveFailed'));
    }
  };

  return (
    <section aria-labelledby="self-reading-create-title" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <button
        type="button"
        aria-label={t('a11y.sr.createBack')}
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
        {t('sr.draw.reset')}
      </button>

      <div style={{ borderRadius: 28, border: '1px solid rgba(210,219,236,0.42)', background: 'rgba(255,255,255,0.82)', boxShadow: 'var(--om-shadow-card)', padding: '22px 18px', display: 'flex', flexDirection: 'column', gap: 14 }}>
        <div>
          <h2 id="self-reading-create-title" style={{ margin: 0, color: '#263044', fontSize: 18, letterSpacing: '0.14em', fontWeight: 600 }}>{t('sr.create.title')}</h2>
          <p style={{ margin: '10px 0 0', color: '#7f8998', fontSize: 12, lineHeight: 1.8, letterSpacing: '0.04em' }}>{t('sr.create.localOnlyNote')}</p>
          <p style={{ margin: '6px 0 0', color: '#d77894', fontSize: 12, lineHeight: 1.8, letterSpacing: '0.04em' }}>{t('sr.create.notInDeckYet')}</p>
        </div>

        <label style={{ display: 'flex', flexDirection: 'column', gap: 8, color: '#64748b', fontSize: 12, letterSpacing: '0.08em', fontWeight: 700 }}>
          {t('sr.create.nameLabel')}
          <input
            value={name}
            onChange={event => setName(event.target.value)}
            placeholder={t('sr.create.namePlaceholder')}
            style={{ minHeight: 46, border: '1px solid rgba(210,219,236,0.48)', borderRadius: 18, background: 'rgba(255,255,255,0.74)', padding: '0 14px', color: '#263044', outline: 'none' }}
          />
        </label>

        <label style={{ display: 'flex', flexDirection: 'column', gap: 8, color: '#64748b', fontSize: 12, letterSpacing: '0.08em', fontWeight: 700 }}>
          {t('sr.create.meaningLabel')}
          <textarea
            value={meaning}
            onChange={event => setMeaning(event.target.value)}
            placeholder={t('sr.create.meaningPlaceholder')}
            rows={5}
            style={{ width: '100%', resize: 'vertical', border: '1px solid rgba(210,219,236,0.48)', borderRadius: 20, background: 'rgba(255,255,255,0.74)', padding: '14px', color: '#263044', lineHeight: 1.8, letterSpacing: '0.04em', outline: 'none' }}
          />
        </label>

        <button
          type="button"
          disabled={isSaving}
          onClick={handleSave}
          style={{ minHeight: 48, borderRadius: 18, border: 'none', background: isSaving ? 'rgba(38,48,68,0.44)' : 'linear-gradient(135deg, #263044, #465a8a)', color: 'rgba(255,255,255,0.92)', fontSize: 12, fontWeight: 700, letterSpacing: '0.14em', cursor: isSaving ? 'wait' : 'pointer', boxShadow: isSaving ? 'none' : '0 14px 28px rgba(38,48,68,0.16)' }}
        >
          {t('sr.create.save')}
        </button>
        {message && <p style={{ margin: 0, color: '#7f8998', fontSize: 12, lineHeight: 1.8, letterSpacing: '0.04em' }}>{message}</p>}
      </div>

      <div style={{ borderRadius: 24, border: '1px solid rgba(210,219,236,0.42)', background: 'rgba(255,250,252,0.76)', boxShadow: 'var(--om-shadow-soft)', padding: 16 }}>
        <h3 style={{ margin: 0, color: '#263044', fontSize: 14, letterSpacing: '0.12em', fontWeight: 700 }}>{t('sr.create.savedCards')}</h3>
        {userCards.length === 0 ? (
          <p style={{ margin: '12px 0 0', color: '#8b95a5', fontSize: 12, lineHeight: 1.8, letterSpacing: '0.04em' }}>{t('sr.create.noCards')}</p>
        ) : (
          <div style={{ marginTop: 12, display: 'grid', gap: 10 }}>
            {userCards.map(card => (
              <article key={card.id} style={{ borderRadius: 18, border: '1px solid rgba(210,219,236,0.38)', background: 'rgba(255,255,255,0.72)', padding: 14, display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) auto', gap: 10, alignItems: 'start' }}>
                <div>
                  <h4 style={{ margin: 0, color: '#263044', fontSize: 14, lineHeight: 1.5, letterSpacing: '0.08em', fontWeight: 700 }}>{card.name}</h4>
                  <p style={{ margin: '6px 0 0', color: '#64748b', fontSize: 12, lineHeight: 1.8, letterSpacing: '0.04em' }}>{card.meaning}</p>
                </div>
                <button type="button" aria-label={t('a11y.sr.createDelete')} onClick={() => handleDelete(card.id)} style={{ width: 38, height: 38, borderRadius: 14, border: '1px solid rgba(210,219,236,0.44)', background: 'rgba(255,255,255,0.82)', color: '#d77894', cursor: 'pointer', display: 'grid', placeItems: 'center' }}>
                  <Trash2 size={15} strokeWidth={1.7} />
                </button>
              </article>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
