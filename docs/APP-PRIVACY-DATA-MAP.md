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

Self Reading is separate from AI Mirror chat. AI Mirror conversation data uses `oracle_mirror_v16`; Self Reading custom-card storage uses `oracle_self_reading_v1`. These storage keys should not be conflated.

| Data category | Storage / processing | Leaves device? | Sent to BFF / LLM? | Account association | Retention / deletion |
|---|---|---|---|---|---|
| Optional Self Reading question text | Held in the Self Reading view state for the current reading flow. It is displayed on the local result view when present. | No | No | No account is required. | No reading-history persistence is currently implemented for questions. |
| Drawn card result | Generated locally from the selected ready deck, including the dedicated custom-card deck when selected, and held in view state for the current result view. | No | No | No account is required. | No reading-history persistence is currently implemented for drawn results. |
| Selected deck / spread metadata | Held in Self Reading view state during setup and result display. | No | No | No account is required. | Not persisted as reading history in the current implementation. |
| Custom card name | Stored locally through Capacitor Preferences under `oracle_self_reading_v1`. | No | No | No account is required. | Remains until the user deletes the custom card or app/local data is removed. |
| Custom card meaning | Stored locally through Capacitor Preferences under `oracle_self_reading_v1`. | No | No | No account is required. | Remains until the user deletes the custom card or app/local data is removed. |
| Custom card local list | Stored locally through Capacitor Preferences under `oracle_self_reading_v1`. | No | No | No account is required. | The custom card creator provides per-card deletion. |
| Local Self Reading history | The storage shape includes a `readings` array, but the current UI does not save Self Reading history. | No current history upload or server storage. | No | No account is required. | No history deletion UI is claimed because history persistence is not currently implemented. |

Required implementation notes for review:

- Self Reading does not send question text to the BFF.
- Self Reading does not send drawn cards to the BFF.
- Self Reading does not call LLM APIs.
- Self Reading custom cards are stored locally.
- Custom cards can be drawn only through the dedicated custom-card deck, are not mixed into the built-in 48-card deck, and do not consume `FREE_LIMIT`.
- Custom card names and meanings are not sent to the BFF or LLM.
- Deck 2 and Deck 3 are intentionally prepared slots and remain unavailable until card content is manually added.
- Deck 2 / Deck 3 currently do not call AI, BFF, or LLM services and do not consume `FREE_LIMIT`.
- Adding Deck 2 / Deck 3 content later will remain local-only if implemented as bundled card arrays.

## Third Parties

- Apple / StoreKit
- RevenueCat
- Cloudflare Workers
- Google Gemini API

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
