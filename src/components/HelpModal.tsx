import React, { useEffect } from 'react';
import { X, RefreshCw } from 'lucide-react';
import { MODES } from '../constants/modes';
import { PERSONAS } from '../constants/personas';
import { APP_STORE_MANAGE_SUBSCRIPTIONS_URL } from '../lib/premium';
import { openExternalUrl } from '../lib/openExternal';
import { LegalLinks } from './LegalLinks';
import { LanguageToggle } from './LanguageToggle';
import { useLocale } from '../i18n';
import type { Mode } from '../types';

interface HelpModalProps {
  onClose: () => void;
  onDeleteAllHistory: () => void;
  onRestore: () => Promise<void>;
  isPurchasing: boolean;
}

export function HelpModal({ onClose, onDeleteAllHistory, onRestore, isPurchasing }: HelpModalProps) {
  const { t } = useLocale();

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handleEsc);
    return () => document.removeEventListener('keydown', handleEsc);
  }, [onClose]);

  return (
    <div
      className="om-modal-overlay"
      role="dialog"
      aria-modal="true"
      aria-labelledby="helpTitle"
      style={{
        zIndex: 400,
        background: 'rgba(255,252,253,0.62)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
      }}
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <div className="om-modal-card" style={{ maxWidth: 420, padding: 28 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, paddingBottom: 14, borderBottom: '1px solid rgba(220,210,216,0.28)' }}>
          <h2 id="helpTitle" style={{ fontSize: 11, letterSpacing: '0.4em', fontWeight: 800, color: '#8994a6', textTransform: 'uppercase', margin: 0 }}>{t('help.title')}</h2>
          <button className="om-icon-btn" aria-label={t('a11y.close')} onClick={onClose} style={{ color: '#9ca6b4' }}><X size={18}/></button>
        </div>
        <section style={{ marginBottom: 24 }}>
          <div style={{ fontSize: 10, letterSpacing: '0.35em', fontWeight: 800, color: '#aab2bf', textTransform: 'uppercase', marginBottom: 14 }}>{t('help.channelsTitle')}</div>
          {Object.values(MODES).map((m: Mode) => (
            <div key={m.id} style={{ marginBottom: 12, paddingLeft: 12, borderLeft: '2px solid rgba(220,210,216,0.40)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, fontWeight: 700, color: '#334155', marginBottom: 3 }}>{m.icon} {t(`mode.${m.id}.name`)}</div>
              <p style={{ fontSize: 12, color: '#64748b', lineHeight: 1.7 }}>{t(`mode.${m.id}.guidance`)}</p>
            </div>
          ))}
        </section>
        <section style={{ marginBottom: 24 }}>
          <div style={{ fontSize: 10, letterSpacing: '0.35em', fontWeight: 800, color: '#aab2bf', textTransform: 'uppercase', marginBottom: 14 }}>{t('help.oraclesTitle')}</div>
          {Object.values(PERSONAS).map(px => (
            <div key={px.id} style={{ marginBottom: 12, paddingLeft: 12, borderLeft: `2px solid ${px.accent}40` }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, fontWeight: 700, color: px.accent, marginBottom: 3 }}>{px.icon} {px.name} <span style={{ color: '#94a3b8', fontWeight: 400 }}>— {t(`persona.${px.id}.title`)}</span></div>
              <p style={{ fontSize: 12, color: '#64748b', lineHeight: 1.7 }}>{t(`persona.${px.id}.guidance`)}</p>
            </div>
          ))}
        </section>
        <div style={{ marginTop: 24, padding: 16, background: 'rgba(255,250,252,0.72)', borderRadius: 16, border: '1px solid rgba(220,210,216,0.32)', fontSize: 11, color: '#64748b', lineHeight: 1.6 }}>
          <strong>{t('help.disclaimerTitle')}</strong><br/>
          {t('help.disclaimerBody')}<br/><br/>
          {t('help.disclaimerNote')}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10, marginTop: 24 }}>
          <span style={{ fontSize: 10, letterSpacing: '0.2em', color: '#aab2bf', textTransform: 'uppercase', fontWeight: 700 }}>{t('help.language')}</span>
          <LanguageToggle />
        </div>

        <LegalLinks style={{ marginTop: 24 }} />

        <div style={{ marginTop: 16, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
          <button
            type="button"
            onClick={() => { void onRestore(); }}
            disabled={isPurchasing}
            className="om-glass-btn"
            style={{
              background: 'none', border: 'none', color: '#64748b', fontSize: 11,
              cursor: isPurchasing ? 'not-allowed' : 'pointer',
              display: 'inline-flex', alignItems: 'center', gap: 6, padding: '8px 16px',
              minHeight: 44, borderRadius: 999,
            }}
          >
            <RefreshCw size={12} />
            {t('subscribe.restore')}
          </button>
          <button
            type="button"
            onClick={() => openExternalUrl(APP_STORE_MANAGE_SUBSCRIPTIONS_URL)}
            style={{
              background: 'none', border: 'none', padding: '8px 12px', minHeight: 44,
              fontSize: 11, color: '#94a3b8', textDecoration: 'underline', cursor: 'pointer',
            }}
          >
            {t('subscribe.manage')}
          </button>
        </div>

        <div style={{ marginTop: 24, paddingTop: 16, borderTop: '1px solid rgba(220,210,216,0.28)', textAlign: 'center' }}>
          <button onClick={() => {
            if (window.confirm(t('help.deleteAllHistoryConfirm'))) {
              onDeleteAllHistory();
              onClose();
            }
          }} style={{
            background: 'none', border: '1px solid rgba(254,226,226,0.90)', color: '#ef4444',
            borderRadius: 999, padding: '8px 20px', minHeight: 44, fontSize: 11, cursor: 'pointer', letterSpacing: '0.05em'
          }}>
            {t('help.deleteAllHistory')}
          </button>
        </div>

        <button className="om-cta" onClick={onClose} style={{
          width: '100%', padding: '14px 0', minHeight: 48,
          borderRadius: 999, fontSize: 11, letterSpacing: '0.25em', textTransform: 'uppercase',
          marginTop: 24
        }}>{t('help.back')}</button>
      </div>
    </div>
  );
}
