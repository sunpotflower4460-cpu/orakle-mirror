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
  ↓ OpenAI Responses API
[LLM]
  ↑ <reception> タグで受信
[フロントエンド]
  ↓ ChatMessage[] (Stage 2)
[BFF (Cloudflare Workers)]
  ↓ OpenAI Responses API
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
| Phase 3 | コンポーネント分割 (App.tsx → MainApp.tsx + components/) | 完了 |
| Phase 4.5 | 4層プロンプト構造 | 完了 |
| Phase 4.6 | 二段階処理導入 (Stage 1 / Stage 2) | 完了 |
| Phase 4.7 | TypeScript strict 化 | 完了 |
| Phase 4.8 | クリーンアップ | 完了 |
| Phase 4.9 | Stage 1 チューニング往復 | 完了 |
| Phase 4.10 | プロンプト責任分業の整理 + ペルソナ口調差の強化 | **進行中** |
| Phase 4.11 | 検証ハーネス自動巡回・JSON エクスポート | 予定 |
| Phase 4.12 | Stage 2 調律精度チューニング | 予定 |
| Phase 5.1 | BFF: Cloudflare Workers + OpenAI Responses API | 完了 |
| Phase 5.5 | プロバイダー抽象化 / `buildAmbiencePriming` 等の物理削除 | 予定 |
| Phase 6 | Capacitor iOS 実プラグイン差し替え | 予定 |
| Phase S-1 | Self Reading data foundation | 完了 |
| Phase S-2 | Self Reading view shell and sidebar entry | 完了 |
| Phase S-3 | Self Reading shuffle / deal / flip animation | 完了 |
| Phase S-4 | Self Reading result display | 完了 |
| Phase S-5 | Self Reading custom card creator | 完了 |
| Phase S-6 | Self Reading 申請ドキュメント・プライバシー記述反映 | 完了 |
| Phase S-8 | Self Reading 自作カード専用デッキ連携 | 完了 |
| Phase S-9 | Self Reading Deck 2「内なる天気 24」実装 | 完了 |

---

## Phase S follow-ups

- Custom cards are available as a dedicated local deck and are not mixed into Classic 48.
- Deck 2 is available as the bundled local Inner Weather 24 deck.
- Deck 3 bundled content remains a preparation-state placeholder.
- Optional Self Reading history UI if persistence is implemented later.
- Optional “AI Mirror に送る” handoff (future; currently disabled / not implemented).
- App Store screenshots/checklist and iOS device QA.

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
  lib/
    prompt.ts          # プロンプト構築（Phase 4.10 現行）
    api.ts             # BFF 呼び出し・二段階処理
    constants.ts       # LS_KEY, FREE_LIMIT 等
    env.ts             # 環境変数
  dev/
    promptAB.ts        # A/B/C/D/E パターン比較（dev 限定）
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
- [PHASE-4-9-VERIFICATION.md](./PHASE-4-9-VERIFICATION.md) — Phase 4.9 検証記録
- [BFF-PROVIDER-NOTES.md](./BFF-PROVIDER-NOTES.md) — BFF プロバイダー選定メモ
- [PHASE-5-5-PROVIDER-ABSTRACTION.md](./PHASE-5-5-PROVIDER-ABSTRACTION.md) — Phase 5.5 設計
