🤖 開発者・AI エージェントは作業前に必ず [AGENTS.md](./AGENTS.md) を参照してください。

# Oracle Mirror

純粋な鏡を通じて内なる声を聞く、神託対話アプリ。

## 現在の状態

### 完了済み

- Phase 0〜4.14: 基盤、型安全化、二段階受信処理、プロンプト責任分業、検証ハーネス、安全網、起動文統合
- Phase 4.15 / 4.16: 量子乱数設計・実装（BFF QRNG + rejection sampling + crypto フォールバック）
- Phase 5.1 / 5.5a / 5.5b: Cloudflare Workers BFF、OpenAI Responses API、プロバイダ抽象化境界
- Phase S-1〜S-11: Self Reading Beta（デッキ枠、1/2/3枚、演出、自作カード、明示保存履歴、最終監査）
- Phase U: iPhone / iPad Universal のWebレイアウト対応
- Phase A: deprecated整理と、AIへ渡さない並走キーワード層
- Phase Q: 安全網ja/en、a11y改善、ESLint導入、ビルド衛生
- Phase L: QRNG待ち時間短縮、抽選先行起動、Stage 2ストリーミングとタイプ表示

### 部分実装・実サービス設定待ち

- Phase 6 RevenueCat: iOS実プラグイン、configure、Offering取得、購入、復元、`premium` entitlement判定、起動時およびフォアグラウンド復帰時の再同期までコード結線済み
- 残り: RevenueCat / App Store Connectの商品設定、Public SDK key、Sandbox実機確認

### 現在の主フェーズ

- Phase 7: App Store提出準備（`APPSTORE-BLOCKERS.md` 参照）
- Phase 5.5c / 5.5d は将来対応
- Deck 2 / Deck 3 は後から本文を追加するための空枠

## プロジェクト構成

- React + Vite + TypeScript
- Capacitor（iOS優先、iPhone / iPad Universal）
- LLM API（Cloudflare Workers BFF経由）
- OpenAI Responses API（Stage 2はSSEストリーミング対応）
- QRNG（ANU、失敗時は `crypto.getRandomValues()`）
- RevenueCat（ネイティブ実プラグイン / Webモック分岐）
- Self Reading（端末内のみのカードドロー / 自作カード / 明示保存履歴）

## 開発フロー

1. 各フェーズを GitHub Issue として作成
2. クラウドエージェント（Claude Code / Cursor 等）に Issue を割り当て
3. PRレビュー後、人間が手動マージ
4. 詳細は AGENTS.md を参照

## ライセンス

未定

## セットアップ

### 必要環境

- Node.js 20 系（`.nvmrc` 参照）
- npm 10 系

### インストール

```bash
npm install
```

### 環境変数

```bash
cp .env.example .env.local
```

`.env.local` に App Store readiness 用の公開 Vite 環境変数を設定します。必要な値は [App Store Environment Setup](./docs/APP-STORE-ENV-SETUP.md) を参照してください。

### 開発サーバー起動

```bash
npm run dev
```

http://localhost:5173 でアクセス。

### 検証

```bash
npm run typecheck
npm run build
npm run lint
npm run test:entropy
npm run test:keywords
npm run test:streamtext
npm run appstore:check
```

`appstore:check` は、実際の `.env.local`、法的URL、サポート窓口、BFF URL、RevenueCat Public SDK keyが未設定の間は意図的に失敗します。

## 主要ディレクトリ

```text
.
├── AGENTS.md
├── README.md
├── APPSTORE-BLOCKERS.md
├── capacitor.config.ts
├── bff/
│   └── src/
│       ├── index.ts
│       ├── random.ts
│       └── providers/
├── docs/
├── ios/
├── scripts/
└── src/
    ├── MainApp.tsx
    ├── components/
    │   ├── ExternalGuidanceBanner.tsx
    │   ├── OracleBubble.tsx
    │   ├── StreamingBubble.tsx
    │   └── SubscribeModal.tsx
    ├── constants/
    │   ├── cards.ts
    │   ├── decks.ts
    │   ├── keywords.ts
    │   ├── modes.tsx
    │   └── personas.tsx
    ├── features/
    │   └── selfReading/
    ├── i18n/
    ├── lib/
    │   ├── api.ts
    │   ├── entropy.ts
    │   ├── prompt.ts
    │   └── selfReadingStorage.ts
    ├── styles/
    └── types/
```

## 多言語対応（i18n）

グローバル展開に向けて、UI文言を型安全な自前i18n基盤で管理しています（外部ライブラリ非依存）。

- 辞書: `src/i18n/locales/ja.ts`（正準）と `en.ts`
- `ja.ts` のキー集合が `MessageKey` 型となり、他ロケールの欠落キーは型エラー
- 既定言語: 端末言語が日本語なら `ja`、それ以外は `en`
- ユーザー選択は Capacitor Preferences の `app_locale` に保存
- 神託応答そのものの言語はUI辞書とは別管理

対応言語は現状 **日本語 / 英語** です。

## iOS ビルド手順

### 前提環境

- macOS
- Xcode 15 以降
- CocoaPods
- Node.js 20 系

### 初回セットアップ

```bash
npm install
npm run build
npx cap sync ios
```

### 開発サイクル

```bash
npm run ios:sync
npm run ios:open
```

Xcodeで:

1. Appターゲットを選択
2. Signing & Capabilitiesで開発チームを選択
3. Simulatorまたは実機を選んでRun

### よくあるトラブル

- `pod install` が失敗する: `cd ios/App && pod repo update && pod install`
- ビルドキャッシュが原因のエラー: `npx cap sync ios --force`
- Module not found 系: `cd ios/App && pod install`
- 実機で「信頼されていない開発者」エラー: 設定 → 一般 → VPNとデバイス管理 から開発者を信頼
