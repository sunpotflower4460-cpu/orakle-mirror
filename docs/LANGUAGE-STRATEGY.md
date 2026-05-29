# Oracle Mirror — Language Strategy

## Current Status

- The app UI supports Japanese and English (switchable in Help screen).
- AI oracle responses are currently generated in Japanese regardless of the UI locale,
  because the system prompt instructs the AI to respond in Japanese.

## Short-Term Strategy (App Store submission)

The app is submitted as a **Japanese-primary app**.

- App Store localisation: Japanese (primary), English (supplemental).
- Metadata, screenshots, and review notes are prepared in Japanese.
- English UI is available for non-Japanese speakers but AI responses will be in Japanese.
- This limitation is acknowledged in the App Store description and review notes.

## Future Work (Workstream B)

To support locale-aware AI responses, update `buildSystemCore` in `src/lib/prompt.ts`:

```ts
export const buildSystemCore = (locale: Locale): string => {
  const languageRule =
    locale === 'ja'
      ? '出力は日本語で行う。'
      : 'Respond in English.';

  return `
あなたは「Oracle Mirror」と呼ばれる鏡である。
...
${languageRule}
`.trim();
};
```

And update all call-sites of `buildSystemCore` to pass the current locale.
