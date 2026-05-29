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
