# App Review Notes Draft

## App Overview

Oracle Mirror is a self-reflection and entertainment app using AI-generated oracle-style responses.

## Important Disclaimer

The app is not intended to provide medical, legal, financial, emergency, or professional advice.
This disclaimer is displayed on the final onboarding screen and in the Help screen.

## Account

No account registration is required.

## Subscription

The app offers a monthly auto-renewable subscription via Apple In-App Purchase.
Free users can use the oracle up to 3 times per day.
Premium users can use it without the daily limit during the active subscription period.
Subscription terms are displayed in the subscription screen (price, auto-renewal, cancellation instructions).

## Restore Purchases

A restore button is available in the subscription screen.

## Legal Links

Terms of Use and Privacy Policy links are available in the Help screen and the subscription screen.
A support contact link is also available in the Help screen.

## Backend

The app connects to the production BFF endpoint configured by VITE_BACKEND_URL.
The BFF does not expose the Gemini API key to the client.


## Self Reading

Self Reading is a local, AI-independent reading mode that lets users draw cards themselves.
It complements AI Mirror by providing a quiet, user-led path for reflection when the user does not want an AI-generated response.

Current Self Reading behavior:

- It uses deck and spread data bundled in the app.
- Deck 1 uses the existing 48-card Oracle Mirror card set.
- Deck 2 and Deck 3 are visible as preparation-state placeholder decks and cannot be drawn until their content is implemented.
- A dedicated custom-card deck uses only cards saved locally by the user; it is disabled until enough custom cards exist for the selected spread.
- Users can choose 1 / 2 / 3 card spreads and may enter an optional local question.
- The shuffle, deal, flip animation, and result view run locally on the device.
- The result view shows the spread position, card name, and card meaning only; it does not add AI interpretation.
- Self Reading does not call the BFF or any LLM provider.
- Self Reading does not consume the free daily AI oracle limit (`FREE_LIMIT`).
- Self Reading does not contain subscription or purchase links.

The custom card creator inside Self Reading is also local-only.
Custom cards can be saved, deleted, and used as a dedicated local Self Reading deck. They are not mixed into the built-in 48-card deck and are never sent to the BFF or an LLM provider.

Implementation-reference checklist:

- No AI call from Self Reading.
- No BFF call from Self Reading.
- No `FREE_LIMIT` consumption in Self Reading.
- No IAP or subscription link inside Self Reading.
- Custom cards are local-only.
- Custom card names and meanings are not sent to the BFF or LLM.
- Custom-card draws do not consume `FREE_LIMIT`.
- Self Reading custom-card storage uses a separate key: `oracle_self_reading_v1`.
- Deck 2 / Deck 3 remain in preparation state.

## Language

The UI supports Japanese and English. AI oracle responses are currently generated in Japanese.

## Test Notes

Use Apple sandbox IAP during review.
No account login is required to test the app.
