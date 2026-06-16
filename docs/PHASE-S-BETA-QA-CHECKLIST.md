# Phase S Beta QA Checklist

Use this checklist for Self Reading beta stabilization before App Review readiness work.

## Web / Safari

- [ ] Open Self Reading from the sidebar and return to AI Mirror.
- [ ] Draw Deck 1 with 1 / 2 / 3 card spreads.
- [ ] Confirm the optional question appears only on the local result view.
- [ ] Confirm Draw again and Change deck/spread both work.
- [ ] Confirm Deck 2 / Deck 3 show preparation state and cannot draw.
- [ ] Create a custom card with empty fields and confirm validation.
- [ ] Create a valid custom card, reload, and confirm it persists locally.
- [ ] Confirm the custom-card deck is disabled with zero cards or fewer cards than the selected spread requires.
- [ ] Confirm the custom-card deck draws 1 / 2 / 3 card spreads when enough custom cards exist.
- [ ] Confirm custom cards are not mixed into the Classic 48 draw results.
- [ ] Confirm no Self Reading request is sent to the BFF or any LLM endpoint.
- [ ] Confirm Self Reading does not consume `FREE_LIMIT`.

## iOS / Capacitor

- [ ] Run on an iOS simulator or device and repeat the 1 / 2 / 3 card draw checks.
- [ ] Confirm the shuffle / deal / flip animation completes and cards remain visible.
- [ ] Enable Reduce Motion and confirm the draw flow still reaches the result view.
- [ ] Confirm custom cards remain local-only after app restart.

## Offline / Privacy

- [ ] Use Self Reading while offline and confirm setup, draw, result, and custom card list still work.
- [ ] Confirm AI Mirror remains the only flow that calls the BFF for oracle responses.
- [ ] Confirm `oracle_self_reading_v1` is separate from `oracle_mirror_v16`.
