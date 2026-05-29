# BFF Provider Notes

## Gemini Model

### Current Setting

`GEMINI_MODEL = "gemini-2.5-flash-preview-09-2025"` (as of the time this file was written)

### Issue

The current model name contains `preview`, indicating it is a preview/experimental release.
Preview models may be deprecated or removed without notice by Google.

### Recommendation

Before App Store submission, verify the current stable model name in the
[Google AI for Developers model documentation](https://ai.google.dev/gemini-api/docs/models/gemini)
and update `GEMINI_MODEL` in `bff/wrangler.toml` to the latest stable release.

### Why Not Updated Automatically

Model names are updated frequently and the correct stable name depends on what Google
has published at the time of deployment. An AI agent should not hardcode a model name
based on training data, as it may be outdated. A human must verify and confirm the
stable model at deployment time.

### How to Update

1. Visit [https://ai.google.dev/gemini-api/docs/models/gemini](https://ai.google.dev/gemini-api/docs/models/gemini)
2. Find the current stable (GA) Flash or Pro model name.
3. Update `bff/wrangler.toml`:
   ```toml
   GEMINI_MODEL = "<stable-model-name>"
   ```
4. Deploy with `cd bff && npx wrangler deploy`.
