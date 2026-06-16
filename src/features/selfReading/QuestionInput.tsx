import { useT } from '../../i18n';

interface QuestionInputProps {
  value: string;
  onChange: (value: string) => void;
}

export function QuestionInput({ value, onChange }: QuestionInputProps) {
  const t = useT();

  return (
    <section aria-labelledby="self-reading-question-title" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div id="self-reading-question-title" style={{ fontSize: 10, letterSpacing: '0.24em', color: '#8994a6', textTransform: 'uppercase', fontWeight: 700 }}>{t('sr.question.title')}</div>
      <textarea
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={t('sr.question.placeholder')}
        aria-label={t('sr.question.title')}
        rows={4}
        style={{
          width: '100%',
          resize: 'vertical',
          border: '1px solid rgba(210,219,236,0.48)',
          borderRadius: 24,
          background: 'rgba(255,255,255,0.74)',
          boxShadow: 'var(--om-shadow-soft)',
          padding: '16px 18px',
          color: '#263044',
          lineHeight: 1.8,
          letterSpacing: '0.04em',
          outline: 'none',
        }}
      />
    </section>
  );
}
