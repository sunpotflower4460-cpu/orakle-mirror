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
  const bodyStyle: React.CSSProperties = { fontSize: 15, color: '#596579', lineHeight: 2.0, marginTop: 14 };
  const headingStyle: React.CSSProperties = { fontSize: 30, fontWeight: 400, color: '#263044', letterSpacing: '0.10em', margin: 0, lineHeight: 1.5 };

  return (
    <div className="onboarding-overlay" role="dialog" aria-modal="true" aria-labelledby={titleId} style={{
      position: 'fixed', inset: 0, zIndex: 1100,
      background: `
        radial-gradient(circle at 50% 31%, rgba(244,190,205,0.22), transparent 30%),
        radial-gradient(circle at 50% 72%, rgba(255,235,240,0.38), transparent 38%),
        radial-gradient(circle at 15% 18%, rgba(255,255,255,0.74), transparent 34%),
        linear-gradient(180deg, #fffdfd 0%, #fff8fa 48%, #fdf2f5 100%)
      `,
      backdropFilter: 'blur(4px)', WebkitBackdropFilter: 'blur(4px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '16px', paddingTop: 'calc(16px + var(--sat))', paddingBottom: 'calc(16px + var(--sab))',
      animation: 'fadeIn 0.3s ease'
    }}>
      <div className="onboarding-card" style={{
        background: 'rgba(255,255,255,0.84)', maxWidth: 440, width: '100%', maxHeight: '100%',
        borderRadius: 38, boxShadow: '0 24px 80px rgba(90,60,70,0.07)', border: '1px solid rgba(220,210,216,0.30)',
        overflowY: 'auto', padding: 32, display: 'flex', flexDirection: 'column',
        animation: 'modalReveal 0.45s cubic-bezier(0.16,1,0.3,1)'
      }}>
        {/* 言語切替(タイトルの時点で日本語／英語を選べる) */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 12 }}>
          <div role="group" aria-label={t('help.language')} style={{
            display: 'flex', gap: 3,
            background: 'rgba(255,255,255,0.68)', borderRadius: 999, padding: 4,
            border: '1px solid rgba(210,200,210,0.35)',
            height: 46
          }}>
            {LOCALES.map(loc => (
              <button key={loc} onClick={() => setLocale(loc)} aria-pressed={locale === loc} style={{
                padding: '6px 16px', borderRadius: 999, border: 'none', cursor: 'pointer',
                fontSize: 12, fontWeight: 600, transition: 'all 0.25s',
                background: locale === loc ? 'rgba(244,190,205,0.62)' : 'transparent',
                color: locale === loc ? '#263044' : '#8f98a8'
              }}>{t(`language.${loc}`)}</button>
            ))}
          </div>
        </div>

        {/* Step content(切替時に、鏡に像が結ぶように現れる) */}
        <div className="onboarding-step" key={step} style={{ flex: 1, animation: 'stepReveal 0.5s cubic-bezier(0.16,1,0.3,1)', minHeight: 280, display: 'flex', flexDirection: 'column' }}>
          {step === 0 && (
            <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flex: 1, gap: 0 }}>
              {/* Large logo with rose glow */}
              <div style={{ position: 'relative', width: 116, height: 116, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 28 }}>
                <div style={{ position: 'absolute', inset: -28, background: 'radial-gradient(circle, rgba(217,111,140,0.15) 0%, transparent 70%)', animation: 'pulse 3s ease-in-out infinite', borderRadius: '50%' }} />
                <div style={{ position: 'absolute', inset: -10, background: 'radial-gradient(circle, rgba(217,111,140,0.08) 0%, transparent 70%)', borderRadius: '50%' }}/>
                <div style={{
                  width: 116, height: 116, borderRadius: '50%',
                  background: 'radial-gradient(circle, rgba(255,255,255,0.80), rgba(255,238,244,0.40))',
                  border: '1px solid rgba(200,212,224,0.42)',
                  boxShadow: '0 0 52px rgba(217,111,140,0.20), 0 0 86px rgba(217,111,140,0.11), inset 0 1px 0 rgba(255,255,255,0.84)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative'
                }}>
                  <Compass size={54} strokeWidth={0.55} style={{ color: 'rgba(215,120,148,0.72)', animation: 'spinSlow 80s linear infinite', position: 'relative' }} />
                </div>
              </div>
              <div style={{ fontSize: 10, letterSpacing: '0.46em', color: '#c9bbc3', textTransform: 'uppercase', fontWeight: 600, marginBottom: 16 }}>Oracle Mirror</div>
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
                          ? `0 18px 44px rgba(215,120,148,0.12)`
                          : '0 14px 36px rgba(180,110,130,0.05)',
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
          style={{ display: 'flex', gap: 6, justifyContent: 'center', margin: '22px 0' }}>
          {Array.from({ length: TOTAL_STEPS }, (_, i) => (
            <span key={i} style={{
              width: i === step ? 20 : 6, height: 6, borderRadius: 999,
              background: i === step ? '#d77894' : 'rgba(220,210,216,0.60)', transition: 'all 0.35s'
            }} />
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
            background: 'linear-gradient(135deg, #0b1024, #141c38)', color: '#fff',
            border: 'none', borderRadius: 999, cursor: 'pointer', fontSize: 11, fontWeight: 700,
            letterSpacing: '0.2em', textTransform: 'uppercase',
            display: 'flex', alignItems: 'center', gap: 8,
            boxShadow: '0 20px 50px rgba(10,16,36,0.24)'
          }}>
            {isLast ? t('onboarding.begin') : t('onboarding.next')}
            {!isLast && <ArrowRight size={14} />}
          </button>
        </div>
      </div>
    </div>
  );
}
