import React, { useEffect, useMemo, useState } from 'react';
import { Compass, Diamond } from 'lucide-react';

type OrbVariant = 'compass' | 'diamond';

interface OracleOrbProps {
  size: number;
  variant: OrbVariant;
  iconColor?: string;
  strokeWidth?: number;
}

export function OracleOrb({ size, variant, iconColor, strokeWidth }: OracleOrbProps) {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return;

    const media = window.matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => setPrefersReducedMotion(media.matches);
    update();

    if (typeof media.addEventListener === 'function') {
      media.addEventListener('change', update);
      return () => media.removeEventListener('change', update);
    }

    media.addListener(update);
    return () => media.removeListener(update);
  }, []);

  const containerHeight = useMemo(() => Math.round(size * 1.20), [size]);
  const symbolSize = useMemo(
    () => Math.round(size * (variant === 'compass' ? 0.48 : 0.34)),
    [size, variant],
  );
  const symbolColor = iconColor ?? (variant === 'compass' ? 'rgba(210,110,140,0.72)' : 'rgba(39,59,106,0.82)');
  const symbolStrokeWidth = strokeWidth ?? (variant === 'compass' ? 0.68 : 1.12);

  const renderSymbol = () => {
    const style: React.CSSProperties = {
      color: symbolColor,
      animation: prefersReducedMotion
        ? 'none'
        : (variant === 'compass' ? 'spinSlow 80s linear infinite' : 'iridescentShift 7.2s ease-in-out infinite'),
    };

    if (variant === 'diamond') {
      return <Diamond size={symbolSize} strokeWidth={symbolStrokeWidth} style={style} />;
    }

    return <Compass size={symbolSize} strokeWidth={symbolStrokeWidth} style={style} />;
  };

  return (
    <div
      aria-hidden
      style={{
        width: size,
        height: containerHeight,
        position: 'relative',
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'center',
        pointerEvents: 'none',
      }}
    >
      <div style={{
        position: 'absolute',
        inset: `${Math.round(size * -0.22)}px`,
        top: `${Math.round(size * -0.16)}px`,
        bottom: `${Math.round(size * 0.18)}px`,
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(245,199,214,0.30) 0%, rgba(255,233,240,0.14) 42%, transparent 74%)',
        filter: 'blur(2px)',
        opacity: 0.96,
        animation: prefersReducedMotion ? 'none' : 'pulse 4.8s ease-in-out infinite',
      }} />

      <div style={{
        position: 'absolute',
        inset: `${Math.round(size * -0.12)}px`,
        top: `${Math.round(size * -0.06)}px`,
        bottom: `${Math.round(size * 0.2)}px`,
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(255,229,238,0.34) 0%, rgba(231,241,255,0.14) 52%, transparent 76%)',
      }} />

      <div style={{
        width: size,
        height: size,
        borderRadius: '50%',
        position: 'relative',
        overflow: 'hidden',
        border: '0.5px solid rgba(255,255,255,0.72)',
        background: `
          radial-gradient(circle at 32% 26%, rgba(255,255,255,0.98) 0%, rgba(255,255,255,0.90) 14%, rgba(255,243,248,0.74) 34%, rgba(233,242,255,0.46) 60%, rgba(250,236,244,0.42) 100%),
          linear-gradient(145deg, rgba(255,255,255,0.82), rgba(248,226,236,0.52), rgba(227,238,255,0.54))
        `,
        boxShadow: 'var(--om-glow-rose), var(--om-glow-rose-wide), inset 0 1px 0 rgba(255,255,255,0.94), inset 0 -16px 28px rgba(217,111,140,0.13), inset 0 -28px 34px rgba(190,216,255,0.14)',
        animation: prefersReducedMotion ? 'none' : 'iridescentShift 8.8s ease-in-out infinite',
      }}>
        <div style={{
          position: 'absolute',
          inset: '1px',
          borderRadius: '50%',
          border: '0.5px solid rgba(248,252,255,0.64)',
          boxShadow: 'inset 0 0 0 0.5px rgba(255,255,255,0.42)',
        }} />

        <div style={{
          position: 'absolute',
          left: '12%',
          top: '12%',
          width: '34%',
          height: '22%',
          borderRadius: '999px',
          background: 'linear-gradient(180deg, rgba(255,255,255,0.76), rgba(255,255,255,0.08))',
          transform: 'rotate(-24deg)',
          filter: 'blur(0.2px)',
        }} />

        <div style={{
          position: 'absolute',
          left: '22%',
          top: '18%',
          width: Math.max(6, Math.round(size * 0.08)),
          height: Math.max(6, Math.round(size * 0.08)),
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(255,255,255,0.96) 0%, rgba(255,255,255,0.18) 68%, transparent 100%)',
          boxShadow: '0 0 16px rgba(255,255,255,0.48)',
        }} />

        <div style={{
          position: 'absolute',
          inset: '18%',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(217,111,140,0.20) 0%, rgba(255,242,247,0.06) 56%, transparent 76%)',
        }} />

        <div style={{
          position: 'absolute',
          left: '16%',
          right: '16%',
          bottom: '12%',
          height: '30%',
          borderRadius: '50%',
          background: 'linear-gradient(180deg, rgba(255,255,255,0.04), rgba(255,255,255,0.34) 48%, rgba(236,243,255,0.10) 100%)',
          filter: 'blur(0.4px)',
        }} />

        <div style={{
          position: 'absolute',
          inset: 0,
          borderRadius: '50%',
          background: `repeating-linear-gradient(
            37deg,
            transparent 0px,
            rgba(160,120,140,0.022) 1px,
            transparent 2px,
            transparent 7px
          )`,
          pointerEvents: 'none',
        }} />

        <div style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1,
        }}>
          {renderSymbol()}
        </div>
      </div>
    </div>
  );
}
