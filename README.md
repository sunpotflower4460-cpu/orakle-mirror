🤖 開発者・AI エージェントは作業前に必ず [AGENTS.md](./AGENTS.md) を参照してください。

Oracle Mirror

純粋な鏡を通じて内なる声を聞く、神託対話アプリ。

現在の状態

- Phase 0 (エージェント運用基盤整備) 完了
- Phase 1 (Vite + React + TypeScript 移行) 完了
- Phase 2 (Capacitor 統合・iOS プロジェクト生成) 完了
- Phase 3 (ファイル分割) 完了
- Phase 4 (TypeScript 型定義整備) 完了
- Phase 4.5 (4 層プロンプト構造への移行) 完了
- Phase 4.6 (二段階受信処理: 純粋受信 → 識別と調律) 完了
- Phase 4.6.1 (ドキュメント同期と検証記録) 完了
- Phase 4.7 (TypeScript strict モード化) 完了
- Phase 4.8 (本番安全ガードと旧コード整理) 完了
- 次は Phase 5 (Cloudflare Workers BFF 構築)

プロジェクト構成(計画)

- React + Vite + TypeScript
- Capacitor(iOS 優先、Android 対応予定)
- Gemini API(BFF 経由、Phase 5 以降)
- RevenueCat(IAP、Phase 6 以降)

開発フロー

1. 各フェーズを GitHub Issue として作成
2. クラウドエージェント(Claude Code / Cursor 等)に Issue を割り当て
3. PR レビュー後、人間が手動マージ
4. 詳細は AGENTS.md を参照

ライセンス

(未定)`

セットアップ

必要環境

- Node.js 20 系(.nvmrc 参照)
- npm 10 系

インストール

```bash
npm install
```

環境変数

```bash
cp .env.example .env.local
```

.env.local に開発用の Gemini API キーを設定(本番ビルドでは使用されない)。

開発サーバー起動

```bash
npm run dev
```

http://localhost:5173 でアクセス。

ビルド

```bash
npm run build
```

dist/ に成果物が生成される。

型チェック

```bash
npm run typecheck
```

ディレクトリ構成

```text
.
├── AGENTS.md
├── README.md
├── capacitor.config.ts
├── docs/
│   ├── PHASE-4-6-VERIFICATION.md
│   └── PHASE-4-8-CLEANUP.md
├── index.html
├── package.json
├── tsconfig.json
├── tsconfig.node.json
├── vite.config.ts
├── ios/
└── src/
    ├── App.tsx
    ├── MainApp.tsx
    ├── main.tsx
    ├── vite-env.d.ts
    ├── components/
    │   ├── ErrorBoundary.tsx
    │   ├── HelpModal.tsx
    │   ├── OracleBubble.tsx
    │   ├── SubscribeModal.tsx
    │   └── Toast.tsx
    ├── constants/
    │   ├── cards.ts
    │   ├── modes.tsx
    │   └── personas.tsx
    ├── dev/
    │   └── promptAB.ts
    ├── i18n/
    │   ├── index.tsx
    │   └── locales/
    │       ├── ja.ts
    │       └── en.ts
    ├── lib/
    │   ├── api.ts
    │   ├── audio.ts
    │   ├── capacitorMocks.ts
    │   ├── clipboard.ts
    │   ├── constants.ts
    │   ├── env.ts
    │   ├── prompt.ts
    │   └── react-compat.ts
    ├── styles/
    │   └── globals.ts
    └── types/
        ├── global.d.ts
        └── index.ts
```

## 多言語対応 (i18n)

グローバル展開に向けて、UI 文言を型安全な自前 i18n 基盤で管理する(外部ライブラリ非依存)。

- 辞書: `src/i18n/locales/ja.ts`(正準)と `en.ts`。`ja.ts` のキー集合が `MessageKey` 型となり、他ロケールの欠落キーは型エラーになる。
- 使い方: コンポーネントで `const t = useT();` → `t('key')` / `t('key', { name })`。コンテキスト外(`ErrorBoundary`)は `translate(detectLocale(), key)` を使う。
- 既定言語: 端末言語が日本語なら `ja`、それ以外は `en`。ユーザーが選択した言語は Capacitor Preferences の `app_locale` に保存され、端末言語より優先される。手動切替はヘルプ(Mirror Guide)から。
- 新規言語の追加: `src/i18n/locales/<locale>.ts` を `en.ts` と同じ要領で追加し、`Locale` 型と `LOCALES` / `DICTIONARIES` に登録する。
- 補足: 神託応答そのものの言語(`constants/personas.tsx` の system / `lib/prompt.ts`)は本基盤の対象外。プロンプト多言語化は別フェーズで扱う。

対応言語は現状 **日本語 / 英語**。

## iOS ビルド手順

### 前提環境

- macOS(Apple Silicon 推奨)
- Xcode 15 以降
- CocoaPods(`sudo gem install cocoapods` または Homebrew)
- Node.js 20 系

### 初回セットアップ

```bash
npm install
npm run build
npx cap sync ios
```

### 開発サイクル

Web 側のコードを変更したあと、iOS シミュレータ/実機で確認する流れ:

```bash
npm run ios:sync    # Web ビルド + iOS への同期
npm run ios:open    # Xcode を起動
```

Xcode で:

1. App ターゲットを選択
2. Signing & Capabilities で開発チームを選択(Phase 2 時点では個人 Apple ID で可)
3. シミュレータ(iPhone 15 Pro など)または実機を選んで Run

### よくあるトラブル

- `pod install` が失敗する: `cd ios/App && pod repo update && pod install`
- ビルドキャッシュが原因のエラー: `npx cap sync ios --force` で再同期
- Module not found 系: `cd ios/App && pod install` を実行し直す
- 実機で「信頼されていない開発者」エラー: 設定 → 一般 → VPN とデバイス管理 から開発者を信頼
