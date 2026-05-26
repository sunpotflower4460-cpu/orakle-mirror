# Phase 4.8 旧コード整理記録

## 旧コードの現状

以下の関数は @deprecated 状態で残存している。Phase 5.5 (プロバイダ抽象化) 完了時に削除予定。

### src/lib/api.ts

- `fetchPreviewAPI` (Phase 4.5 以前の Gemini 直接呼び出し)
- `fetchBackendAPI` (Phase 4.5 以前の BFF 呼び出し)
- `buildHistory` (Phase 4.5 以前の Gemini history 構築)
- `fetchPreviewAPIv2` (Phase 4.5 の Gemini 呼び出し、二段階処理に置換)
- `fetchBackendAPIv2` (Phase 4.5 の BFF 呼び出し、二段階処理に置換)

### src/lib/prompt.ts

- `buildSystemPrompt` (Phase 4.5 以前の単一プロンプト)
- `buildChatMessages` (Phase 4.5 の 4 層プロンプト構造、二段階処理に置換)

## 本番コードからの参照状況 (Phase 4.8 時点)

- 本番コード (src/MainApp.tsx、src/App.tsx) からの参照: 0 件
- src/dev/promptAB.ts からの参照のみ (A/B/C 比較用途)
- src/dev/ は vite.config.ts で本番ビルドから除外されていた

## 本番安全ガード (Phase 4.8 で追加)

1. src/dev/promptAB.ts の冒頭に `import.meta.env.PROD` ガード
2. vite.config.ts で `/src/dev/` ディレクトリを本番ビルドから除外
3. `fetchBackendAPIv2` および `fetchBackendAPI` はプレースホルダ URL のまま本番起動するとエラーを投げる
4. `VITE_BACKEND_URL` 環境変数を `.env.example` に追加 (Phase 5 で値を設定)

## Phase 5.5 での削除予定

Phase 5.5 (プロバイダ抽象化 Gemini ↔ OpenAI 切替) 完了時に、以下のファイルごと削除する:

- `src/dev/promptAB.ts` (A/B/C 比較ツール)

以下の関数を削除する:

- `src/lib/api.ts`: `fetchPreviewAPI`, `fetchBackendAPI`, `buildHistory`, `fetchPreviewAPIv2`, `fetchBackendAPIv2`
- `src/lib/prompt.ts`: `buildSystemPrompt`, `buildChatMessages`

## Phase 5-2 後の状態（追記）

- フロントエンドの LLM 呼び出しは BFF (`POST {VITE_BACKEND_URL}`) 経由に統一済。
- `callLLMWithSampling` は BFF 経由の新実装に置き換え完了。`VITE_GEMINI_API_KEY` はフロント側では未使用になった。
- `isBackendUrlPlaceholder()` はプレースホルダー断片（`<subdomain>` 等）の部分一致検出に強化済。
- 以下の `@deprecated` 関数は Phase 5.5 で `src/dev/` ごと一括削除予定:
  - `fetchBackendAPI`, `fetchPreviewAPI`, `fetchBackendAPIv2`, `fetchPreviewAPIv2`, `buildHistory`
  - `toGeminiPayload`, `extractGeminiText`
  - `getBackendUrl()`, Gemini 直叩き関連定数（`GEMINI_MODEL`, `GEMINI_URL`, `DEFAULT_SAMPLING`, `RETRY_DELAYS`, `MAX_RETRIES`, `RETRYABLE_STATUSES`, `getGeminiApiKey`）
  - `src/lib/prompt.ts`: `buildSystemPrompt`, `buildChatMessages`

### Phase 5.5 チェックリスト（予告）

- [ ] `src/dev/promptAB.ts` および上記 `@deprecated` 関数群の削除
- [ ] Cloudflare Workers / ホスティング環境変数から `VITE_GEMINI_API_KEY` を削除
- [ ] `VITE_GEMINI_API_KEY` を `.env.example` からも削除

### 疎通確認 TODO（Phase 6.5 完了後に実施）

- [ ] Vite dev (`http://localhost:5173`) → BFF (`http://localhost:8787/oracle`) で 200 が返ること、Network タブで `/oracle` への POST のみ発生していること
- [ ] Capacitor 実機（iOS シミュレータ可）から `capacitor://localhost` Origin で BFF が 200 を返すこと

## Phase 5.5 完了後の状態

Phase 5.5 で、フロントエンドは BFF クライアントに完全に純化された。削除済み項目は以下のとおり。

### 削除済み関数・定数

- `src/lib/api.ts`
  - `fetchBackendAPI`
  - `fetchPreviewAPI`
  - `fetchBackendAPIv2`
  - `fetchPreviewAPIv2`
  - `buildHistory`
  - `toGeminiPayload`
  - `extractGeminiText`
  - `getGeminiApiKey`
  - `getBackendUrl`
  - `BACKEND_URL_PLACEHOLDER`
  - `GEMINI_MODEL`
  - `GEMINI_URL`
  - `DEFAULT_SAMPLING`
  - `RETRY_DELAYS`
  - `MAX_RETRIES`
  - `RETRYABLE_STATUSES`

### 削除済み型

- `src/types/index.ts`
  - `GeminiHistoryPart`
  - `GeminiHistoryEntry`
  - `GeminiPayload`
  - `GeminiResponseCandidate`
  - `GeminiResponse`

### 削除済みファイル

- `src/dev/promptAB.ts`

### Phase 5.5 以降にフロント側へ残すもの

- LLM 呼び出し入口: `callLLMWithSampling()`
- 二段階処理: `fetchOracleTwoStage()`
- タグ抽出: `extractTag()`
- プロバイダ非依存型: `ChatMessage`, `SamplingParams`, `BackendErrorResponse`, `KnownBackendErrorCode`, `BackendErrorCode`
