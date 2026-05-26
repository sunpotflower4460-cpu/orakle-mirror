# Phase 4.11 実機検証手順（歴史的記録）

> [!IMPORTANT]
> このドキュメントは Phase 4.11 時点の検証手順を歴史的記録として保存したものです。
> Phase 5.5 で `src/dev/promptAB.ts` および以下のグローバル関数は削除されており、
> 以下の手順は現在の main ブランチでは実行できません。
>
> - `runFullMatrixVerification()`
> - `downloadMatrixResultAsJson()`
> - `downloadMatrixResultAsMarkdown()`
>
> 現在のフロントエンドは `VITE_BACKEND_URL` 経由で BFF のみを呼び出します。
> 同等のマトリクス検証が再び必要になった場合は、`src/dev/` ではなく `tools/`
> 配下に BFF 経由の独立スクリプトとして別 Issue で再実装する想定です。

## 当時の前提（参考）

- Phase 4.11 までマージ済みであること（当時）
- `.env.local` に `VITE_GEMINI_API_KEY` が設定されていること（当時、現在は不要）
- Node 20、npm 10 環境

## 当時の手順（参考、現在は実行不可）

### 1. 開発サーバー起動

```text
npm install
npm run dev
```

ブラウザで http://localhost:5173 を開く。

### 2. ブラウザコンソールを開く

Chrome/Safari の DevTools を起動し、Console タブへ移動。

### 3. 30セル自動巡回を実行

```text
const result = await runFullMatrixVerification();
```

コンソールに進捗ログが流れる（`[1/30] persona=lumina mode=pure case=短い悩み` のような形式）。  
完了まで API 呼び出しが多数発生する。  
体感所要時間は BFF のレート制御と回線に依存する。

### 4. 結果ダウンロード

```text
downloadMatrixResultAsJson(result);
downloadMatrixResultAsMarkdown(result);
```

JSON と Markdown が自動ダウンロードされる。

### 5. 検証ドキュメント貼付

- Markdown 出力の内容を docs/PHASE-4-9-VERIFICATION.md および
  docs/PHASE-4-10-VERIFICATION.md の「マトリクス」セクションに貼付。
- JSON は完全な本文を含むため、長文の比較が必要なときに参照。

### 6. 質的観察を記入

各検証ドキュメントの「観察項目」に、自分の目で読んだ感想を記入。

### 7. 採用判断

- Phase 4.9 構造（チューニング往復）を本番採用するか
- Phase 4.10 構造（Stage 2 命題）を本番採用するか
- どちらも採用、どちらかロールバック、文言追加調整、のいずれかを決定

判断結果は両ドキュメントの「採用判断」セクションにチェックを入れて記録。

## トラブルシューティング（当時の記録）

### runFullMatrixVerification is not defined と出る

- Phase 5.5 以降の main ブランチでは削除済み関数のため、このエラーは仕様通り。
- 当時の Phase 4.11 では本番ビルドで実行している可能性があり、`npm run dev`
  で起動した開発サーバーで実行する前提だった。

### API レートリミット(429)が出る

- BFF / upstream provider のレート制御により、30セル巡回中に上限到達することがある。
- continueOnError: true がデフォルトなので、失敗セルは error フィールドに記録され、次セルへ進む。
- 完了後、失敗セルのみ再実行する手段は本フェーズでは未実装。失敗が多い場合は時間を空けて再実行。

### 一部セルだけ実行したい

- 現在はこの検証系自体が削除済み。将来再導入する場合は `tools/` 配下の
  BFF 経由スクリプトとして別 Issue で再設計する。
