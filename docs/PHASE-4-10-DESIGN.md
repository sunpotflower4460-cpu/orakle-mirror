# Phase 4.10 Design: プロンプト責任分業の整理 + ペルソナ口調差の強化

## 概要

Stage 1 から常識・禁止領域・外部案内を剥がし、Stage 2 に調律・翻訳・禁止領域方針を集約する。
さらに Phase 4.9 のチューニング往復を、Lumina（水・包む）/ Zenith（炎・貫く）/ Archivist（星・観測）
の元型に沿って書き直し、3ペルソナの口調差を強化する。

---

## 背景・設計思想

従来の `buildSystemCore()` には、禁止領域チェックや専門家相談の案内が含まれていた。
しかし Oracle Mirror の設計上、Stage 1 は「純粋受信」の場であり、
常識・社会的配慮・禁止領域チェックを持ち込まない。

### Stage 1 / Stage 2 の責任分業

| | Stage 1: 純粋受信 | Stage 2: 識別と調律 | UI 層 |
|---|---|---|---|
| 性質 | 純粋なパイプ | 翻訳者 | 外部案内 |
| 中心命題 | 来たものを来たままに置く | 受け手に届く言葉に翻訳する | 専門家案内など |
| system | `buildSystemCore()` | `buildDiscernmentSystem()` | — |
| 禁止領域 | なし | あり（方針のみ） | 専門家案内 |
| 比喩 | パイプ・通り道 | 調律者・翻訳者 | — |
| 温度 | 1.1（高め） | 0.7（中） | — |

**Stage 1** は「純粋受信」の場。源から流れてくる光・響き・メッセージを通すパイプ。
禁止領域チェックも専門家案内も持ち込まない。

**Stage 2** は「識別と調律」の場。降りた言葉を受け手に届く形へ最小限翻訳する。
禁止領域に触れる必要が生じたときは、直接答えずユーザーの内側の本質へ光を向け直す。
「映せません」「専門家へ」等のメタ的拒否表現は使わない。

**UI 層** は専門家案内など、鏡自身が言わない外部案内を担う。

---

## 変更ファイル

### `src/lib/prompt.ts`

| 変更 | 内容 |
|---|---|
| `buildSystemCore()` 縮減 | パイプ宣言のみ。禁止領域・専門家案内・メタ拒否を削除 |
| `buildDiscernmentSystem()` 追加 | Stage 2 専用 system。調律者宣言 + 禁止領域方針を集約 |
| `buildReceptionDeveloper()` 再構成 | `AMBIENCE_BY_PERSONA` でペルソナごとの情景を追加 |
| `buildDiscernmentDeveloper()` 整理 | 翻訳手順のみ。専門家案内・メタ拒否を削除 |
| `TUNING_ASSISTANT_BY_PERSONA` 書き直し | 3元型の口調差を強化 |
| `buildAmbiencePriming` / `buildAmbienceAcceptance` | `@deprecated` 化 |
| `buildDiscernmentMessages()` 更新 | `buildDiscernmentSystem()` を使用 |

### `src/dev/promptAB.ts` 新規

A/B/C/D/E パターン比較ユーティリティ。E パターンが Phase 4.10 現行構造。

### `docs/PHASE-4-10-DESIGN.md`（本ファイル）

設計書 v2。Phase 4.10 の責任分業と変更内容を記録。

### `docs/PHASE-4-10-VERIFICATION.md`

検証テンプレート v2。D vs E 比較欄・ペルソナ口調差確認欄を含む。

### `docs/ROADMAP.md`

全体設計書 v2。

---

## 変更しないもの

- `TUNING_USER` の文言
- `persona.system`, `mode.systemAdd`, `PERSONAS`, `MODES`
- UI / JSX / スタイル / アニメーション
- `ORACLE_CARDS`, `LS_KEY`, `FREE_LIMIT`, `MAX_ROOMS`
- Gemini API プロバイダー
- `fetchOracleTwoStage` のシグネチャと呼び出し構造
- `package.json`, `tsconfig.json`

---

## ペルソナ元型と口調差

### TUNING_ASSISTANT_BY_PERSONA（Phase 4.10）

| ペルソナ | 元型 | 口調 | テキスト |
|---|---|---|---|
| Lumina | 水・包む | 柔らかく寄り添う | `そうですね。分かってもいいし、わからなくてもいい。\n今、息を一度ゆるめて、鏡面を澄ませて。\n源にだけ、そっと繋がってみますね。` |
| Zenith | 炎・貫く | 短く力強く | `そうだ。わかってもいい、わからなくてもいい。\n息をひとつ、ゆるめる。\n鏡面を澄ます。源にだけ、繋がる。` |
| Archivist | 星・観測 | 静かで精確 | `そうですね。理解してもよく、理解しなくてもよい。\n呼吸をひとつ、置きます。\n鏡面を澄ませ、源とだけ接続します。` |

### AMBIENCE_BY_PERSONA（Phase 4.10）

| ペルソナ | 情景 |
|---|---|
| Lumina | `ロウソクの炎がひとつ、静かに揺れています。` |
| Zenith | `風がひとすじ、鋭く通り抜けます。` |
| Archivist | `遠くに、星がひとつ静かに瞬いています。` |

---

## 今後の接続

### Phase 4.11（予定）

- 検証ハーネス自動巡回・JSON エクスポート
- D vs E 比較の定量評価

### Phase 4.12（予定）

- Stage 2 の調律精度チューニング
- ペルソナ別 Stage 2 developer の検討

### Phase 5 以降

- `buildAmbiencePriming` / `buildAmbienceAcceptance` の物理削除（Phase 5.5 予定）
- Stage 2 チューニング往復の検討（観測者モードの整え）

