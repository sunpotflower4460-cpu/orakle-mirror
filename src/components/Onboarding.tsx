import React, { useEffect, useState } from 'react';
import { Compass, ArrowRight, ArrowLeft } from 'lucide-react';
import { PERSONAS } from '../constants/personas';
import { MODES } from '../constants/modes';
import { LOCALES, useLocale } from '../i18n';
import type { Mode, PersonaId } from '../types';

interface OnboardingProps {
  // 選択したペルソナを渡して完了(スキップ時は undefined)。
  onComplete: (selectedPersona?: PersonaId) => void;
}

const TOTAL_STEPS = 4;

// 改行入りの文言を <br/> 区切りで描画する。
function MultiLine({ text }: { text: string }) {
  const lines = text.split('\n');
  return (
    <>
      {lines.map((line, i) => (
        <React.Fragment key={i}>
          {line}
          {i < lines.length - 1 && <br />}
        </React.Fragment>
      ))}
    </>
  );
}

export function Onboarding({ onComplete }: OnboardingProps) {
  const { locale, setLocale, t } = useLocale();
  const [step, setStep] = useState(0);
  const [selectedPersona, setSelectedPersona] = useState<PersonaId>('lumina');

  const accent = PERSONAS[selectedPersona].accent;
  const isLast = step === TOTAL_STEPS - 1;

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => { if (e.key === 'Escape') onComplete(); };
    document.addEventListener('keydown', handleEsc);
    return () => document.removeEventListener('keydown', handleEsc);
  }, [onComplete]);

  const next = () => setStep(s => Math.min(s + 1, TOTAL_STEPS - 1));
  const back = () => setStep(s => Math.max(s - 1, 0));

  const titleId = 'onboardingTitle';
  const bodyStyle: React.CSSProperties = { fontSize: 13, color: '#64748b', lineHeight: 1.9, marginTop: 12 };
  const headingStyle: React.CSSProperties = { fontSize: 18, fontWeight: 400, color: '#334155', letterSpacing: '0.06em', margin: 0 };

  return (
    <div role="dialog" aria-modal="true" aria-labelledby={titleId} style={{
      position: 'fixed', inset: 0, zIndex: 1100,
      background: `radial-gradient(circle at 50% 0%, ${PERSONAS[selectedPersona].soft} 0%, rgba(255,255,255,0.96) 60%)`,
      backdropFilter: 'blur(8px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '16px', paddingTop: 'calc(16px + var(--sat))', paddingBottom: 'calc(16px + var(--sab))',
      animation: 'fadeIn 0.3s ease'
    }}>
      <div style={{
        background: '#fff', maxWidth: 440, width: '100%', maxHeight: '100%',
        borderRadius: 28, boxShadow: '0 32px 80px rgba(0,0,0,0.12)', border: '1px solid #f1f5f9',
        overflowY: 'auto', padding: 28, display: 'flex', flexDirection: 'column',
        animation: 'modalReveal 0.45s cubic-bezier(0.16,1,0.3,1)'
      }}>
        {/* 言語切替(タイトルの時点で日本語／英語を選べる) */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 8 }}>
          <div role="group" aria-label={t('help.language')} style={{ display: 'flex', gap: 4, background: '#f8fafc', borderRadius: 999, padding: 3 }}>
            {LOCALES.map(loc => (
              <button key={loc} onClick={() => setLocale(loc)} aria-pressed={locale === loc} style={{
                padding: '6px 12px', minHeight: 36, borderRadius: 999, border: 'none', cursor: 'pointer',
                fontSize: 11, fontWeight: 700, transition: 'all 0.2s',
                background: locale === loc ? '#0f172a' : 'transparent',
                color: locale === loc ? '#fff' : '#94a3b8'
              }}>{t(`language.${loc}`)}</button>
            ))}
          </div>
        </div>

        {/* Step content(切替時に、鏡に像が結ぶように現れる) */}
        <div key={step} style={{ flex: 1, animation: 'stepReveal 0.5s cubic-bezier(0.16,1,0.3,1)', minHeight: 280, display: 'flex', flexDirection: 'column' }}>
          {step === 0 && (
            <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flex: 1, gap: 8 }}>
              <div style={{ position: 'relative', marginBottom: 12 }}>
                <div style={{ position: 'absolute', inset: -16, background: `radial-gradient(circle, ${accent}22 0%, transparent 70%)`, animation: 'pulse 3s ease-in-out infinite', borderRadius: '50%' }} />
                <Compass size={52} strokeWidth={0.6} style={{ color: '#cbd5e1', animation: 'spinSlow 80s linear infinite', position: 'relative' }} />
              </div>
              <div style={{ fontSize: 10, letterSpacing: '0.45em', color: '#cbd5e1', textTransform: 'uppercase', fontWeight: 700 }}>Oracle Mirror</div>
              <h2 id={titleId} style={headingStyle}>{t('onboarding.concept.title')}</h2>
              <p style={bodyStyle}><MultiLine text={t('onboarding.concept.body')} /></p>
            </div>
          )}

          {step === 1 && (
            <div>
              <h2 id={titleId} style={headingStyle}>{t('onboarding.persona.title')}</h2>
              <p style={bodyStyle}><MultiLine text={t('onboarding.persona.body')} /></p>
              <div style={{ display: 'flex', gap: 10, marginTop: 20 }}>
                {Object.values(PERSONAS).map(px => {
                  const active = selectedPersona === px.id;
                  return (
                    <button key={px.id} onClick={() => setSelectedPersona(px.id)} aria-pressed={active} aria-label={t('a11y.selectPersona', { name: px.name })}
                      style={{
                        flex: '1 1 0', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6,
                        padding: '16px 8px', borderRadius: 18, cursor: 'pointer', border: 'none',
                        background: active ? '#fff' : 'rgba(255,255,255,0.5)',
                        boxShadow: active ? `0 4px 20px ${px.accent}20,0 0 0 1px ${px.border}` : 'inset 0 0 0 1px rgba(0,0,0,0.04)',
                        transition: 'all 0.3s'
                      }}>
                      <span style={{ color: px.accent }}>{px.icon}</span>
                      <span style={{ fontSize: 10, letterSpacing: '0.15em', textTransform: 'uppercase', fontWeight: 700, color: px.accent, whiteSpace: 'nowrap' }}>{px.name}</span>
                      <span style={{ fontSize: 9, color: '#94a3b8', whiteSpace: 'nowrap' }}>{t(`persona.${px.id}.title`)}</span>
                    </button>
                  );
                })}
              </div>
              <p style={{ fontSize: 12, color: '#64748b', lineHeight: 1.8, marginTop: 18, paddingLeft: 12, borderLeft: `2px solid ${accent}40` }}>
                {t(`persona.${selectedPersona}.guidance`)}
              </p>
            </div>
          )}

          {step === 2 && (
            <div>
              <h2 id={titleId} style={headingStyle}>{t('onboarding.mode.title')}</h2>
              <p style={bodyStyle}><MultiLine text={t('onboarding.mode.body')} /></p>
              <div style={{ marginTop: 18 }}>
                {Object.values(MODES).map((m: Mode) => (
                  <div key={m.id} style={{ marginBottom: 14, paddingLeft: 12, borderLeft: '2px solid #f1f5f9' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 700, color: '#334155', marginBottom: 4 }}>{m.icon} {t(`mode.${m.id}.name`)}</div>
                    <p style={{ fontSize: 12, color: '#64748b', lineHeight: 1.7 }}>{t(`mode.${m.id}.guidance`)}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {step === 3 && (
            <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flex: 1, gap: 8 }}>
              <div style={{ position: 'relative', marginBottom: 12 }}>
                <div style={{ position: 'absolute', inset: -16, background: `radial-gradient(circle, ${accent}33 0%, transparent 70%)`, animation: 'pulse 3s ease-in-out infinite', borderRadius: '50%' }} />
                <span style={{ position: 'relative', color: accent, display: 'flex' }}>{PERSONAS[selectedPersona].icon}</span>
              </div>
              <h2 id={titleId} style={headingStyle}>{t('onboarding.ready.title')}</h2>
              <p style={bodyStyle}><MultiLine text={t('onboarding.ready.body')} /></p>
            </div>
          )}
        </div>

        {/* Progress dots */}
        <div role="presentation" aria-label={t('onboarding.progress', { current: step + 1, total: TOTAL_STEPS })}
          style={{ display: 'flex', gap: 6, justifyContent: 'center', margin: '20px 0' }}>
          {Array.from({ length: TOTAL_STEPS }, (_, i) => (
            <span key={i} style={{
              width: i === step ? 18 : 6, height: 6, borderRadius: 999,
              background: i === step ? accent : '#e2e8f0', transition: 'all 0.3s'
            }} />
          ))}
        </div>

        {/* Navigation */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {step > 0 ? (
            <button onClick={back} aria-label={t('onboarding.back')} style={{
              minWidth: 44, minHeight: 48, padding: '0 16px', background: 'transparent', color: '#94a3b8',
              border: 'none', borderRadius: 999, cursor: 'pointer', fontSize: 12, fontWeight: 700,
              display: 'flex', alignItems: 'center', gap: 6
            }}><ArrowLeft size={14} /> {t('onboarding.back')}</button>
          ) : (
            <button onClick={() => onComplete()} style={{
              minHeight: 48, padding: '0 16px', background: 'transparent', color: '#cbd5e1',
              border: 'none', borderRadius: 999, cursor: 'pointer', fontSize: 11, fontWeight: 700, letterSpacing: '0.1em'
            }}>{t('onboarding.skip')}</button>
          )}

          <div style={{ flex: 1 }} />

          <button onClick={isLast ? () => onComplete(selectedPersona) : next} style={{
            minHeight: 48, padding: '0 26px', background: '#0f172a', color: '#fff',
            border: 'none', borderRadius: 999, cursor: 'pointer', fontSize: 11, fontWeight: 700,
            letterSpacing: '0.2em', textTransform: 'uppercase',
            display: 'flex', alignItems: 'center', gap: 8, boxShadow: '0 8px 24px rgba(15,23,42,0.2)'
          }}>
            {isLast ? t('onboarding.begin') : t('onboarding.next')}
            {!isLast && <ArrowRight size={14} />}
          </button>
        </div>
      </div>
    </div>
  );
}
