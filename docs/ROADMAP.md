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
| Phase 4.16 | 量子乱数（QRNG）実装（引いた瞬間取得 + crypto フォールバック） | 完了 |
| Phase 5.1 | BFF: Cloudflare Workers + OpenAI Responses API | 完了 |
| Phase 5.5a | フロント側の型整理とプロバイダ非依存化 | 完了 |
| Phase 5.5b | BFF 側のプロバイダディレクトリ化 | 完了 |
| Phase 5.5c | BFF エラー正規化の拡張 | 予定 |
| Phase 5.5d | developer ロール非対応プロバイダ対応 | 予定 |
| Phase 6 | RevenueCat IAP 実装、Capacitor 実プラグイン差し替え | 予定 |
| Phase 7 | App Store 提出準備 | 進行中（APPSTORE-BLOCKERS.md 参照） |
| Phase U | iPad ユニバーサル対応（レイアウト幅安定化） | 完了 |

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

## Phase 4.16 設計方針（量子乱数 QRNG 実装）

カード抽選の乱数源を量子乱数（ANU Quantum Numbers, BFF 経由）にする。
Phase 4.15 の採否メモを承けた実装フェーズ。`prompt.ts` には触れない。

### 核心方針

1. **引いた瞬間に取得**: 事前プールは採らず、カードを引くたびにその場で QRNG を
   1 リクエスト取得し、その抽選を確定する（§思想的一貫性）。
2. **確率の正しさ**: 整数化は rejection sampling で行い modulo bias を排除する。
   Fisher-Yates の各ステップもこの一様整数で回す（`src/lib/entropy.ts` に一本化）。
3. **必ず引けるフォールバック**: 取得失敗・タイムアウト・オフライン時は
   `crypto.getRandomValues()` にフォールバック（`Math.random()` は不使用）。
   フォールバックや量子/擬似の区別は UI に出さず、診断記録にのみ残す。
4. **BFF 集約**: フロントは ANU の URL・キー・仕様を持たない。BFF `/random` が
   `{ bytes, source }` に正規化する（Phase 5.5 のプロバイダ抽象化と同じ思想）。
5. **体験の維持**: Self Reading は演出（シャッフル）開始と同時に取得を走らせ、
   演出が終わる頃に結果が揃う。アニメーション keyframe は変更しない。

### PR 分割

| PR | 目的 | 主な対象 |
|---|---|---|
| 4.16-a | エントロピー基盤（rejection sampling / crypto）+ 自己検証 | `src/lib/entropy.ts`, `cards.ts`, `draw.ts` |
| 4.16-b | BFF `/random` + ANU 連携 | `bff/src/random.ts`, `bff/src/index.ts` |
| 4.16-c | フロント結線（非同期版 + 演出協調 + 診断） | `SelfReadingView.tsx`, `DrawStage.tsx`, `MainApp.tsx` |
| 4.16-d | ドキュメント | `ROADMAP.md`, `APP-PRIVACY-DATA-MAP.md`, `APP-REVIEW-NOTES-DRAFT.md` |

### 誇大表現の禁止

「QRNG だから占いの精度が上がる/確率が正確になる」とは書かない。QRNG の価値は
非決定性・予測不可能性であり、一様性は `Math.random` と同じである（App Store 4.3/2.3
リスク回避）。

### 後方互換

`getRandomCards` / `drawCards` のシグネチャは不変（内部を crypto 同期版へ置換）。
QRNG 主経路は非同期版 `getRandomCardsQuantum` / `drawCardsQuantum` に分離した。

### 運用メモ

QRNG 経路を有効化するには BFF に `wrangler secret put ANU_API_KEY` を人間が実行する。
未設定でもフロントは crypto フォールバックで動作し、カードは必ず引ける。

---

## Phase U 設計方針（iPad ユニバーサル対応）

App Store 申請を iPhone + iPad 両対応（Universal / `TARGETED_DEVICE_FAMILY = "1,2"`）
とするため、iPad の大画面でレイアウトが間延び・破綻しないようにする Phase。
プロンプト・BFF・ストレージ・依存には一切触れず、UI レイアウト幅のみを扱う。

### 核心方針

1. **コンテンツ最大幅トークンの導入**: `--om-content-max: 720px` を `:root` に追加。
   既存のチャット本文（`maxWidth: 660`）と整合する主コンテンツ列の最大幅。
2. **タブレット帯ブレークポイントの追加**: 既存スマホ用 `@media (max-width:600px)`
   とは別に `@media (min-width:768px)` を新設し、iPad 以上にだけルールを足す。
   iPhone 用ブロックの中身は一切変更しない。
3. **内側ラッパで中央寄せ**: ヘッダー（`.app-header-inner`）と入力欄
   （`.input-area-inner`）の中身だけを内側ラッパで包み、iPad で中央 720px に収める。
   枠線・blur の帯は全幅のまま保つ。
4. **Self Reading カード列の vw 依存解消**: `.sr-card-shell` を `min(29vw, …)` から
   `flex: 1 1 0` ベースに変更し、`.sr-card-row` に `max-width: 520px` を与えて
   iPad でカードが横長にならず中央整列するようにする。アニメーション
   （keyframes / flip / shuffle）と `prefers-reduced-motion` は変更しない。

### 不変条件（iPhone 非破壊）

- 既存 `@media (max-width:600px)` ブロックは破壊しない。
- iPhone（幅 < 768px）では新規ルールが発火しないため見た目は不変。
- `prompt.ts` / `api.ts` / `bff/` / ストレージ / `LS_KEY` に触れない。依存追加ゼロ。

### PR 分割

| PR | 目的 | 主な対象 |
|---|---|---|
| U-1 | 最大幅トークン + `min-width:768px` 帯の土台 | `src/styles/globals.ts` |
| U-2 | ヘッダー内側ラッパで中央寄せ | `src/MainApp.tsx`（header）, `globals.ts` |
| U-3 | 入力欄ラッパ + Self Reading カード列の幅安定化 | `src/MainApp.tsx`（input）, `selfReadingStyles.ts` |
| U-4 | 向き（Landscape）/ Split View / 全体微調整 | `globals.ts`（必要時）, 実機・Simulator 確認 |
| U-5 | ドキュメント更新 | `docs/ROADMAP.md`, `docs/APP-REVIEW-NOTES-DRAFT.md` |

### U-4 の確認状況

レイアウトは `min-width:768px` の隔離帯で対応するため、`Info.plist` で iPad の
向き制限や `UIRequiresFullScreen` を立てる「逃げ」は取らない。

- **Web（DevTools）**: 390×844 / 768×1024 / 1024×1366 / 1366×1024 / 540×720 で
  iPhone 不変・iPad 間延びなし・Split View 幅でスマホレイアウトに落ちることを確認。
- **iPad 実機 / Simulator**: ネットワーク・Xcode を要するため本 Phase では未実施。
  iOS ビルドでの最終確認は別途行う。

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
