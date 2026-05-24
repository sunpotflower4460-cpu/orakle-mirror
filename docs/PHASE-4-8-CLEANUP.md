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

## 本番コードからの参照状況

- 本番コード (src/MainApp.tsx、src/App.tsx) からの参照: 0 件
- src/dev/promptAB.ts からの参照のみ (A/B/C 比較用途)
- src/dev/ は vite.config.ts で本番ビルドから除外されている

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
