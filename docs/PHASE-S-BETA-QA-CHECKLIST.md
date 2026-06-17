# Phase S Beta QA Checklist

Use this checklist for Self Reading beta stabilization before App Review readiness work.

## Web / Safari

- [ ] Open Self Reading from the sidebar and return to AI Mirror.
- [ ] Draw Deck 1 with 1 / 2 / 3 card spreads.
- [ ] Confirm the optional question appears only on the local result view.
- [ ] Confirm Draw again and Change deck/spread both work.
- [ ] Tap the explicit save action on the result view and confirm the saved reading appears in 保存した履歴 / Saved readings.
- [ ] Confirm saved readings show date, deck, spread, optional question, position labels, card names, and meanings.
- [ ] Delete a saved reading and confirm custom cards remain intact.
- [ ] Confirm Deck 2 appears as an intentional future 24-card slot and cannot draw while empty.
- [ ] Confirm Deck 3 appears as an intentional future 36-card slot and cannot draw while empty.
- [ ] Confirm Deck 2 / Deck 3 status text explains they are awaiting cards, not broken.
- [ ] Create a custom card with empty fields and confirm validation.
- [ ] Create a valid custom card, reload, and confirm it persists locally.
- [ ] Confirm the custom-card deck is disabled with zero cards or fewer cards than the selected spread requires.
- [ ] Confirm the custom-card deck draws 1 / 2 / 3 card spreads when enough custom cards exist.
- [ ] Confirm custom cards are not mixed into the Classic 48 draw results.
- [ ] Confirm no Self Reading request is sent to the BFF or any LLM endpoint.
- [ ] Confirm Deck 2 / Deck 3 do not call AI/BFF/LLM while unavailable.
- [ ] Confirm Self Reading does not consume `FREE_LIMIT`, including saving/viewing/deleting history and Deck 2 / Deck 3 placeholder selection attempts.

## iOS / Capacitor

- [ ] Run on an iOS simulator or device and repeat the 1 / 2 / 3 card draw checks.
- [ ] Confirm the shuffle / deal / flip animation completes and cards remain visible.
- [ ] Enable Reduce Motion and confirm the draw flow still reaches the result view.
- [ ] Confirm custom cards remain local-only after app restart.

## Offline / Privacy

- [ ] Use Self Reading while offline and confirm setup, draw, result, and custom card list still work.
- [ ] Confirm AI Mirror remains the only flow that calls the BFF for oracle responses.
- [ ] Confirm `oracle_self_reading_v1` is separate from `oracle_mirror_v16` and is the only key used for Self Reading saved history.

## Future Deck Insertion

- [ ] Follow `docs/SELF-READING-DECK-AUTHORING-GUIDE.md` before manually adding Deck 2 / Deck 3 content.
- [ ] Keep future bundled Deck 2 / Deck 3 content local-only unless a separate phase explicitly changes that behavior.
