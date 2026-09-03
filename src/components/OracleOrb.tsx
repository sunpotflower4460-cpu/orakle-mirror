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
  const isCompact = size < 72;
  const showGhost = !isCompact && size >= 88;
  const live = !prefersReducedMotion;

  const renderSymbol = (ghost: boolean) => {
    const style: React.CSSProperties = {
      color: symbolColor,
      animation: !live || ghost
        ? 'none'
        : (variant === 'compass' ? 'spinSlow 48s linear infinite' : 'iridescentShift 14s ease-in-out infinite'),
    };

    if (variant === 'diamond') {
      return <Diamond size={symbolSize} strokeWidth={symbolStrokeWidth} style={style} />;
    }

    return <Compass size={symbolSize} strokeWidth={symbolStrokeWidth} style={style} />;
  };

  return (
    <div
      aria-hidden
      className={`oracle-orb${isCompact ? ' oracle-orb--compact' : ''}`}
      style={{ width: size, height: containerHeight }}
    >
      <div className="oracle-orb__aura oracle-orb__aura--gold" />
      <div className="oracle-orb__aura oracle-orb__aura--rose" />
      <div className="oracle-orb__aura oracle-orb__aura--cool" />

      <div className={`oracle-orb__float${live ? ' oracle-orb__float--live' : ''}`}>
        <div className="oracle-orb__sphere">
          <div className="oracle-orb__volume" />
          <div className="oracle-orb__core" />

          <div className={`oracle-orb__inner${live ? ' oracle-orb__inner--live' : ''}`}>
            <div className="oracle-orb__mist" />
            <div className="oracle-orb__swirl" />
            <div className="oracle-orb__cosmos" />
          </div>

          <div className="oracle-orb__glass" />
          <div className="oracle-orb__spec" />
          <div className="oracle-orb__spec-dot" />
          <div className="oracle-orb__spec-sec" />
          <div className="oracle-orb__bottom" />
          <div className="oracle-orb__rim" />
          {live && (
            <>
              <div className="oracle-orb__sheen" />
              <div className="oracle-orb__sheen oracle-orb__sheen--cool" />
            </>
          )}
          <div className={`oracle-orb__orbit${live ? ' oracle-orb__orbit--live' : ''}`}>
            <div className="oracle-orb__pearl" />
            <div className="oracle-orb__pearl oracle-orb__pearl--far" />
          </div>
          {showGhost && (
            <div className="oracle-orb__symbol oracle-orb__symbol--ghost">
              {renderSymbol(true)}
            </div>
          )}
          <div className="oracle-orb__symbol">
            {renderSymbol(false)}
          </div>
        </div>
      </div>

      <div className={`oracle-orb__shadow${live ? ' oracle-orb__shadow--live' : ''}`} />
    </div>
  );
}
