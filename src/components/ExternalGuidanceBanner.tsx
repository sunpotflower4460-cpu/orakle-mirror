import React, { useState } from 'react';
import { GuidanceMatch } from '../lib/guidanceDetector';
import { useT } from '../i18n';

interface Props {
  matches: GuidanceMatch[];
}

export const ExternalGuidanceBanner: React.FC<Props> = ({ matches }) => {
  const t = useT();
  if (!matches || matches.length === 0) return null;

  return (
    <section
      aria-label={t('guidance.bannerAriaLabel')}
      style={{
        marginTop: 12,
        padding: '14px 18px',
        background: 'rgba(248,250,252,0.97)',
        borderRadius: 16,
        border: '1px solid rgba(203,213,225,0.6)',
        boxShadow: '0 2px 12px rgba(0,0,0,0.04)',
      }}
    >
      <p style={{
        fontSize: 11,
        color: '#94a3b8',
        letterSpacing: '0.06em',
        marginBottom: 10,
        marginTop: 0,
        fontStyle: 'italic',
      }}>
        {t('guidance.bannerNotice')}
      </p>
      {matches.map((m) => (
        <GuidanceItem key={m.category} match={m} />
      ))}
    </section>
  );
};

const GuidanceItem: React.FC<{ match: GuidanceMatch }> = ({ match }) => {
  const t = useT();
  const isLife = match.category === 'life';
  const [open, setOpen] = useState(isLife);

  const categoryColor: Record<string, string> = {
    life: '#e11d48',
    medical: '#0284c7',
    legal: '#7c3aed',
    financial: '#b45309',
  };
  const color = categoryColor[match.category] ?? '#64748b';

  return (
    <article style={{ marginBottom: 8 }}>
      <button
        type="button"
        onClick={() => {
          if (!isLife) setOpen((v) => !v);
        }}
        aria-expanded={open}
        style={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: 'none',
          border: 'none',
          padding: '8px 0',
          cursor: isLife ? 'default' : 'pointer',
          textAlign: 'left',
          gap: 8,
        }}
      >
        <span style={{
          fontSize: 13,
          fontWeight: 600,
          color,
          lineHeight: 1.5,
          letterSpacing: '0.02em',
        }}>
          {t(`guidance.${match.category}.headline`)}
        </span>
        {!isLife && (
          <span aria-hidden="true" style={{ fontSize: 10, color: '#94a3b8', flexShrink: 0 }}>
            {open ? '▲' : '▼'}
          </span>
        )}
      </button>
      {open && (
        <p style={{
          fontSize: 12,
          color: '#475569',
          lineHeight: 1.8,
          margin: '4px 0 8px',
          whiteSpace: 'pre-line',
        }}>
          {t(`guidance.${match.category}.detail`)}
        </p>
      )}
    </article>
  );
};
