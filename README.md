🤖 開発者・AI エージェントは作業前に必ず [AGENTS.md](./AGENTS.md) を参照してください。

Oracle Mirror

純粋な鏡を通じて内なる声を聞く、神託対話アプリ。

現在の状態

Phase 0(エージェント運用基盤整備)完了。  
Phase 1(Vite + React + TypeScript 移行)完了。  
次は Phase 2(Capacitor 統合)。

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
├── index.html
├── package.json
├── tsconfig.json
├── vite.config.ts
├── src/
│   ├── main.tsx
│   ├── App.tsx        # Phase 4 で TS 化予定(現在 @ts-nocheck)
│   └── vite-env.d.ts
└── ios/               # Phase 2 で生成予定
```

進行中のフェーズ

Phase 1 完了。次は Phase 2(Capacitor 統合)。
