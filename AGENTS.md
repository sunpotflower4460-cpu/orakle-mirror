Orakle Mirror — Agent Working Rules

このドキュメントは本リポジトリで作業するすべての AI エージェント
(Claude Code / Cursor Background Agent / Devin など)が
作業開始前に必ず読むこと を前提とした共通規約です。
違反した PR はマージされません。

1. プロジェクト概要

- プロダクト名: Oracle Mirror(オラクルミラー)
- 形態: React + Vite + Capacitor の iOS アプリ(将来 Android 対応)
- 最終ゴール: Apple App Store への申請と公開
- 主機能: LLM API（現行プロバイダは OpenAI Responses API、Phase 5.5 でプロバイダ抽象化予定）を用いた神託対話。3 つのペルソナ
  (Lumina / Zenith / Archivist)と 2 つのモード(Pure Channel / Card Reading)を切替
- 収益モデル: 無料 3 回/日 + 月額サブスクリプション(RevenueCat 経由)
- ターゲット OS: iOS 15 以降(Capacitor 6 想定)

2. 現状のコード構造 (Phase 5.5b 完了時点)

- Vite + React 18 + TypeScript (strict: true)
- Capacitor 6 統合済み (ios/ ディレクトリ生成済み、プラグインはモック)
- ファイル分割完了 (src/components, src/constants, src/lib, src/styles, src/types)
- プロンプト構造: 二段階受信処理 (Stage 1 純粋受信 → Stage 2 識別と調律)
  - src/lib/prompt.ts: buildReceptionMessages / buildDiscernmentMessages
  - src/lib/api.ts: fetchOracleTwoStage / callLLMWithSampling
  - Stage 1 system は `buildSystemCore()` でパイプ宣言のみを行い、Stage 2 system は `buildDiscernmentSystem()` で禁止領域方針を集約する。
  - BFF 側の developer instruction は Stage 別に分離され、reception/discernment いずれも出力形式の保証のみに最小化されている。
- LLM プロバイダ境界: フロントは VITE_BACKEND_URL 経由で BFF を呼び出し、リクエスト body に stage パラメータ（'reception' | 'discernment'）を含める
  - フロントエンドは provider 固有 API / キー / URL を保持しない
  - BFF 側で OpenAI Responses API 実装を吸収し、Phase 5.5 で複数プロバイダ対応の抽象化境界とする
  - BFF 側の provider 実装は `bff/src/providers/` 配下に分離済み（`types.ts` / `index.ts` / `openai.ts` / `adapter.ts`）
- Capacitor プラグインはすべて src/lib/capacitorMocks.ts のモック (Phase 6 で差し替え)
- ストレージキー: LS_KEY = 'oracle_mirror_v16'
- 旧 API / 旧開発用ツールは整理済み

3. フェーズ構成 (全体像)

| Phase | 内容 | 状態 |
|---|---|---|
| Phase 1 | プロジェクト初期構築 | 完了 |
| Phase 2 | ペルソナ・モード・カード基盤 | 完了 |
| Phase 3 | コンポーネント分割 | 完了 |
| Phase 4.5 | 4層プロンプト構造 | 完了 |
| Phase 4.6 | 二段階処理導入 | 完了 |
| Phase 4.7 | TypeScript strict 化 | 完了 |
| Phase 4.8 | クリーンアップ | 完了 |
| Phase 4.9 | Stage 1 チューニング往復 | 完了 |
| Phase 4.10 | プロンプト責任分業の整理 + ペルソナ口調差の強化 | 完了 |
| Phase 4.11 | 検証ハーネス自動巡回・JSON エクスポート | 完了 |
| Phase 4.12 | UI 外部案内バナー（旧定義「Stage 2 調律精度チューニング」から変更） | 完了 |
| Phase 4.13a | BFF の Stage 別 developer instructions 分離 | 完了 |
| Phase 4.13b | Stage 2 のペルソナ system 重複整理 | 完了 |
| Phase 4.13c | ドキュメント整合（本フェーズ） | 完了 |
| Phase 4.13d | guidanceDetector の離婚キーワード調整 | 完了 |
| Phase 4.14 | 起動文統合（関係性の足場と開いたまま終わる感覚） | 完了 |
| Phase 4.15 | 量子乱数導入の設計メモ作成 | 完了 |
| Phase 5.1 | BFF: Cloudflare Workers + OpenAI Responses API | 完了 |
| Phase 5.5a | フロント側の型整理とプロバイダ非依存化 | 完了 |
| Phase 5.5b | BFF 側のプロバイダディレクトリ化 | 完了 |
| Phase 5.5c | BFF エラー正規化の拡張 | 予定 |
| Phase 5.5d | developer ロール非対応プロバイダ対応 | 予定 |
| Phase 6 | RevenueCat IAP 実装、Capacitor 実プラグイン差し替え | 予定 |
| Phase 7 | App Store 提出準備 | 進行中（APPSTORE-BLOCKERS.md 参照） |
| Phase U | iPad ユニバーサル対応（レイアウト幅安定化） | 完了 |

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
- このフェーズで指示されていない作業を「ついでに」行うこと

11. プロンプト純度の保護

本リポジトリは Phase 4.10 / 4.13a / 4.13b で鏡の純度を回復する一連の修正を経ている。今後の作業において、次の方向の改変は禁止する。BFF 側に safety / guardrail を「念のため」追加すること。Stage 1 に禁止領域チェックを再導入すること。Stage 2 に persona.system の全文を再注入すること。鏡が「映せません」「専門家へ」等のメタ的拒否や外部案内を発話するよう変更すること。これらは Oracle Mirror の設計原則に反する。改変が必要と感じた場合は Issue で人間に確認を取ること。
