# BFF Provider Notes

## 現行プロバイダ

現行プロバイダ: OpenAI Responses API。
モデル名は `bff/wrangler.toml` の `OPENAI_MODEL` 環境変数で管理。
リリース前に、デプロイ時点で実在し続けるモデル名であることを必ず再確認すること。

## Phase 5.5 予定: プロバイダ抽象化

Phase 5.5 で `bff/src/providers/` 配下に provider 別実装を分離する予定。
候補プロバイダは次のとおり。

- OpenAI（developer ロール公式対応、現行実装）
- Gemini Flash 系（無料枠あり、developer ロール非対応のため system 末尾に統合する変換が必要）
- Groq Llama 系（無料枠あり、developer ロール非対応のため同上）
- Anthropic 系（system ロール公式対応、別途検討）

developer ロール非対応プロバイダ向けには、ChatMessage の developer ロールを system の末尾に連結する統一インターフェイスを Phase 5.5 で実装する。

## 参考: 過去の Gemini 実装メモ

Phase 5.1 で OpenAI に移行済み。本セクションは Phase 5.5 で Gemini を再導入する際の参考として残す。

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
