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

## Language

The UI supports Japanese and English. AI oracle responses are currently generated in Japanese.

## Test Notes

Use Apple sandbox IAP during review.
No account login is required to test the app.
