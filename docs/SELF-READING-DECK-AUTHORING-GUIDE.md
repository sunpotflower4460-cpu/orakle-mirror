# Self Reading Deck Authoring Guide

This guide is for manually adding future bundled Self Reading decks. Do not generate placeholder, sample, or dummy card content.

## Where to add cards

Deck 2:
`src/constants/decks.ts` → `DECK_24_CARDS`

Deck 3:
`src/constants/decks.ts` → `DECK_36_CARDS`

Do not edit `ORACLE_CARDS`; Classic 48 must stay unchanged.

## Card shape

Use the existing `OracleCard` shape.

Minimum:

```ts
{
  name: '...',
  meaning: '...',
}
```

Optional if supported:

```ts
{
  name: '...',
  meaning: '...',
  image: '...',
  imageAlt: '...',
}
```

## Count rules

- Deck 2: exactly 24 cards
- Deck 3: exactly 36 cards
- Keep a deck unavailable until real content exists.
- Do not manually set `ready: true` while the card array is empty.

## i18n update steps

When final card content is added later, update only the display copy that describes the finalized deck:

- `src/i18n/locales/ja.ts`
- `src/i18n/locales/en.ts`

Keep the Japanese and English key sets consistent. Do not invent a final theme until product copy is approved.

## Safety rules

Avoid:

- medical advice
- legal advice
- financial advice
- self-harm encouragement
- deterministic future claims
- fear-based wording
- “必ず”
- “絶対”
- user-blaming language

Keep card meanings reflective, local-only, and suitable for entertainment / self-reflection.

## Validation

Run:

```bash
npm run typecheck
npm run build
git diff --check
```

## Manual QA

- Deck becomes selectable only after cards exist
- 1 / 2 / 3 card spreads work
- Classic 48 still works
- custom-card deck still works
- no AI/BFF/network call
- FREE_LIMIT unchanged
- Deck 2 / Deck 3 copy does not claim completion before card content exists
