import React, { useState, useEffect } from 'react';
import { Loader2, Lock, Unlock, RefreshCw } from 'lucide-react';
import { Purchases } from '../lib/capacitorMocks';
import { FREE_LIMIT } from '../lib/constants';
import { APP_STORE_MANAGE_SUBSCRIPTIONS_URL } from '../lib/premium';
import { openExternalUrl } from '../lib/openExternal';
import { LegalLinks } from './LegalLinks';
import { useT } from '../i18n';
import { useDialogChrome } from '../lib/useDialogChrome';

interface SubscribeModalProps {
  onClose: () => void;
  onSubscribe: () => Promise<void>;
  onRestore: () => Promise<void>;
  isPurchasing: boolean;
}

export function SubscribeModal({ onClose, onSubscribe, onRestore, isPurchasing }: SubscribeModalProps) {
  const t = useT();
  const [price, setPrice] = useState(() => t('subscribe.priceLoading'));
  const dialogRef = useDialogChrome(onClose, !isPurchasing);

  useEffect(() => {
    let mounted = true;
    Purchases.getOfferings()
      .then(offerings => {
        if (mounted && offerings?.current?.monthly?.product?.priceString) {
          setPrice(offerings.current.monthly.product.priceString);
        } else if (mounted) {
          setPrice(t('subscribe.priceUnknown'));
        }
      })
      .catch(() => { if (mounted) setPrice(t('subscribe.priceError')); });
    return () => { mounted = false; };
  }, [t]);

  return (
    <div
      ref={dialogRef}
      className="om-modal-overlay"
      role="dialog"
      aria-modal="true"
      aria-labelledby="subscribeTitle"
      tabIndex={-1}
      style={{
        zIndex: 1000,
        background: 'rgba(28, 24, 36, 0.46)',
        backdropFilter: 'blur(14px)',
        WebkitBackdropFilter: 'blur(14px)',
        outline: 'none',
      }}
      onClick={e => {
        if (e.target === e.currentTarget && !isPurchasing) onClose();
      }}
    >
      <div className="om-modal-card om-modal-card--sheet" style={{ maxWidth: 420, textAlign: 'center' }}>
        <div className="om-modal-body" style={{ padding: '32px 28px 8px' }}>
        <div style={{
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
          width: 84, height: 84, marginBottom: 20, borderRadius: '50%',
          background: 'radial-gradient(circle at 32% 26%, rgba(255,255,255,0.96), rgba(255,243,248,0.72) 42%, rgba(233,242,255,0.50) 100%)',
          border: '0.5px solid rgba(255,255,255,0.72)',
          boxShadow: 'var(--om-glow-rose), inset 0 1px 0 rgba(255,255,255,0.94), inset 0 -14px 22px rgba(217,111,140,0.14)',
        }}>
          <Lock size={28} color="rgba(39,59,106,0.82)" strokeWidth={1.4} />
        </div>
        <h2 id="subscribeTitle" style={{ fontSize: 18, color: '#20304b', margin: '0 0 12px 0', letterSpacing: '0.1em', fontWeight: 500 }}>
          {t('subscribe.title').split('\n').map((line, i, arr) => (
            <React.Fragment key={i}>{line}{i < arr.length - 1 && <br/>}</React.Fragment>
          ))}
        </h2>
        <p style={{ fontSize: 13, color: '#64748b', lineHeight: 1.8, marginBottom: 24 }}>
          {t('subscribe.body', { limit: FREE_LIMIT }).split('\n').map((line, i, arr) => (
            <React.Fragment key={i}>{line}{i < arr.length - 1 && <br/>}</React.Fragment>
          ))}
        </p>

        <div style={{ fontSize: 14, fontWeight: 700, color: '#334155', marginBottom: 8 }}>
          {t('subscribe.monthly', { price })}
        </div>
        <div style={{ fontSize: 10, color: '#94a3b8', marginBottom: 16 }}>{t('subscribe.autoRenew')}</div>

        <div style={{ paddingTop: 8, borderTop: '1px solid rgba(220,210,216,0.28)' }}>
          <button type="button" className="om-glass-btn" onClick={onRestore} disabled={isPurchasing} style={{
            background: 'none', border: 'none', color: '#64748b', fontSize: 11,
            display: 'inline-flex', alignItems: 'center', gap: 6, padding: '8px 16px', borderRadius: 999, minHeight: 44,
          }}>
            {isPurchasing ? <Loader2 size={12} style={{ animation: 'spin 1s linear infinite' }} /> : <RefreshCw size={12} />}
            {t('subscribe.restore')}
          </button>

          <LegalLinks style={{ marginTop: 12 }} />
          <button
            type="button"
            onClick={() => openExternalUrl(APP_STORE_MANAGE_SUBSCRIPTIONS_URL)}
            style={{
              background: 'none', border: 'none', padding: '8px 12px', marginTop: 4, minHeight: 44,
              fontSize: 11, color: '#94a3b8', textDecoration: 'underline', cursor: 'pointer',
            }}
          >
            {t('subscribe.manage')}
          </button>
          <p style={{ fontSize: 10, color: '#94a3b8', lineHeight: 1.6, marginTop: 12, paddingBottom: 8 }}>
            {t('subscribe.subscriptionNote')}
          </p>
        </div>
        </div>
        <div className="om-modal-footer">
          <button type="button" className="om-cta" onClick={onSubscribe} disabled={isPurchasing} style={{
            width: '100%', padding: '16px 0',
            borderRadius: 999, fontSize: 12, letterSpacing: '0.15em', minHeight: 48,
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginBottom: 8,
          }}>
            {isPurchasing ? <Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} /> : <Unlock size={14} />}
            {isPurchasing ? t('subscribe.processing') : t('subscribe.cta')}
          </button>
          <button type="button" className="om-glass-btn" onClick={onClose} disabled={isPurchasing} style={{
            width: '100%', padding: '12px 0',
            borderRadius: 999, fontSize: 12, letterSpacing: '0.1em', minHeight: 44,
            fontWeight: 400, background: 'transparent', border: 'none',
          }}>{t('subscribe.later')}</button>
        </div>
      </div>
    </div>
  );
}
