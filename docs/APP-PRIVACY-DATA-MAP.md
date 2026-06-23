# Oracle Mirror Privacy / Data Map

## Collected / Processed Data

- User prompts
- AI responses
- Local conversation history
- Daily usage count
- Subscription entitlement status
- App language setting

## Storage

- Conversation history is stored locally on the device via Capacitor Preferences.
- Prompts are sent to the BFF only for AI generation.
- The BFF should not persist prompts or responses unless explicitly changed in future phases.


## Self Reading Data

Self Reading is separate from AI Mirror chat. AI Mirror conversation data uses `oracle_mirror_v16`; Self Reading custom-card and saved-reading storage uses `oracle_self_reading_v1`. These storage keys should not be conflated.

| Data category | Storage / processing | Leaves device? | Sent to BFF / LLM? | Account association | Retention / deletion |
|---|---|---|---|---|---|
| Optional Self Reading question text | Held in the Self Reading view state for the current reading flow. If the user explicitly saves the reading, it is stored locally under `oracle_self_reading_v1`. | No | No | No account is required. | The user can delete saved readings from the local history UI; otherwise it remains until app/local data is removed. |
| Drawn card result | Generated locally from the selected ready deck, including the dedicated custom-card deck when selected. If explicitly saved, the card names/meanings and position references are stored locally under `oracle_self_reading_v1`. | No | No | No account is required. | The user can delete saved readings from the local history UI; saved readings are capped at 30. |
| Selected deck / spread metadata | Held in Self Reading view state during setup and result display. If explicitly saved, deck/spread IDs and creation time are stored locally under `oracle_self_reading_v1`. | No | No | No account is required. | The user can delete saved readings from the local history UI. |
| Custom card name | Stored locally through Capacitor Preferences under `oracle_self_reading_v1`. | No | No | No account is required. | Remains until the user deletes the custom card or app/local data is removed. |
| Custom card meaning | Stored locally through Capacitor Preferences under `oracle_self_reading_v1`. | No | No | No account is required. | Remains until the user deletes the custom card or app/local data is removed. |
| Custom card local list | Stored locally through Capacitor Preferences under `oracle_self_reading_v1`. | No | No | No account is required. | The custom card creator provides per-card deletion. |
| Local Self Reading history | User-initiated saved readings are stored locally under `oracle_self_reading_v1`; the app does not auto-save every reading. | No | No | No account is required. | Saved readings are capped at 30 and can be deleted individually from the local history UI. |

Required implementation notes for review:

- Self Reading does not send question text to the BFF.
- Self Reading does not send drawn cards to the BFF.
- Self Reading does not call LLM APIs.
- Self Reading custom cards and explicitly saved readings are stored locally.
- Custom cards can be drawn only through the dedicated custom-card deck, are not mixed into the built-in 48-card deck, and do not consume `FREE_LIMIT`.
- Custom card names/meanings and saved reading details are not sent to the BFF or LLM.
- Deck 2 and Deck 3 are intentionally prepared slots and remain unavailable until card content is manually added.
- Deck 2 / Deck 3 currently do not call AI, BFF, or LLM services and do not consume `FREE_LIMIT`.
- Adding Deck 2 / Deck 3 content later will remain local-only if implemented as bundled card arrays.

## Card Randomness (Quantum RNG)

- Card draws request entropy from an external quantum RNG (ANU Quantum Numbers)
  **via the BFF only**. The request carries **only the number of bytes** needed for
  the draw — no user ID, question text, persona, mode, or card history.
- The quantum RNG request is never linked to the question content or the drawn result.
- The frontend does not hold the ANU URL, key, or API spec; the BFF normalizes the
  response to a plain byte array.
- If the quantum RNG fails, times out, or is offline, the app falls back to the
  device's `crypto.getRandomValues()`; cards can always be drawn.
- The BFF does not log the random request together with any individual user's prompt.

## Third Parties

- Apple / StoreKit
- RevenueCat
- Cloudflare Workers
- Google Gemini API
- ANU Quantum Numbers (quantum RNG for card draws, via BFF; byte count only)

## Not Collected

- No account registration
- No location
- No camera
- No microphone
- No contacts
- No advertising tracking

## User Control

- Users can delete individual rooms.
- Users can delete all local conversation history.
