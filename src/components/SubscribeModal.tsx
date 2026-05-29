import React, { useState, useEffect } from 'react';
import { Loader2, Lock, Unlock, RefreshCw } from 'lucide-react';
import { Purchases } from '../lib/capacitorMocks';
import { FREE_LIMIT } from '../lib/constants';
import { LegalLinks } from './LegalLinks';
import { useT } from '../i18n';

interface SubscribeModalProps {
  onClose: () => void;
  onSubscribe: () => Promise<void>;
  onRestore: () => Promise<void>;
  isPurchasing: boolean;
}

export function SubscribeModal({ onClose, onSubscribe, onRestore, isPurchasing }: SubscribeModalProps) {
  const t = useT();
  const [price, setPrice] = useState(() => t('subscribe.priceLoading'));

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handleEsc);
    return () => document.removeEventListener('keydown', handleEsc);
  }, [onClose]);

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
    <div role="dialog" aria-modal="true" aria-labelledby="subscribeTitle" style={{
      position: 'fixed', inset: 0, zIndex: 1000,
      background: 'rgba(15, 23, 42, 0.92)', backdropFilter: 'blur(8px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px',
      paddingTop: 'calc(16px + var(--sat))', paddingBottom: 'calc(16px + var(--sab))',
      animation: 'fadeIn 0.3s ease'
    }} onClick={e => {
      if (e.target === e.currentTarget && !isPurchasing) onClose();
    }}>
      <div style={{ background: '#fff', padding: 32, borderRadius: 28, maxWidth: 420, width: '100%', maxHeight: '100%', overflowY: 'auto', boxShadow: '0 32px 80px rgba(0,0,0,0.4)', textAlign: 'center', animation: 'modalReveal 0.4s cubic-bezier(0.16,1,0.3,1)' }}>
        <div style={{ display: 'inline-flex', padding: 16, background: '#f8fafc', borderRadius: '50%', marginBottom: 20 }}>
          <Lock size={32} color="#64748b" />
        </div>
        <h2 id="subscribeTitle" style={{ fontSize: 18, color: '#0f172a', margin: '0 0 12px 0', letterSpacing: '0.1em' }}>
          {t('subscribe.title').split('\n').map((line, i, arr) => (
            <React.Fragment key={i}>{line}{i < arr.length - 1 && <br/>}</React.Fragment>
          ))}
        </h2>
        <p style={{ fontSize: 13, color: '#64748b', lineHeight: 1.8, marginBottom: 24 }}>
          {t('subscribe.body', { limit: FREE_LIMIT }).split('\n').map((line, i, arr) => (
            <React.Fragment key={i}>{line}{i < arr.length - 1 && <br/>}</React.Fragment>
          ))}
        </p>

        {/* App Store審査対応: 価格表示 */}
        <div style={{ fontSize: 14, fontWeight: 700, color: '#334155', marginBottom: 8 }}>
          {t('subscribe.monthly', { price })}
        </div>
        <div style={{ fontSize: 10, color: '#94a3b8', marginBottom: 16 }}>{t('subscribe.autoRenew')}</div>

        <button onClick={onSubscribe} disabled={isPurchasing} style={{
          width: '100%', padding: '16px 0', background: 'linear-gradient(135deg, #0f172a 0%, #334155 100%)', color: '#fff',
          borderRadius: 999, fontSize: 12, letterSpacing: '0.15em', minHeight: 48,
          fontWeight: 700, cursor: isPurchasing ? 'not-allowed' : 'pointer', border: 'none', 
          boxShadow: isPurchasing ? 'none' : '0 8px 24px rgba(15,23,42,0.25)', opacity: isPurchasing ? 0.7 : 1,
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginBottom: 12, transition: 'opacity 0.2s'
        }}>
          {isPurchasing ? <Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} /> : <Unlock size={14} />}
          {isPurchasing ? t('subscribe.processing') : t('subscribe.cta')}
        </button>
        <button onClick={onClose} disabled={isPurchasing} style={{
          width: '100%', padding: '12px 0', background: 'transparent', color: '#94a3b8',
          borderRadius: 999, fontSize: 12, letterSpacing: '0.1em', minHeight: 44,
          fontWeight: 400, cursor: isPurchasing ? 'not-allowed' : 'pointer', border: 'none'
        }}>{t('subscribe.later')}</button>
        
        {/* App Store審査必須要件：リストア（復元）ボタン */}
        <div style={{ marginTop: 24, paddingTop: 16, borderTop: '1px solid #f1f5f9' }}>
          <button onClick={onRestore} disabled={isPurchasing} style={{
            background: 'none', border: 'none', color: '#64748b', fontSize: 11, 
            cursor: isPurchasing ? 'not-allowed' : 'pointer',
            display: 'inline-flex', alignItems: 'center', gap: 6, padding: '8px 16px', borderRadius: 999
          }}>
            {isPurchasing ? <Loader2 size={12} style={{ animation: 'spin 1s linear infinite' }} /> : <RefreshCw size={12} />}
            {t('subscribe.restore')}
          </button>

          <LegalLinks style={{ marginTop: 12 }} />
          <p style={{ fontSize: 10, color: '#94a3b8', lineHeight: 1.6, marginTop: 12 }}>
            {t('subscribe.subscriptionNote')}
          </p>
        </div>
      </div>
    </div>
  );
}
