# App Store Environment Setup

This guide lists the human-supplied environment values needed before App Store readiness checks can pass. Do not use fake production values to silence the check.

## Local file

Copy `.env.example` to `.env.local`.

Do not commit `.env.local`.

The `VITE_*` values are public Vite client environment values and are bundled into the app at build time. They are suitable for public URLs and public client SDK keys, but not for private server secrets, provider API keys, certificates, or production-only credentials.

## Required values

| Key | Purpose | Required for App Store check? | Notes |
|---|---|---|---|
| VITE_BACKEND_URL | BFF endpoint used by AI Mirror | Yes | Must be the deployed backend URL, not a placeholder. |
| VITE_TERMS_URL | Terms page | Yes | Must be a reachable public URL. |
| VITE_PRIVACY_URL | Privacy Policy page | Yes | Must be a reachable public URL. |
| VITE_SUPPORT_URL | Support page | Either URL or email | Public support route. |
| VITE_SUPPORT_EMAIL | Support email | Either URL or email | Use if no support URL. |
| VITE_REVENUECAT_IOS_API_KEY | RevenueCat iOS public SDK key | Required for native IAP readiness if subscriptions are enabled | This is a client SDK key, not a server secret. |

## Validation

Run these commands after filling `.env.local` with real values:

```bash
npm run appstore:check
npm run typecheck
npm run build
```

`npm run appstore:check` is expected to fail until real backend, legal, and support values are supplied locally. Template placeholders in `.env.example` are instructional only and are not treated as production-ready configuration.

## Values that must not be committed

Do not commit real private credentials or generated signing material, including:

- `.env.local`
- provider API keys such as Gemini or OpenAI keys
- RevenueCat private credentials or server API keys
- Xcode signing files
- provisioning profiles
- certificates

If a required value is unknown, leave it blank in `.env.example` and document it as a human setup task instead of guessing.
