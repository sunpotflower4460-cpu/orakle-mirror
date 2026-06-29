import { useEffect, useRef, useState } from 'react';
import { Sparkles } from 'lucide-react';
import { useT } from '../i18n';
import type { Mode, OracleCard, Persona } from '../types';
import { DrawnCardView } from './OracleBubble';

// Phase L-3c: タイプ表示の速度・間。調整可能な定数(設計書 §5.5)。
// 落ち着いた中庸の演出にする。俗っぽく速すぎない。
const TYPE_CHARS_PER_SEC = 45;
const PUNCT_PAUSE_MS = 120;
const PUNCT = new Set(['。', '、', '！', '？', '\n', '.', ',', '!', '?']);

interface StreamingBubbleProps {
  /** 今わかっている表示本文の全体(累積・タグ無し)。 */
  target: string;
  /** ストリーム(または非ストリーム取得)が完了したか。 */
  done: boolean;
  /** OS の「動きを減らす」設定。true なら即時表示(タイプしない)。 */
  reduceMotion: boolean;
  persona: Persona;
  mode: Mode;
  drawnCards?: OracleCard[];
  /** タイプが target 末尾に追いつき、かつ done のとき一度だけ呼ぶ。親が確定メッセージを保存する。 */
  onFinished: () => void;
}

export function StreamingBubble({ target, done, reduceMotion, persona, mode, drawnCards, onFinished }: StreamingBubbleProps) {
  const t = useT();

  const targetRef = useRef(target);
  targetRef.current = target;
  const doneRef = useRef(done);
  doneRef.current = done;
  const onFinishedRef = useRef(onFinished);
  onFinishedRef.current = onFinished;

  const [shown, setShown] = useState(0);
  const shownRef = useRef(0);
  const finishedRef = useRef(false);

  const finish = (): void => {
    if (!finishedRef.current) {
      finishedRef.current = true;
      onFinishedRef.current();
    }
  };

  // タイプライター本体(rAF で一定速度に均す。バースト到着を吸収する)。
  useEffect(() => {
    if (reduceMotion) return;
    let raf = 0;
    let last = 0;
    let pauseUntil = 0;
    const loop = (now: number): void => {
      if (!last) last = now;
      const dt = now - last;
      last = now;
      const tgt = targetRef.current;
      if (now >= pauseUntil && shownRef.current < tgt.length) {
        const inc = Math.max(1, Math.round((TYPE_CHARS_PER_SEC * dt) / 1000));
        const next = Math.min(tgt.length, shownRef.current + inc);
        const lastCh = tgt[next - 1];
        if (PUNCT.has(lastCh)) pauseUntil = now + PUNCT_PAUSE_MS;
        shownRef.current = next;
        setShown(next);
      }
      if (doneRef.current && shownRef.current >= targetRef.current.length) {
        finish();
        return;
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
    // 一度だけ起動。target/done は ref 経由で参照する。
  }, [reduceMotion]);

  // reduce-motion: 即時表示。done になったら完了通知する。
  useEffect(() => {
    if (reduceMotion && done) finish();
  }, [reduceMotion, done]);

  const display = reduceMotion ? target : target.slice(0, Math.min(shown, target.length));
  const typingComplete = done && shown >= target.length;
  const showCursor = !reduceMotion && !typingComplete;

  const lines = display.split('\n');

  return (
    <div className="oracle-bubble-shell" style={{ width: '100%', animation: 'oracleReveal 1.2s cubic-bezier(0.16,1,0.3,1) forwards' }}>
      <div className="oracle-bubble-meta" style={{ display: 'flex', alignItems: 'center', gap: 8, marginLeft: 14, marginBottom: 8 }}>
        <span style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 10, letterSpacing: '0.35em', fontWeight: 800, textTransform: 'uppercase', color: persona.accent }}>
          {persona.icon} {persona.name}
        </span>
        <span style={{ fontSize: 10, color: '#cbd5e1', letterSpacing: '0.2em', textTransform: 'uppercase' }}>· {t(`mode.${mode.id}.name`)}</span>
      </div>
      <div className="oracle-bubble oracle-bubble-card" style={{
        position: 'relative', padding: '24px 28px', background: 'rgba(255,255,255,0.95)', backdropFilter: 'blur(8px)',
        borderRadius: 24, border: `1px solid ${persona.border}`, boxShadow: '0 8px 32px rgba(0,0,0,0.03)'
      }}>
        {drawnCards && drawnCards.length > 0 && (
          <div style={{ marginBottom: 22, padding: '15px 15px 0', background: `linear-gradient(to bottom right, #ffffff, ${persona.soft})`, borderRadius: 22, border: `1px solid ${persona.border}` }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, letterSpacing: '0.08em', color: '#7b8494', marginBottom: 12 }}>
              <Sparkles size={12} style={{ color: persona.accent }} /> {t('cards.drawnTitle')}
            </div>
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 22, overflow: 'hidden' }}>
              {drawnCards.map((c, ci) => (
                <DrawnCardView key={`${c.name}-${ci}`} card={c} index={ci} accent={persona.accent} border={persona.border} soft={persona.soft} />
              ))}
            </div>
          </div>
        )}
        <div className="oracle-bubble-text" style={{ fontSize: 15, lineHeight: 2.1, letterSpacing: '0.04em', color: '#374151', fontWeight: 300 }}>
          {lines.map((line, i) => {
            const isHeader = /^[①②③【]/.test(line);
            const isLast = i === lines.length - 1;
            return (
              <p key={i} style={{
                marginBottom: line === '' ? 4 : 14, fontWeight: isHeader ? 700 : 300, fontSize: isHeader ? 12 : 15,
                color: isHeader ? persona.accent : '#374151', borderBottom: isHeader ? `1px solid ${persona.accent}22` : 'none',
                paddingBottom: isHeader ? 6 : 0, marginTop: isHeader ? 16 : 0, letterSpacing: isHeader ? '0.15em' : '0.04em',
              }}>
                {line || (isLast && showCursor ? '' : ' ')}
                {isLast && showCursor && (
                  <span aria-hidden="true" style={{ marginLeft: 1, color: persona.accent, opacity: 0.7, animation: 'pulse 1.1s ease-in-out infinite' }}>▌</span>
                )}
              </p>
            );
          })}
        </div>
      </div>
    </div>
  );
}
