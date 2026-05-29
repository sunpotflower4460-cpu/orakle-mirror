Orakle Mirror — Agent Working Rules

このドキュメントは本リポジトリで作業するすべての AI エージェント
(Claude Code / Cursor Background Agent / Devin など)が
作業開始前に必ず読むこと を前提とした共通規約です。
違反した PR はマージされません。

1. プロジェクト概要

- プロダクト名: Oracle Mirror(オラクルミラー)
- 形態: React + Vite + Capacitor の iOS アプリ(将来 Android 対応)
- 最終ゴール: Apple App Store への申請と公開
- 主機能: Gemini API を用いた神託対話。3 つのペルソナ
  (Lumina / Zenith / Archivist)と 2 つのモード(Pure Channel / Card Reading)を切替
- 収益モデル: 無料 3 回/日 + 月額サブスクリプション(RevenueCat 経由)
- ターゲット OS: iOS 15 以降(Capacitor 6 想定)

2. 現状のコード構造 (Phase 4.8 完了時点)

- Vite + React 18 + TypeScript (strict: true)
- Capacitor 6 統合済み (ios/ ディレクトリ生成済み、プラグインはモック)
- ファイル分割完了 (src/components, src/constants, src/lib, src/styles, src/types)
- プロンプト構造: 二段階受信処理 (Stage 1 純粋受信 → Stage 2 識別と調律)
  - src/lib/prompt.ts: buildReceptionMessages / buildDiscernmentMessages
  - src/lib/api.ts: fetchOracleTwoStage / callLLMWithSampling
- LLM プロバイダ境界: フロントは VITE_BACKEND_URL 経由で BFF を呼び出す
  - フロントエンドは provider 固有 API / キー / URL を保持しない
  - BFF 側で Gemini 実装を吸収し、将来の provider 切替境界とする
- Capacitor プラグインはすべて src/lib/capacitorMocks.ts のモック (Phase 6 で差し替え)
- ストレージキー: LS_KEY = 'oracle_mirror_v16'
- 旧 API / 旧開発用ツールは Phase 5.5 で削除済み

3. フェーズ構成 (全体像)

| Phase | 目的 | 状態 |
|-------|------|------|
| 0 | エージェント運用基盤の整備 | 完了 |
| 1 | Vite + React + TypeScript 移行 | 完了 |
| 2 | Capacitor 統合・iOS プロジェクト生成 | 完了 |
| 3 | ファイル分割 (ロジック変更なし) | 完了 |
| 4 | TypeScript 型定義整備 | 完了 |
| 4.5 | 4 層プロンプト構造 (system/developer/user/assistant) | 完了 |
| 4.6 | 二段階受信処理 (純粋受信 → 識別と調律) | 完了 |
| 4.6.1 | ドキュメント同期と検証雛形作成 | 完了 |
| 4.7 | TypeScript strict モード化 | 完了 |
| 4.8 | 本番安全ガードと旧コード整理 | 完了 |
| 5 | セキュリティ (API キー隠蔽・BFF 化) | 完了 |
| 5.5 | プロバイダ抽象化 (Gemini ↔ OpenAI 切替・旧コード削除) | 完了 |
| 6 | IAP 実装 (RevenueCat 実装差し替え) | 未着手 |
| 7 | 審査前クリーンアップ | 進行中 |
| 8 | CI/CD・リリース準備 | 未着手 |

4. 絶対ルール(違反禁止)

4.1 シークレット管理

- API キー、トークン、Secrets、証明書を コードにもコミット履歴にも残さない
- .env.local, .env.production などの実値ファイルは .gitignore に必ず含める
- 万一コミットしてしまった場合は作業を止めて Issue で即時報告する
- .env.example には キー名のみ を記載し、値は空にする

4.2 1 PR = 1 目的

- フェーズをまたぐ変更は禁止
- 「ついでにこれも直しました」も禁止。別 PR にする
- 1 PR の差分は原則 800 行以内を目標(超える場合は分割)

4.3 既存 UI 挙動の保持

- リファクタリングフェーズ(Phase 1〜4)中は、ユーザーから見える挙動を変えない
- UI 文言、色、アニメーション、操作感は維持
- 意図して変える場合は PR 説明に「UX 差分」セクションを必ず記載

4.4 データ互換性の保持

- LS_KEY(現状 oracle_mirror_v16)のバージョン番号を勝手に上げない
- 変更が必要な場合は事前に Issue で相談
- ストレージのスキーマ変更時は migration 関数を必ず書く
- 例外として Phase 7 で oracle_mirror_v1 にリセットする計画があるが、
  これは指示が出てから実施すること

4.5 依存追加の制限

以下以外の新規依存を追加する場合は事前承認を得ること:

- react, react-dom, lucide-react
- @capacitor/core, @capacitor/cli, @capacitor/ios
- @capacitor/preferences, @capacitor/share, @capacitor/splash-screen
- @capacitor/keyboard, @capacitor/status-bar, @capacitor/browser
- @revenuecat/purchases-capacitor(Phase 6 で導入)
- vite, @vitejs/plugin-react, typescript, @types/react, @types/react-dom

UI ライブラリ(MUI, Chakra, Tailwind 等)の追加は禁止。

4.6 既存仕様の保持

- LS_KEY = 'oracle_mirror_v16'
- FREE_LIMIT = 3
- MAX_ROOMS = 50
- ORACLE_CARDS の 48 枚の名前・意味
- PERSONAS(lumina / zenith / archivist)の id・名称・アクセントカラー
- MODES(pure / card)の id・名称
- これらを変更する場合は必ず Issue で事前相談

5. コーディング規約

- TypeScript: 段階的に TS 化。any は許容するが理由をコメント
- ファイル長: 1 ファイル 400 行を目安に分割
- 命名: 既存コードの命名規則に従う(camelCase、コンポーネントは PascalCase)
- コメント: 日本語可。意図と「なぜ」を書く(「何を」はコード自体が示す)
- i18n: 現状は日本語固定で OK。将来の i18n を見据えて文言は定数化推奨
- インデント: 既存コードに合わせて 2 スペース
- セミコロン: 既存コードに合わせて使用する
- クォート: シングルクォート優先(既存コード準拠)

6. ブランチ・コミット規約

- ブランチ名: /phase--
  - 例: feat/phase-3-split-files, fix/phase-5-tree-shake-preview-api
- type は feat, fix, refactor, chore, docs, test, ci から選ぶ
- コミットメッセージは Conventional Commits 推奨
  - 例: refactor(phase-3): split PERSONAS into constants/personas.tsx

7. PR テンプレート(全 PR 共通の必須セクション)

.github/PULL_REQUEST_TEMPLATE.md を使用する。記入必須項目:

- 変更概要(3 行以内)
- 対応 Issue / Phase
- UX 差分(変わらないなら「なし」と明記)
- 動作確認手順
- ロールバック手順
- チェックリスト全項目

8. 完了条件(全 PR 共通)

- npm run build が成功する(Phase 1 以降)
- npm run typecheck が成功する(Phase 4 以降)
- README または該当 docs を更新している
- PR テンプレートのすべての項目が埋まっている
- スクリーンショットを添付(UI に影響がある場合)

9. エスカレーション

判断に迷ったら 勝手に決めず Issue でコメントする。
特に以下は必ず人間に確認を取ること:

- 既存挙動を変える可能性のある変更
- 新規依存の追加
- ストレージキー・スキーマの変更
- セキュリティ・課金・認証に関わる変更
- App Store 審査ガイドラインに関わる UI / 文言変更
- 法的リンク先 URL の確定

10. 禁止行為

- main ブランチへの直接 push および force push
- 他人の PR を勝手にマージすること
- node_modules, dist, ios/App/Pods をコミットすること
- 大量の自動整形(Prettier 一括実行など)を機能変更と同じ PR に混ぜること
- このフェーズで指示されていない作業を「ついでに」行うこと`
