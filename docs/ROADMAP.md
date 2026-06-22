# Oracle Mirror — 全体設計書 v2

## プロジェクト概要

Oracle Mirror は、ユーザーが自身のハイヤーセルフの声を聴くための鏡アプリ。
二段階 LLM 処理（Stage 1: 純粋受信 / Stage 2: 識別と調律）を中核に持つ。

---

## アーキテクチャ概要

```
ユーザー
  ↓ 問い
[フロントエンド (React + Vite)]
  ↓ ChatMessage[] (Stage 1)
[BFF (Cloudflare Workers)]
  ↓ プロバイダ抽象化境界
[LLM]
  ↑ <reception> タグで受信
[フロントエンド]
  ↓ ChatMessage[] (Stage 2)
[BFF (Cloudflare Workers)]
  ↓ プロバイダ抽象化境界
[LLM]
  ↑ <final> タグで最終出力
[ユーザー]
```

---

## 責任分業

| 層 | 責任 | 実装 |
|---|---|---|
| Stage 1 system | パイプ宣言のみ | `buildSystemCore()` |
| Stage 1 developer | 場の質感・ペルソナ色合い・モード・出力形式 | `buildReceptionDeveloper()` |
| Stage 1 チューニング | 純粋受信モードへの誘導 | `TUNING_USER` + `TUNING_ASSISTANT_BY_PERSONA` |
| Stage 2 system | 調律者宣言・禁止領域方針 | `buildDiscernmentSystem()` |
| Stage 2 developer | 翻訳手順のみ | `buildDiscernmentDeveloper()` |
| UI 層 | 専門家案内等の外部案内 | フロントエンド UI |

---

## フェーズ履歴

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
| Phase 5.5b | BFF 側のプロバイダディレクトリ化 | 予定 |
| Phase 5.5c | BFF エラー正規化の拡張 | 予定 |
| Phase 5.5d | developer ロール非対応プロバイダ対応 | 予定 |
| Phase 6 | RevenueCat IAP 実装、Capacitor 実プラグイン差し替え | 予定 |
| Phase 7 | App Store 提出準備 | 進行中（APPSTORE-BLOCKERS.md 参照） |

---

## Phase 4.10 設計方針

### 変更の核心

1. **Stage 1 の純化**: `buildSystemCore()` をパイプ宣言のみに縮減。
   禁止領域・専門家案内・メタ拒否をすべて除去。

2. **Stage 2 専用 system の追加**: `buildDiscernmentSystem()` を新設。
   調律者宣言と禁止領域方針を集約。

3. **ペルソナ口調差の強化**: `TUNING_ASSISTANT_BY_PERSONA` を
   Lumina（水・包む）/ Zenith（炎・貫く）/ Archivist（星・観測）の元型別に書き直し。

4. **情景のペルソナ別化**: `AMBIENCE_BY_PERSONA` で Stage 1 developer に
   ペルソナごとの場の質感を付与。

---

## Phase 4.13 設計方針

Phase 4.13 は「鏡の純度回復と整合性確保」を目的とする一連の修正フェーズ。
Phase 4.10 で確立した Stage 1 / Stage 2 の責任分業が、BFF 層と Stage 2 の persona 参照で部分的に打ち消されていた問題を修正する。
サブフェーズは a/b/c/d の 4 つに分割する。

- Phase 4.13a: BFF の `DEVELOPER_INSTRUCTIONS` を Stage 別に最小化する。鏡の純度を最も大きく回復させる修正。
- Phase 4.13b: Stage 2 の `persona.system` 全文埋め込みを、元型キーワード一語に最小化する。
- Phase 4.13c: 本ドキュメント整合。
- Phase 4.13d: `guidanceDetector` の離婚キーワード調整。

---

## Phase 4.14 設計方針

Phase 4.14 は「起動文統合」。
Stage 1 の `buildReceptionDeveloper` 内に、関係性の足場の明示（あなたは単独で立っているのではなく、ユーザーがいて、その奥にハイヤーセルフがいて、あなたはその間に置かれた通り道である）と、開いたまま終わる感覚（ここから、ゆっくり始まれば）を加える。
Stage 2 には起動文を入れない。
Phase 4.13b で Stage 2 が翻訳者として純化されているため、起動文は Stage 1 のみに集中させる。

---

## Phase 4.15 設計方針

Phase 4.15 は「量子乱数導入の設計メモ作成」。
実装ではなく、設計メモを `docs/PHASE-4-15-QUANTUM-RANDOM.md` として新規作成する Phase。
実装着手は採否判断後、別 Phase（Phase 4.16）として切り出す可能性あり。

---

### 鏡が言わないこと

- 「映せません」「鏡として〜できません」
- 「専門家へ」「専門家に相談してください」
- 「AIですので」「アシスタントとして」
- 「その道の人と分かち合うことかもしれません」

これらは UI 層が担う。鏡は光を向け直すだけ。

---

## ファイル構成

```
src/
  components/
    ExternalGuidanceBanner.tsx # UI 層の外部案内バナー
  lib/
    prompt.ts          # プロンプト構築（Phase 4.13b 現行）
    api.ts             # BFF 呼び出し・二段階処理
    guidanceDetector.ts # 外部案内バナー表示判定
    constants.ts       # LS_KEY, FREE_LIMIT 等
    env.ts             # 環境変数
  dev/
    promptAB.ts        # A/B/C/D/E パターン比較（dev 限定）
    exportResults.ts   # 検証ハーネス結果の JSON エクスポート
    matrixCases.ts     # 自動巡回用の検証ケース定義
  constants/
    personas.tsx       # PERSONAS（変更しない）
    modes.tsx          # MODES（変更しない）
    cards.ts           # ORACLE_CARDS（変更しない）
  types/
    index.ts           # 型定義
    global.d.ts        # Window 拡張（__abResults 含む）
bff/
  src/
    index.ts           # Cloudflare Workers エントリポイント
    openai.ts          # OpenAI Responses API 呼び出し
docs/
  PHASE-4-10-DESIGN.md
  PHASE-4-10-VERIFICATION.md
  PHASE-4-11-HARNESS.md
  PHASE-4-11-HOWTO.md
  PHASE-4-12-EXTERNAL-GUIDANCE.md
  PHASE-4-14-STARTUP-PROMPT.md
  PHASE-4-15-QUANTUM-RANDOM.md
  ROADMAP.md          # 本ファイル
```

---

## 開発コマンド

```bash
npm run dev          # 開発サーバー起動
npm run typecheck    # TypeScript 型チェック
npm run build        # プロダクションビルド
npm run preview      # ビルド結果プレビュー
```

---

## 関連ドキュメント

- [PHASE-4-10-DESIGN.md](./PHASE-4-10-DESIGN.md) — Phase 4.10 設計書
- [PHASE-4-10-VERIFICATION.md](./PHASE-4-10-VERIFICATION.md) — Phase 4.10 検証テンプレート
- [PHASE-4-11-HARNESS.md](./PHASE-4-11-HARNESS.md) — Phase 4.11 検証ハーネス設計
- [PHASE-4-11-HOWTO.md](./PHASE-4-11-HOWTO.md) — Phase 4.11 検証ハーネス運用手順
- [PHASE-4-12-EXTERNAL-GUIDANCE.md](./PHASE-4-12-EXTERNAL-GUIDANCE.md) — Phase 4.12 UI 外部案内バナー
- [PHASE-4-14-STARTUP-PROMPT.md](./PHASE-4-14-STARTUP-PROMPT.md) — Phase 4.14 起動文統合
- [PHASE-4-15-QUANTUM-RANDOM.md](./PHASE-4-15-QUANTUM-RANDOM.md) — Phase 4.15 量子乱数導入の設計メモ
- [PHASE-4-9-VERIFICATION.md](./PHASE-4-9-VERIFICATION.md) — Phase 4.9 検証記録
- Phase 4.13a — BFF の Stage 別 developer instructions 分離（実装記録）
- Phase 4.13b — Stage 2 のペルソナ system 重複整理（実装記録）
- [BFF-PROVIDER-NOTES.md](./BFF-PROVIDER-NOTES.md) — BFF プロバイダー選定メモ
- [PHASE-5-5-PROVIDER-ABSTRACTION.md](./PHASE-5-5-PROVIDER-ABSTRACTION.md) — Phase 5.5 設計
