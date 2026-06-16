# Phase S-2 — Self Reading view shell

Phase S-2 adds only the doorway and room shell for Self Reading.

- The sidebar now exposes a quiet `自分で引く` entry point.
- Self Reading is switched with top-level `appView` state, separate from AI mirror chat state.
- The view includes deck selection, spread selection, and an optional local question field.
- The draw button remains disabled with preparation text; drawing, animation, result display, storage, and AI interpretation are intentionally deferred.
- Self Reading does not call the BFF, AI APIs, storage APIs, or usage-limit code.

Validation for this phase should confirm `npm run typecheck` and `npm run build` both pass, and manual checks should verify returning to AI Mirror preserves the active conversation state.
