import React, { useEffect } from 'react';
import { X } from 'lucide-react';
import { MODES } from '../constants/modes';
import { PERSONAS } from '../constants/personas';
import { Browser } from '../lib/capacitorMocks';
import { LOCALES, useLocale } from '../i18n';
import type { Mode } from '../types';

interface HelpModalProps {
  onClose: () => void;
}

export function HelpModal({ onClose }: HelpModalProps) {
  const { locale, setLocale, t } = useLocale();

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handleEsc);
    return () => document.removeEventListener('keydown', handleEsc);
  }, [onClose]);

  const openLink = (url: string) => {
    Browser.open({ url }).catch(() => window.open(url, '_blank', 'noopener,noreferrer'));
  };

  return (
    <div role="dialog" aria-modal="true" aria-labelledby="helpTitle" style={{
      position: 'fixed', inset: 0, zIndex: 400,
      background: 'rgba(255,255,255,0.75)', backdropFilter: 'blur(8px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '16px', paddingTop: 'calc(16px + var(--sat))', paddingBottom: 'calc(16px + var(--sab))',
      animation: 'fadeIn 0.2s ease'
    }} onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={{
        background: '#fff', maxWidth: 420, width: '100%', maxHeight: '100%',
        borderRadius: 28, boxShadow: '0 32px 80px rgba(0,0,0,0.12)',
        border: '1px solid #f1f5f9', overflowY: 'auto', padding: 28
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, paddingBottom: 14, borderBottom: '1px solid #f8fafc' }}>
          <h2 id="helpTitle" style={{ fontSize: 11, letterSpacing: '0.4em', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', margin: 0 }}>Mirror Guide</h2>
          <button aria-label={t('a11y.close')} onClick={onClose} style={{ minWidth: 44, minHeight: 44, background: 'none', border: 'none', cursor: 'pointer', color: '#cbd5e1', display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}><X size={18}/></button>
        </div>
        <section style={{ marginBottom: 24 }}>
          <div style={{ fontSize: 10, letterSpacing: '0.35em', fontWeight: 800, color: '#cbd5e1', textTransform: 'uppercase', marginBottom: 14 }}>{t('help.channelsTitle')}</div>
          {Object.values(MODES).map((m: Mode) => (
            <div key={m.id} style={{ marginBottom: 12, paddingLeft: 12, borderLeft: '2px solid #f1f5f9' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, fontWeight: 700, color: '#334155', marginBottom: 3 }}>{m.icon} {t(`mode.${m.id}.name`)}</div>
              <p style={{ fontSize: 12, color: '#64748b', lineHeight: 1.7 }}>{t(`mode.${m.id}.guidance`)}</p>
            </div>
          ))}
        </section>
        <section style={{ marginBottom: 24 }}>
          <div style={{ fontSize: 10, letterSpacing: '0.35em', fontWeight: 800, color: '#cbd5e1', textTransform: 'uppercase', marginBottom: 14 }}>{t('help.oraclesTitle')}</div>
          {Object.values(PERSONAS).map(px => (
            <div key={px.id} style={{ marginBottom: 12, paddingLeft: 12, borderLeft: `2px solid ${px.accent}40` }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, fontWeight: 700, color: px.accent, marginBottom: 3 }}>{px.icon} {px.name} <span style={{ color: '#94a3b8', fontWeight: 400 }}>— {t(`persona.${px.id}.title`)}</span></div>
              <p style={{ fontSize: 12, color: '#64748b', lineHeight: 1.7 }}>{t(`persona.${px.id}.guidance`)}</p>
            </div>
          ))}
        </section>
        <div style={{ marginTop: 24, padding: 16, background: '#f8fafc', borderRadius: 12, fontSize: 11, color: '#64748b', lineHeight: 1.6 }}>
          <strong>{t('help.disclaimerTitle')}</strong><br/>
          {t('help.disclaimerBody')}<br/><br/>
          {t('help.disclaimerNote')}
        </div>

        {/* 言語切替 */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginTop: 24 }}>
          <span style={{ fontSize: 10, letterSpacing: '0.2em', color: '#cbd5e1', textTransform: 'uppercase', fontWeight: 700 }}>{t('help.language')}</span>
          {LOCALES.map(loc => (
            <button key={loc} onClick={() => setLocale(loc)} aria-pressed={locale === loc} style={{
              padding: '6px 14px', borderRadius: 999, minHeight: 36, cursor: 'pointer', fontSize: 11, fontWeight: 700,
              border: 'none', transition: 'all 0.2s',
              background: locale === loc ? '#0f172a' : '#f1f5f9',
              color: locale === loc ? '#fff' : '#94a3b8'
            }}>{t(`language.${loc}`)}</button>
          ))}
        </div>

        {/* App Store審査必須要件：プライバシーポリシーと利用規約への安全なリンク */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: 20, marginTop: 24 }}>
          {/* 【本番環境】実際のURLに差し替えてください */}
          <button onClick={() => openLink('https://your-website.com/terms')} style={{ background: 'none', border: 'none', padding: 0, fontSize: 11, color: '#94a3b8', textDecoration: 'underline', cursor: 'pointer' }}>{t('help.terms')}</button>
          <button onClick={() => openLink('https://your-website.com/privacy')} style={{ background: 'none', border: 'none', padding: 0, fontSize: 11, color: '#94a3b8', textDecoration: 'underline', cursor: 'pointer' }}>{t('help.privacy')}</button>
        </div>

        <button onClick={onClose} style={{
          width: '100%', padding: '14px 0', background: '#0f172a', color: '#fff', minHeight: 48,
          borderRadius: 999, fontSize: 11, letterSpacing: '0.25em', textTransform: 'uppercase',
          fontWeight: 700, cursor: 'pointer', border: 'none', marginTop: 24
        }}>{t('help.back')}</button>
      </div>
    </div>
  );
}
