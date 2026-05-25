# Phase 4.11 実機検証手順

## 前提

- Phase 4.11 までマージ済みであること
- .env.local に VITE_GEMINI_API_KEY が設定されていること
- Node 20、npm 10 環境

## 手順

### 1. 開発サーバー起動

```bash
npm install
npm run dev
```

ブラウザで http://localhost:5173 を開く。

### 2. ブラウザコンソールを開く

Chrome/Safari の DevTools を起動し、Console タブへ移動。

### 3. 30セル自動巡回を実行

```js
const result = await runFullMatrixVerification();
```

コンソールに進捗ログが流れる（`[1/30] persona=lumina mode=pure case=短い悩み` のような形式）。  
完了まで API 呼び出しが約 30 × 2(C/D) × 2(Stage1/Stage2) = 120 回発生する。  
体感所要時間: 5〜15 分（Gemini のレートと回線依存）。

### 4. 結果ダウンロード

```js
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

## トラブルシューティング

### runFullMatrixVerification is not defined と出る

- 本番ビルドで実行している可能性。npm run dev で起動した開発サーバーで実行すること。
- もしくは import.meta.env.DEV が false になっている。.env.local の NODE_ENV を確認。

### API レートリミット(429)が出る

- Gemini の無料枠は分間60リクエスト程度。30セル巡回中に上限到達することがある。
- continueOnError: true がデフォルトなので、失敗セルは error フィールドに記録され、次セルへ進む。
- 完了後、失敗セルのみ再実行する手段は本フェーズでは未実装。失敗が多い場合は時間を空けて再実行。

### 一部セルだけ実行したい

- 現在は30セル一括のみ。個別実行が必要な場合は手動で buildReceptionMessages 等を呼ぶ。
