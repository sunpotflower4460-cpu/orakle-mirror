import React, { useEffect, useState } from 'react';
import { ArrowRight, ArrowLeft } from 'lucide-react';
import { PERSONAS } from '../constants/personas';
import { MODES } from '../constants/modes';
import { OracleOrb } from './OracleOrb';
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
  const bodyStyle: React.CSSProperties = { fontSize: 15, color: '#55627a', lineHeight: 1.85, marginTop: 12, letterSpacing: '0.035em' };
  const headingStyle: React.CSSProperties = { fontSize: 30, fontWeight: 400, color: '#202d48', letterSpacing: '0.13em', margin: 0, lineHeight: 1.5 };

  return (
    <div className="onboarding-overlay" role="dialog" aria-modal="true" aria-labelledby={titleId} style={{
      position: 'fixed', inset: 0, zIndex: 1100,
      background: `
        radial-gradient(circle at 15% 22%, rgba(255,255,255,0.70), transparent 30%),
        radial-gradient(circle at 78% 18%, rgba(209,226,255,0.18), transparent 36%),
        radial-gradient(circle at 50% 68%, rgba(245,201,214,0.28), transparent 42%),
        linear-gradient(180deg, #fffefd 0%, #fff9fb 45%, #f8f2f8 100%)
      `,
      backdropFilter: 'blur(4px)', WebkitBackdropFilter: 'blur(4px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '16px', paddingTop: 'calc(16px + var(--sat))', paddingBottom: 'calc(16px + var(--sab))',
      animation: 'fadeIn 0.3s ease'
    }}>
      <div className="onboarding-card" style={{
        background: 'linear-gradient(140deg, rgba(255,255,255,0.76), rgba(255,246,251,0.68), rgba(240,246,255,0.56))',
        maxWidth: 440, width: '100%', maxHeight: '100%',
        borderRadius: 38, boxShadow: 'var(--om-shadow-soft)', border: '1px solid rgba(214,224,245,0.38)',
        overflowY: 'auto', padding: 32, display: 'flex', flexDirection: 'column',
        animation: 'modalReveal 0.45s cubic-bezier(0.16,1,0.3,1)'
      }}>
        {/* 言語切替(タイトルの時点で日本語／英語を選べる) */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 12 }}>
          <div role="group" aria-label={t('help.language')} style={{
            display: 'flex', gap: 3,
            alignItems: 'center',
            background: 'rgba(255,255,255,0.52)', borderRadius: 16, padding: '6px 8px',
            border: '1px solid rgba(210,220,238,0.42)'
          }}>
            {LOCALES.map(loc => (
              <button key={loc} onClick={() => setLocale(loc)} aria-pressed={locale === loc} style={{
                padding: '6px 16px', borderRadius: 999, border: 'none', cursor: 'pointer',
                fontSize: 12, fontWeight: 600, transition: 'all 0.25s',
                background: locale === loc ? 'linear-gradient(130deg, rgba(250,214,228,0.92), rgba(232,240,255,0.86))' : 'transparent',
                color: locale === loc ? '#20304b' : '#7e8da7'
              }}>{t(`language.${loc}`)}</button>
            ))}
          </div>
        </div>

        {/* Step content(切替時に、鏡に像が結ぶように現れる) */}
        <div className="onboarding-step" key={step} style={{ flex: 1, animation: 'stepReveal 0.5s cubic-bezier(0.16,1,0.3,1)', minHeight: 280, display: 'flex', flexDirection: 'column' }}>
          {step === 0 && (
            <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flex: 1, gap: 0 }}>
              <div style={{ marginBottom: 12 }}>
                <OracleOrb size={116} variant="diamond" />
              </div>
              <div style={{ fontSize: 20, letterSpacing: '0.32em', color: '#2a3c63', textTransform: 'uppercase', fontWeight: 500, marginBottom: 10, fontFamily: "'Garamond', 'Times New Roman', serif" }}>ORACLE MIRROR</div>
              <h2 className="onboarding-heading" id={titleId} style={headingStyle}>{t('onboarding.concept.title')}</h2>
              <p className="onboarding-body" style={bodyStyle}><MultiLine text={t('onboarding.concept.body')} /></p>
            </div>
          )}

          {step === 1 && (
            <div>
              <h2 className="onboarding-heading" id={titleId} style={headingStyle}>{t('onboarding.persona.title')}</h2>
              <p className="onboarding-body" style={bodyStyle}><MultiLine text={t('onboarding.persona.body')} /></p>
              <div className="onboarding-persona-grid" style={{ display: 'flex', gap: 10, marginTop: 20 }}>
                {Object.values(PERSONAS).map(px => {
                  const active = selectedPersona === px.id;
                  return (
                    <button key={px.id} className="onboarding-persona-card" onClick={() => setSelectedPersona(px.id)} aria-pressed={active} aria-label={t('a11y.selectPersona', { name: px.name })}
                      style={{
                        flex: '1 1 0', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8,
                        padding: '20px 8px 18px', borderRadius: 22, cursor: 'pointer',
                        background: 'rgba(255,255,255,0.84)',
                        boxShadow: active
                          ? `var(--om-shadow-card), 0 0 34px ${px.accent}18`
                          : 'var(--om-shadow-card)',
                        border: active ? `1px solid ${px.border}` : '1px solid rgba(220,210,220,0.28)',
                        transition: 'all 0.3s'
                      }}>
                      <span style={{ color: px.accent }}>{px.icon}</span>
                      <span style={{ fontSize: 10, letterSpacing: '0.22em', textTransform: 'uppercase', fontWeight: 600, color: px.accent, whiteSpace: 'nowrap' }}>{px.name}</span>
                      <span style={{ fontSize: 10, color: '#7f8998', whiteSpace: 'nowrap', letterSpacing: '0.04em' }}>{t(`persona.${px.id}.title`)}</span>
                    </button>
                  );
                })}
              </div>
              <p className="onboarding-body" style={{ fontSize: 12, color: '#596579', lineHeight: 1.9, marginTop: 18, paddingLeft: 14, borderLeft: `2px solid ${accent}40` }}>
                {t(`persona.${selectedPersona}.guidance`)}
              </p>
            </div>
          )}

          {step === 2 && (
            <div>
              <h2 className="onboarding-heading" id={titleId} style={headingStyle}>{t('onboarding.mode.title')}</h2>
              <p className="onboarding-body" style={bodyStyle}><MultiLine text={t('onboarding.mode.body')} /></p>
              <div style={{ marginTop: 18 }}>
                {Object.values(MODES).map((m: Mode) => (
                  <div key={m.id} style={{ marginBottom: 14, paddingLeft: 12, borderLeft: '2px solid #f1f5f9' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 700, color: '#273044', marginBottom: 4 }}>{m.icon} {t(`mode.${m.id}.name`)}</div>
                    <p className="onboarding-body" style={{ fontSize: 12, color: '#5f6b7a', lineHeight: 1.7 }}>{t(`mode.${m.id}.guidance`)}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {step === 3 && (
            <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flex: 1, gap: 10 }}>
              <div style={{ position: 'relative', width: 96, height: 96, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
                <div style={{ position: 'absolute', inset: -24, background: `radial-gradient(circle, ${accent}22 0%, transparent 70%)`, animation: 'pulse 3s ease-in-out infinite', borderRadius: '50%' }} />
                <div style={{
                  width: 96, height: 96, borderRadius: '50%',
                  background: 'radial-gradient(circle, rgba(255,255,255,0.80), rgba(255,238,244,0.40))',
                  border: '1px solid rgba(200,212,224,0.42)',
                  boxShadow: `0 0 44px ${accent}28, inset 0 1px 0 rgba(255,255,255,0.84)`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative'
                }}>
                  <span style={{ position: 'relative', color: accent, display: 'flex' }}>{PERSONAS[selectedPersona].icon}</span>
                </div>
              </div>
              <h2 className="onboarding-heading" id={titleId} style={headingStyle}>{t('onboarding.ready.title')}</h2>
              <p className="onboarding-body" style={bodyStyle}><MultiLine text={t('onboarding.ready.body')} /></p>
              <p className="onboarding-body" style={{ fontSize: 11, color: '#aab2bf', lineHeight: 1.7, marginTop: 16, padding: '0 8px' }}>
                {t('onboarding.disclaimer')}
              </p>
            </div>
          )}
        </div>

        {/* Progress dots */}
        <div role="presentation" aria-label={t('onboarding.progress', { current: step + 1, total: TOTAL_STEPS })}
          style={{ display: 'flex', gap: 8, justifyContent: 'center', margin: '22px 0' }}>
          {Array.from({ length: TOTAL_STEPS }, (_, i) => (
            <span key={i} style={{
              width: i === step ? 14 : 10,
              height: i === step ? 14 : 10,
              color: i === step ? '#203463' : 'rgba(176,155,170,0.70)',
              fontSize: i === step ? 11 : 9,
              lineHeight: 1,
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              textShadow: i === step ? '0 0 12px rgba(230,244,255,0.9)' : 'none',
              animation: i === step ? 'twinkle 1.8s ease-in-out infinite' : 'none',
              transition: 'all 0.35s'
            }}>✦</span>
          ))}
        </div>

        {/* Navigation */}
        <div className="onboarding-nav" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {step > 0 ? (
            <button className="onboarding-secondary" onClick={back} aria-label={t('onboarding.back')} style={{
              minWidth: 44, minHeight: 58, padding: '0 20px',
              background: 'rgba(255,255,255,0.60)', color: '#6f7a8b',
              border: '1px solid rgba(210,200,210,0.35)', borderRadius: 999, cursor: 'pointer', fontSize: 12, fontWeight: 600,
              display: 'flex', alignItems: 'center', gap: 6
            }}><ArrowLeft size={14} /> {t('onboarding.back')}</button>
          ) : (
            <button className="onboarding-secondary" onClick={() => onComplete()} style={{
              minHeight: 58, padding: '0 20px',
              background: 'rgba(255,255,255,0.60)', color: '#6f7a8b',
              border: '1px solid rgba(210,200,210,0.35)', borderRadius: 999, cursor: 'pointer', fontSize: 11, fontWeight: 600, letterSpacing: '0.1em'
            }}>{t('onboarding.skip')}</button>
          )}

          <div className="onboarding-nav-spacer" style={{ flex: 1 }} />

          <button className="onboarding-primary" onClick={isLast ? () => onComplete(selectedPersona) : next} style={{
            minHeight: 66, padding: '0 30px',
            background: 'linear-gradient(135deg, #0b1430, #101e46 56%, #162953)', color: '#fff',
            border: 'none', borderRadius: 999, cursor: 'pointer', fontSize: 11, fontWeight: 700,
            letterSpacing: '0.2em', textTransform: 'uppercase',
            display: 'flex', alignItems: 'center', gap: 8,
            boxShadow: '0 20px 50px rgba(10,16,36,0.28), inset 0 1px 0 rgba(219,233,255,0.42)',
            animation: 'pulse 2.8s ease-in-out infinite'
          }}>
            {isLast ? t('onboarding.begin') : t('onboarding.next')}
            {!isLast && <ArrowRight size={14} />}
          </button>
        </div>
      </div>
    </div>
  );
}
