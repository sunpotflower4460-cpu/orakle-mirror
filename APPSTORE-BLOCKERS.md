# App Store — Blockers & Manual Tasks

This document records the remaining App Store blockers and clearly separates human-supplied configuration from code follow-ups.

---

## Bundle ID

- **Code status**: Replaced `com.example.oraclemirror` → `com.sunpotflower.oraclemirror` in code.
- **Human action required**: Register `com.sunpotflower.oraclemirror` as an App ID in Apple Developer and confirm it matches the production certificate/provisioning profile.

---

## RevenueCat / Subscription

### Already implemented in code

- Native iOS uses `@revenuecat/purchases-capacitor`; Web uses the mock implementation.
- `Purchases.configure()` is called when `VITE_REVENUECAT_IOS_API_KEY` is present.
- Offering retrieval, monthly package purchase, purchase restore, and `premium` entitlement checks are wired.

### Human action required

- Create a RevenueCat project and add the iOS app.
- Create the `premium` entitlement.
- Create and attach the monthly subscription product / Offering.
- Set the RevenueCat Public SDK key as `VITE_REVENUECAT_IOS_API_KEY` in `.env.local` for local native builds and in the release build environment.
- Configure the matching product in App Store Connect.
- Test purchase, cancellation/expiry, and restore with a Sandbox account on a real device or Simulator.

### Code follow-up before release

- Refresh RevenueCat customer/entitlement state at app startup instead of relying only on the local `app_is_premium` cache.
- Confirm that expired, refunded, or canceled subscriptions remove premium access on the next app activation.

---

## Legal URLs

- **Human action required**: Publish Terms of Use and Privacy Policy at public URLs, then set:
  - `VITE_TERMS_URL=https://…`
  - `VITE_PRIVACY_URL=https://…`

## Support Contact

- **Human action required**: Set at least one of:
  - `VITE_SUPPORT_URL=https://…` (support page)
  - `VITE_SUPPORT_EMAIL=support@…`

## Backend URL

- **Human action required**: Deploy BFF to Cloudflare Workers and set:
  - `VITE_BACKEND_URL=https://oracle-mirror-bff.<subdomain>.workers.dev/oracle`
- Add `OPENAI_API_KEY` with `wrangler secret put OPENAI_API_KEY`.
- `ANU_API_KEY` is optional for release functionality because QRNG failure falls back to `crypto.getRandomValues()`, but it is required to verify the intended ANU QRNG path.

## Native / Production QA

- Confirm Stage 2 streaming against the deployed BFF and real OpenAI key.
- Tune `TYPE_CHARS_PER_SEC` only after real-device review if needed.
- Confirm iPhone and iPad layouts in Xcode Simulator or on device.
- Confirm offline / QRNG failure still produces a card through the crypto fallback.

## App Store Connect

- Create app record in App Store Connect.
- Set app name, subtitle, description, keywords, and screenshots.
- Because the target is Universal (`TARGETED_DEVICE_FAMILY = "1,2"`), prepare the required iPhone and iPad screenshots.
- Fill in the privacy questionnaire (see `docs/APP-PRIVACY-DATA-MAP.md`).
- Configure and submit the In-App Purchase product matching the RevenueCat entitlement.
- Fill in tax, banking, and contract information.

## LLM Model

- Current configured model: check `OPENAI_MODEL` in `bff/wrangler.toml`.
- Before deployment, verify that the configured model name is available to the production OpenAI project.
- See `docs/BFF-PROVIDER-NOTES.md` for provider details.
