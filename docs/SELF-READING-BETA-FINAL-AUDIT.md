# Self Reading Beta Final Audit

Phase S-11 is an audit-only stabilization pass for the merged Self Reading beta.

## Feature inventory

- Self Reading opens from the sidebar and can return to AI Mirror.
- Classic 48 is available for 1 / 2 / 3 card spreads.
- The custom-card deck is local-only and is enabled only when enough user-created cards exist for the selected spread.
- Deck 2 and Deck 3 are prepared empty slots and remain unavailable until bundled card content is added manually in a later phase.
- Optional questions are displayed only in the local result and, if explicitly saved, in local history.
- Saved readings are created only by tapping the save action and are capped at 30.
- Result and history views show position labels, card names, and meanings; Self Reading does not add AI interpretation.

## Storage keys

- AI Mirror chat storage remains `oracle_mirror_v16`.
- Self Reading custom cards and explicitly saved readings remain isolated under `oracle_self_reading_v1`.
- Reading deletion is scoped to saved readings and does not delete custom cards.
- Custom-card deletion is scoped to custom cards and does not delete saved readings.

## No-network / limit checklist

- Self Reading components do not call `fetchOracleTwoStage`.
- Self Reading components do not call `fetch`.
- Self Reading does not call BFF, Gemini/OpenAI/provider, subscription, or purchase flows.
- Self Reading does not read or decrement `FREE_LIMIT`.

## Manual QA checklist

- [ ] Open Self Reading from the sidebar and return to AI Mirror.
- [ ] Draw Classic 48 with 1 / 2 / 3 card spreads.
- [ ] Enter an optional question and confirm it appears in the result.
- [ ] Draw again and confirm the save action is available for the new result.
- [ ] Change setup and confirm the selected deck/spread guards remain correct.
- [ ] Create and delete a custom card.
- [ ] Confirm the custom-card deck is disabled until enough cards exist for the selected spread.
- [ ] Save a reading explicitly, open history, and delete the saved reading.
- [ ] Confirm deleting a reading does not delete custom cards.
- [ ] Confirm deleting a custom card does not delete saved readings.
- [ ] Confirm Deck 2 / Deck 3 stay unavailable as awaiting-card slots.
- [ ] Confirm no network request occurs during Self Reading flows.
- [ ] Confirm `FREE_LIMIT` remains unchanged during Self Reading flows.
- [ ] Enable reduced motion and confirm the draw flow still reaches the result.
- [ ] Return to AI Mirror and send a normal AI message.

## Known limitations

- Deck 2 / Deck 3 are empty slots.
- No AI interpretation in Self Reading.
- No AI Mirror handoff from Self Reading.
- No sharing/export.
- No image upload.
- No 4+ card spreads.
- No reversed cards.

## Commands run

- `npm run typecheck`
- `npm run build`
- `git diff --check`
- `npm run appstore:check`
