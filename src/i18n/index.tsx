import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { Preferences } from '../lib/capacitorMocks';
import { ja } from './locales/ja';
import { en } from './locales/en';

// 依存ライブラリを増やさない、型安全な軽量 i18n。
// 神託応答の言語は別レイヤー(Workstream B)。ここは UI 文言のみを扱う。

export type Locale = 'ja' | 'en';
export type MessageKey = keyof typeof ja;
export type TParams = Record<string, string | number>;

export const LOCALES: Locale[] = ['ja', 'en'];

const DICTIONARIES: Record<Locale, Record<MessageKey, string>> = { ja, en };
const LOCALE_STORAGE_KEY = 'app_locale';
// 日本語以外の端末は英語で迎える(グローバル既定)。
const FALLBACK_LOCALE: Locale = 'en';

export const detectLocale = (): Locale => {
  if (typeof navigator === 'undefined') return FALLBACK_LOCALE;
  const lang = (navigator.language || '').toLowerCase();
  if (lang.startsWith('ja')) return 'ja';
  return FALLBACK_LOCALE;
};

const interpolate = (template: string, params?: TParams): string => {
  if (!params) return template;
  return template.replace(/\{(\w+)\}/g, (_match, key: string) =>
    Object.prototype.hasOwnProperty.call(params, key) ? String(params[key]) : `{${key}}`
  );
};

// React コンテキスト外(ErrorBoundary など)からも使える純粋関数。
export const translate = (locale: Locale, key: MessageKey, params?: TParams): string => {
  const dict = DICTIONARIES[locale] ?? DICTIONARIES[FALLBACK_LOCALE];
  const template = dict[key] ?? DICTIONARIES[FALLBACK_LOCALE][key] ?? key;
  return interpolate(template, params);
};

export type TFunction = (key: MessageKey, params?: TParams) => string;

interface LocaleContextValue {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: TFunction;
}

const LocaleContext = createContext<LocaleContextValue | null>(null);

export function LocaleProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(() => detectLocale());

  // 保存済みの手動選択があれば、端末言語より優先する。
  useEffect(() => {
    let mounted = true;
    Preferences.get({ key: LOCALE_STORAGE_KEY })
      .then(({ value }) => {
        if (mounted && (value === 'ja' || value === 'en')) setLocaleState(value);
      })
      .catch(() => {});
    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    if (typeof document !== 'undefined') document.documentElement.lang = locale;
  }, [locale]);

  const setLocale = useCallback((next: Locale) => {
    setLocaleState(next);
    Preferences.set({ key: LOCALE_STORAGE_KEY, value: next }).catch(() => {});
  }, []);

  const t = useCallback<TFunction>((key, params) => translate(locale, key, params), [locale]);

  return <LocaleContext.Provider value={{ locale, setLocale, t }}>{children}</LocaleContext.Provider>;
}

export function useLocale(): LocaleContextValue {
  const ctx = useContext(LocaleContext);
  if (!ctx) throw new Error('useLocale must be used within a LocaleProvider');
  return ctx;
}

export function useT(): TFunction {
  return useLocale().t;
}
