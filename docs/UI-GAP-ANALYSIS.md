# Oracle Mirror UI Gap Analysis (P0)

このドキュメントは Issue「【UI/UX】Oracle Mirror を理想モックの質感へ寄せる — まず環境差の切り分けから」の **PR-1（環境切り分け）** 用です。  
実装を増やす前に、同一ビルドを環境別に比較し、残った差分だけを実装対象にします。

## 0. 参照素材の確認

- [ ] Current Screenshots（画像1〜3）
- [ ] Ideal References（画像4〜9）
- [ ] Capacitor iOS スクショ
- [ ] PWA standalone スクショ

> 環境診断は継続するが、環境非依存で確定している P0 差分（中央オーブ共通化、影の純度調整）は画像が完全に揃う前でも先行してよい。

## 1. 比較環境（同一ビルド）

- モバイル Safari / workers.dev
- Capacitor iOS ネイティブ（`npm run ios:run`）
- PWA standalone

### 環境差ログ（console）

起動後に `window.__oracleMirrorDiagnostics` が自動でセットされる。  
各環境で以下を実行し、Issue コメントに貼る。

```js
window.__oracleMirrorDiagnostics
```

確認項目:

- `isNativePlatform` / `isStandalone`
- `supports.backdropFilter`
- `supports.mixBlendMode`
- `supports.dvh`
- `safeArea`（`--sat` / `--sar` / `--sab` / `--sal`）
- `prefersReducedMotion`

## 2. 現状コード上の着地点（切り分け対象）

- safe-area 変数: `src/styles/globals.ts`
- shell 背景ノイズ + オーロラ + blend: `src/styles/globals.ts`
- ヘッダー/入力欄/サイドバーの glass + `backdrop-filter`: `src/MainApp.tsx`
- onboarding の霧背景 + glass card: `src/components/Onboarding.tsx`
- iOS 側 shell 設定（StatusBar / contentInset / Keyboard）: `capacitor.config.ts`
- viewport-fit: `index.html`

## 3. 理想モックとの差分（ネイティブ基準で記入）

- [ ] 背景の霧 / 桃色の空気感
- [x] 中央オーブの宝石感 / 水面反射（`OracleOrb` で Home / Onboarding / Sidebar empty state を共通化）
- [x] モードセグメントのネイビー質感（`--om-cta-shadow` のリムライト／ローズグローで霧に馴染ませた）
- [x] ペルソナカードの存在感 / 余白（カード / ヘッダー / ペルソナチップの影を `--om-shadow-*` 系へ寄せ始めた）
- [ ] アーカイブ空状態の神殿感 / 水面感（要承認Bのため未着手）
- [x] CTA の濃紺グラデーション / リムライト（`.om-cta` と `--om-cta-shadow` で Onboarding / 購読 / 送信 / Self Reading を共通化）
- [x] タイポグラフィの格調（Web Font は未導入。antialiased / selection / プレースホルダを既存明朝スタック上で整えた）
- [ ] safe-area / status bar / home indicator 付近

## 4. 実装対象の対応表（承認前提）

| 差分 | 触る予定のファイル / class / component | 変更方針 | 優先度 | 承認要否 |
|---|---|---|---|---|
| 環境差（workers.dev ブラウザバー） | `index.html`, 配布手順 | CSS改修より先に表示器差を切り分ける | P0 | 不要 |
| `backdrop-filter` 弱い環境のフォールバック | `src/styles/globals.ts` | `@supports not` でヘッダー / 入力欄 / モーダルに補助不透明度のみ追加 | P1 | 実施済み |
| CTA / モードインジケータのリムライト | `src/styles/globals.ts` `.om-cta` | 濃紺縦グラデ + 白リム + 極薄ローズグロー。色そのものは不変 | P1 | 実施済み |
| 言語トグルの発光カプセル | `src/components/LanguageToggle.tsx` | Onboarding / Help で溝の中を滑る共通トグル。Help では sticky header に固定し、フッター CTA と重ならない | P2 | 実施済み |
| ダイアログの背面操作漏れ | `src/lib/useDialogChrome.ts` | Tab 循環をコンテナ自身からも引き戻す。背面 inert + body スクロールロック。購入中は Escape / オーバーレイ閉じを抑止 | P1 | 実施済み |
| safe-area 差分 | `src/styles/globals.ts`, `src/MainApp.tsx`, `capacitor.config.ts` | 実機値を見て不足分のみ調整 | P0 | 不要 |
| 中央オーブの統一（Onboarding/Home/Sidebar） | `src/components/OracleOrb.tsx`, `src/components/Onboarding.tsx`, `src/MainApp.tsx` | 既存表現を共通化し、グロウ / ハイライト / 鏡像反射 / 白エッジ / 控えめな虹揺れを追加 | P0 | 不要 |
| 影の純度調整（カード / ヘッダー / ペルソナチップ） | `src/MainApp.tsx`, `src/components/Onboarding.tsx`, `src/styles/globals.ts` | `--om-shadow-soft` / `--om-shadow-card` ベースへ寄せ、黒影を増やさない | P0 | 不要 |
| ペルソナ配置変更 | `src/MainApp.tsx` | 情報設計変更のため提案のみ | P1 | **要承認A** |
| アーカイブ空状態の水面化 | `src/MainApp.tsx` | 大きな見た目変更のため提案のみ | P1 | **要承認B** |
| Web Font 導入 | N/A | 現時点では実施しない | P2 | **要承認C** |
