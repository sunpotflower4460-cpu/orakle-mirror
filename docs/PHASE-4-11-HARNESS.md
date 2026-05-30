# Phase 4.11 Harness

## 目的

Phase 4.10 のプロンプト変更を、3ペルソナ × 2モード × 5ケース = 30セルでまとめて確認するための dev 専用ハーネスです。  
JSON / CSV export により、Notion / Excel / スプレッドシートで比較と記録を行えます。

## 使い方

開発サーバー上の DevTools で実行します。

```ts
await runFullMatrix();
exportMatrixAsJSON();
exportMatrixAsCSV();
```

結果は `window.__matrixResults` にも保持されます。

## オプション

待機時間は `sleepMs` で調整できます。

```ts
await runFullMatrix({ sleepMs: 2500 });
```

- デフォルト: `1500`
- API の負荷やレート制御が気になる場合は長めに設定してください

## 出力形式

`MatrixResultRow` は次の列を持ちます。

- `cellIndex`: 1 から始まるセル番号
- `personaId`: `lumina` / `zenith` / `archivist`
- `modeId`: `pure` / `card`
- `caseId`: `case-1` 〜 `case-5`
- `query`: そのセルで使った問い
- `ePatternRaw`: Phase 4.10 現行構造の Stage 1 raw
- `ePatternFinal`: Phase 4.10 現行構造の Stage 2 final
- `startedAt`: 実行開始時刻 (ISO 8601)
- `finishedAt`: 実行終了時刻 (ISO 8601)
- `durationMs`: そのセルの実行時間
- `errorMessage`: エラー時のみメッセージを格納

## 観察項目

- 鏡が「専門家へ」などの外部案内を口にしていないか
- 医療・法律・財務・命系 query で本質に光を向け直せているか
- ペルソナごとの口調差が出ているか
- 「お答えします」などの構えが出ていないか
- 余白・沈黙が保たれているか

## CSV を Notion / スプレッドシートに取り込む

1. `exportMatrixAsCSV()` を実行して CSV を保存する
2. Notion / Excel / Google スプレッドシートで import を選ぶ
3. UTF-8 CSV として読み込む
4. `personaId` / `modeId` / `caseId` で並び替えて比較する

## トラブルシューティング

### `runFullMatrix is not defined`

- `npm run dev` で開発サーバーを起動しているか確認してください
- 本機能は `import.meta.env.DEV` が `true` のときだけ `window` に公開されます

### export しても何も出ない

- 先に `await runFullMatrix()` を完了させてください
- 結果は `window.__matrixResults` に保存されます

### 一部セルが失敗する

- エラーは `errorMessage` に記録され、処理は継続します
- レート制御が疑われる場合は `sleepMs` を増やして再実行してください
