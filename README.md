🤖 開発者・AI エージェントは作業前に必ず [AGENTS.md](./AGENTS.md) を参照してください。

Oracle Mirror

純粋な鏡を通じて内なる声を聞く、神託対話アプリ。

現在の状態

Phase 0(エージェント運用基盤整備)完了。  
Phase 1(Vite + React + TypeScript 移行)以降は順次対応予定。

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
