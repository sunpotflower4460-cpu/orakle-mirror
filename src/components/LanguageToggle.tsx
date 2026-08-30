import { LOCALES, useLocale } from '../i18n';

/**
 * 溝の中を発光カプセルが滑る言語トグル。
 * Onboarding / Help で同じ操作感に揃える。
 */
export function LanguageToggle() {
  const { locale, setLocale, t } = useLocale();
  const activeIndex = Math.max(0, LOCALES.indexOf(locale));

  return (
    <div className="om-lang-toggle" role="group" aria-label={t('help.language')}>
      <span
        className="om-lang-thumb"
        aria-hidden="true"
        style={{ transform: `translateX(${activeIndex * 100}%)` }}
      />
      {LOCALES.map(loc => (
        <button
          key={loc}
          type="button"
          className="om-lang-btn"
          onClick={() => setLocale(loc)}
          aria-pressed={locale === loc}
        >
          {t(`language.${loc}`)}
        </button>
      ))}
    </div>
  );
}
