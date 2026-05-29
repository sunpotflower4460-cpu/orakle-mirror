# App Store — Blockers & Manual Tasks

This document records blockers that cannot be resolved automatically by an AI agent,
and must be completed by a human before App Store submission.

---

## Bundle ID

- **Status**: Replaced `com.example.oraclemirror` → `com.sunpotflower.oraclemirror` in code.
- **Action required**: Register `com.sunpotflower.oraclemirror` as an App ID in
  Apple Developer portal and confirm it matches the production certificate/provisioning profile.

---

## RevenueCat

- **Action required**: Create a RevenueCat project, add the iOS app, create the
  `premium` entitlement and a monthly subscription product, then add the Public SDK key
  to `VITE_REVENUECAT_IOS_API_KEY` in `.env.local` / Cloudflare secrets.

## Legal URLs

- **Action required**: Publish Terms of Use and Privacy Policy at public URLs, then set:
  - `VITE_TERMS_URL=https://…`
  - `VITE_PRIVACY_URL=https://…`

## Support Contact

- **Action required**: Set at least one of:
  - `VITE_SUPPORT_URL=https://…` (support page)
  - `VITE_SUPPORT_EMAIL=support@…`

## Backend URL

- **Action required**: Deploy BFF to Cloudflare Workers and set:
  - `VITE_BACKEND_URL=https://oracle-mirror-bff.<subdomain>.workers.dev/oracle`

## App Store Connect

- Create app record in App Store Connect.
- Set app name, subtitle, description, keywords, screenshots.
- Fill in privacy questionnaire (see `docs/APP-PRIVACY-DATA-MAP.md`).
- Configure In-App Purchase product(s) matching the RevenueCat entitlement.
- Fill in tax, banking, and contract information.

## Gemini Model

- Confirm `GEMINI_MODEL` in `bff/wrangler.toml` is a stable (non-preview) release.
  See `docs/BFF-PROVIDER-NOTES.md` for details.
