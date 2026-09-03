import React, { useEffect, useMemo, useState } from 'react';

type OrbVariant = 'compass' | 'diamond';

interface OracleOrbProps {
  size: number;
  variant: OrbVariant;
  iconColor?: string;
  strokeWidth?: number;
}

export function OracleOrb({ size }: OracleOrbProps) {
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
  const isCompact = size < 72;
  const live = !prefersReducedMotion;

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
          <div className="oracle-orb__sigil">
            <span className="oracle-orb__sigil-ring" />
            <span className="oracle-orb__sigil-star" />
          </div>
          {live && (
            <>
              <div className="oracle-orb__sheen" />
              <div className="oracle-orb__sheen oracle-orb__sheen--cool" />
            </>
          )}
          <div className={`oracle-orb__orbit${live ? ' oracle-orb__orbit--live' : ''}`}>
            <span className="oracle-orb__pearl" />
            <span className="oracle-orb__pearl oracle-orb__pearl--far" />
          </div>
        </div>
      </div>

      <div className={`oracle-orb__shadow${live ? ' oracle-orb__shadow--live' : ''}`} />
    </div>
  );
}
