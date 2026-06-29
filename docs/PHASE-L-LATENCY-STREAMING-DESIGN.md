# Phase L — 遅延低減・体感スムーズ化 設計（Claude Code 向け）v0.1

> 🤖 実装担当（Claude Code）へ: 着手前に必ず `AGENTS.md` 全文と本書「§0 厳守事項」を読むこと。
> 「量子乱数 → AI」の流れの体感遅延を、体験を損なわずに減らす 3 つの改善を扱う。
> 3 つはリスクと独立性が大きく異なるため、別フェーズ（L-1 / L-2 / L-3）に分割している。
> L-3 は思想・BFF 構造の両面で重い。**L-1 → L-2 → L-3 の順を推奨**。
> 迷ったら勝手に判断せず PR コメントか Issue で人間に確認すること。

---

## §0 厳守事項（AGENTS.md 再掲）

1. **1 PR = 1 目的**。L-1 / L-2 / L-3 のフェーズ内で PR を分けてよい。
2. **既存挙動を壊さない**。特に次を壊さない:
   - 二段階処理の純度（Stage 1 純粋受信 / Stage 2 識別と調律）
   - 乱数の「事前プールなし」（Phase 4.16）
   - Self Reading の演出
   - 並走キーワードの「AI に渡さない」（Phase A）
3. **依存を追加しない**（npm パッケージ）。ストリーミングは標準 ReadableStream / SSE で実装する。
4. **`LS_KEY`（`oracle_mirror_v16`）を上げない**。
5. **TypeScript strict 維持**。各 PR で `npm run typecheck` / `build`、BFF typecheck、`test:entropy` / `test:keywords` が通ること。
6. インデント 2 スペース / シングルクォート / セミコロンあり。1 ファイル 400 行目安。

---

## §1 現状の遅延内訳

**AI ミラー（card モード）** — 体感の積み上がり:

| 段 | 内容 | 概算 | 備考 |
|---|---|---|---|
| ① | カード抽選（量子乱数） | ~300–800ms | BFF→ANU、失敗時 crypto。`RANDOM_TIMEOUT_MS=2500` |
| ② | 純粋受信 AI（Stage 1） | ~2–5s | LLM 生成。temp 1.1, max_output_tokens 900 |
| ③ | 翻訳 AI（Stage 2） | ~2–5s | LLM 生成。temp 0.7 |

- ①②③は**直列**。①カード抽選 → ② → ③ の順で待つ。
- ただし並走キーワード取得（`keywordsPromise`）は AI と並行で、`await keywordsPromise` で受けるだけなので体感に効かない。
- **合計体感: 約 4–11s。**
- （重要）遅延の **8〜9 割は AI 二段階の LLM 生成（②③）**。乱数（①）は数百 ms で相対的に小さい。
  「乱数と AI」というより、**AI 二段階そのものが律速**。

**Self Reading**: 乱数でカード ~300–800ms に対し、シャッフル演出 ~1.45s + めくり演出 ~2.0s〜 があり、
取得は演出の裏で走る。`drawToken` で完了前に result が確定する。**ここは手を入れる必要がほぼない。**

---

## §2 3 つの改善（リスク順・独立フェーズ）

| フェーズ | 内容 | 効果 | リスク | 独立性 |
|---|---|---|---|---|
| **L-1** | QRNG タイムアウト短縮 + 早いフォールバック | 悪ケースの改善 | 低 | 完全独立 |
| **L-2** | 先行開始（AI 待ちの裏で取得） | 小〜中 | 低 | 完全独立 |
| **L-3** | Stage 2 最終応答のストリーミング「タイプ表示」 | 大 | 大きい（思想 + BFF 構造） | 段階分割 |

**L-1 → L-2 → L-3 の順に進める。** L-1 / L-2 は軽い。L-3 が本命だが重い。

---

## §3 L-1: QRNG タイムアウト短縮

**背景**: `entropy.ts` の `RANDOM_TIMEOUT_MS = 2500`、BFF `random.ts` の `ANU_TIMEOUT_MS = 2500`。
ANU が遅い / 不調のとき、最大 2.5 秒待ってから crypto フォールバックに落ちる。この「量子の核」は
保ちつつ、待ちすぎを防ぐ。

**やること**

1. `src/lib/entropy.ts` の `RANDOM_TIMEOUT_MS` を短縮。値: **1500ms**（実測で 1000〜1800ms の範囲で調整可）。
   「ANU が正常なら数百 ms で返る。1.5 秒待っても返らないなら不調とみなし crypto へ」という判断。
2. BFF `bff/src/random.ts` の `ANU_TIMEOUT_MS` を短縮。**フロント側 ≧ BFF 側**にする
   （フロントが先に諦めると BFF の応答が無駄になる）。
   例: BFF `ANU_TIMEOUT_MS = 1200`、フロント `RANDOM_TIMEOUT_MS = 1500`（フロントに余裕）。
   両方にコメントで意図を明記:「フロントは BFF より長く待つ。BFF が先にタイムアウトして正規化エラーを
   返せば、フロントは即 crypto フォールバックできる」。
3. Self Reading は低速でもシャッフル 1.45s があるため、1.5s のタイムアウトでも破綻しない
   （演出の裏に隠れる）。AI ミラーの card モードでは①が短くなるぶん ①→② が早まる。

**注意 / 禁止**

- タイムアウトを短くしすぎて、正常な ANU 応答まで切ってしまわない（数百 ms 実測を踏まえる）。
  短すぎると「いつも crypto」になり量子の意味が薄れる。診断（`source`）で QRNG 率を確認。
- crypto フォールバックのロジックは変えない（QRNG が取れなくても必ずカードが引ける、を維持）。
- タイムアウト以外の挙動を変えない。これは「待ちすぎを防ぐ」だけの最小変更。

**確認**: `test:entropy` が通る。DevTools で `/random` を遅延（throttle）させ、1.5s 超で crypto に
なることを確認。正常時は `source: 'qrng'`（短縮しすぎていない）。

---

## §4 L-2: 先行開始（AI 待ちの裏で）

**背景**: AI ミラー card モードは現状、`await getRandomCardsQuantum(2)` でカード抽選（①）を待ってから
Stage 1 のプロンプトを組む（直列）。①の数百 ms が遅れる。

カード抽選（①）は「Stage 1 のプロンプトにカード名が必要」なので、Stage 1 と完全並行はできない。
だが、先に①を起動しておけば、UI 更新と①をオーバーラップでき、await の時点で取得が進んでいる。

**やること**

1. `MainApp.tsx` の `handleSend` で、カード抽選 Promise を**先に起動**する。
   現状 `await getRandomCardsQuantum(2)` している箇所より前（ユーザー問い表示・`setStorage` の前後）で:
   ```ts
   const drawPromise = mode.id === 'card'
     ? getRandomCardsQuantum(2)
     : Promise.resolve({ cards: [] });
   ```
   のように Promise を持っておき、receptionMsgs 構築の直前で `const { cards } = await drawPromise;` で受ける。
   これにより UI 更新中に①が裏で進む（数百 ms のオーバーラップ）。
2. キーワード取得（`keywordsPromise`）は Phase A で既に「先行起動」パターン。維持する。
3. pure モードは①が無いので素通り（`Promise.resolve`）。

**注意 / 禁止**

- カード抽選を「Stage 1 と並行」にしない（カード名が Stage 1 入力に必要。順序依存は守る）。
- 「引いた瞬間に取得開始」（Phase 4.16 の原則）は不変。効果は「①の数百 ms を UI 更新に隠す」程度。
  大きくはないが、低リスクなので入れる。

**確認**: card / pure 両方で従来どおりカードとキーワードが出る。乱数の `source`（QRNG/crypto の判定）
不変。typecheck / build 通過。

---

## §5 L-3: Stage 2 ストリーミング「タイプ表示」（本命）

最も効果が大きいが最も重い。フロント（UI のみ）と BFF 構造の両方を要する。着手は L-1 / L-2 がマージ
されてから。この §5 は単独で複数 PR に分ける（§5.6 参照）。

### 5.1 確定した方針（オーナー）

- 「答えが少しずつ表示される方が体感がいい。タイプライター的に出す。ただし鏡の佇まいを保つ。」
- 思想的評価: 落ち着いた中庸の演出になりうる。派手にしない。

### 5.2 構造判断（どこをストリームするか）

- Stage 1（純粋受信）の出力は Stage 2 の入力であり、ユーザーには見せない**内部処理**。
  → **Stage 1 はストリームしない**（ストリームしても意味がない）。
- ユーザーに届く最終応答は Stage 2（識別と調律）の出力。
  → **Stage 2 のみをストリーミング**する。
- 体感は「①②（待ち）→ ③は Stage 2 完了ではなく Stage 2 の最初のトークンまで」になり、
  従来の③全体を待つより大幅に短く感じる。

> 別案「2 段階をやめて 1 段階にすればもっと速い」は**採らない**。二段階は Oracle Mirror の核
> （AGENTS.md §11 / Phase 4.10）。思想を崩さない。

### 5.3 BFF ストリーミング基盤（SSE / ReadableStream）

現状 `bff/src/index.ts` は `provider.call` の完了テキストを `jsonResponse` で返す。ストリーミングの
ため以下を**追加の経路**として足す（既存 `/oracle` 非ストリームを壊さない）。

1. OpenAI 側: Responses API は `stream: true` で SSE を返せる。`bff/src/providers/openai.ts` に
   ストリーミング版の呼び出しを追加（既存の非ストリーミング `call` は残す）。`LLMProvider`
   インターフェースに `callStream` を追加。OpenAI の SSE イベント（`output_text.delta` 等）から
   増分テキストを取り出し、エンコードしてフロントへ流す。
2. BFF エンドポイント: 既存 `/oracle` を活かしつつ、ストリーム用に `stream` フラグをボディで受けるか、
   `/oracle/stream` を新設する。**推奨**: `/oracle` に `stream: true` フラグをボディで受け、true の
   とき `Content-Type: text/event-stream` の ReadableStream を返す。false / 未指定なら従来の JSON。
   これにより「Stage 1 は stream:false で呼ぶ、Stage 2 は stream:true で呼ぶ」を同一エンドポイントで
   できる。CORS / Origin 制限 / 検証は**ストリーム経路でも必ず通す**（既存ガードを流用）。
3. エラー処理: ストリーム中のエラーは SSE イベントとして `error` を流す（or 既存方針）。
4. タイムアウト / 接続断: Workers のハンドリング（§5.5 で UI 側も対応）。

### 5.4 フロント側 API 層（`src/lib/api.ts`）

1. `fetchOracleTwoStage` のストリーミング版を追加（既存は残す）。例:
   `fetchOracleTwoStageStreaming(receptionMsgs, discernmentBuilder, onToken)`。
   Stage 1 は従来どおり（`callLLMWithSampling` を流用）。Stage 2 をストリームで呼び、受信した増分
   テキストを `onToken(delta)` コールバックで UI に渡す。
2. `<final>` タグ抽出を避ける（タイプ途中の半端な抽出をしない）。完了後に `extractTag` で整える、
   またはインクリメンタル抽出を安全に行う。
3. リトライ（429/5xx）は「前は確定」or「やり直し」を選ぶ（UX 安定 + ボタン）。
4. 既存の `RECEPTION_SAMPLING` / `DISCERNMENT_SAMPLING` を使う。

### 5.5 UI 層（`MainApp.tsx` + `OracleBubble.tsx`）

1. ストリームで受け取ったトークンをメッセージの text にレンダリング。ただしネットワークのトークン
   到着はバースト的（まとまって届く）なので、そのまま出すとガタつく。
   → 受信済みテキストを**一定速度で 1 文字ずつ追いかけて出す**「タイプライター・キュー」で一定速度に。
   インデックスを `requestAnimationFrame` or `setInterval` で一定速度で進める。
   速度は調整可能な定数（例: `TYPE_CHARS_PER_SEC`、初期値 **30〜60 文字/秒**程度から）。自然な動き。
2. 句読点の演出: 「。」「、」「\n」で数十 ms 止めると間が出る。やりすぎ注意、控えめに。
3. `prefers-reduced-motion` の尊重: reduce なら既存の motion 方針に従い、即時表示寄りに。
4. フォールバック: ストリーム不可 / 失敗時は従来の `fetchOracleTwoStage`（非ストリーム）に落ちて、
   それでも必ず答えが出ることを保証。
5. カーソル / 中インジケータ: 控えめなカーソル（点滅する ▌等）は要判断。鏡の静けさを壊さない。
   コピー対象は**確定テキスト**（タイプ途中の半端なものをコピーさせない）。

### 5.6 L-3 の PR 分割

| PR | 目的 | 主な変更 |
|---|---|---|
| **L-3a** | BFF ストリーミング基盤 | `bff/src/providers/openai.ts`（stream 版追加）, `bff/src/index.ts`（stream 分岐 / `/oracle` の stream:true 対応）。既存 `/oracle` 非ストリームは不変 |
| **L-3b** | フロント API 層 | `src/lib/api.ts`（`fetchOracleTwoStageStreaming` 追加, `onToken`） |
| **L-3c** | タイプ表示 UI | `MainApp.tsx`（結線 + タイプライターキュー）, `OracleBubble.tsx`（描画対応）, reduced-motion 分岐, 速度定数, 非ストリームフォールバック |
| **L-3d** | ドキュメント | `ROADMAP.md` 更新 等 |

各 PR は単独で typecheck/build が通ること。L-3a は経路追加のみなので単体マージ可能。
L-3c で体感が変わる。

### 5.7 L-3 の注意 / 禁止

- Stage 1 をストリームしない（内部処理。無意味）。
- ストリーム化に伴い、Stage 2 最終出力（`<final>`）の**出し方だけ**を変える。テキストそのものは
  従来と同一。
- 並走キーワードの「AI に取得・別表示」は不変。
- コピー機能の対象は確定テキスト（タイプ途中の半端なものをコピーさせない）。
- 鏡の佇まい（落ち着き）を守る（オーナー方針）。

---

## §6 順序

1. **L-1**（QRNG タイムアウト短縮）= 最初に入れる。
2. **L-2**（先行開始）= 結線レベル・低リスク。L-1 と同時でも可。
3. **L-3**（ストリーミング）= 本命だが重い。**L-3a → L-3b → L-3c → L-3d** の順。L-3a は単体マージ可能。
   L-3c で体感が変わるので時間をかける。

L-1 / L-2 だけでも「カードが出るまで」が少し締まる。L-3 で体感が大きく変わる。順序を守る。

---

## §7 受け入れ基準

**L-1**: `RANDOM_TIMEOUT_MS` / `ANU_TIMEOUT_MS` が短縮され、フロント ≧ BFF。正常時は `source: 'qrng'`、
不調時は素早く crypto。`test:entropy` 通過。Self Reading 破綻なし。

**L-2**: 抽選 Promise が構築直前で await される。「事前プールなし」が不変。card/pure 両方で従来どおり。

**L-3**: Stage 2 がストリーミングされる。Stage 1 は完了待ち。落ち着いた中庸の演出（俗っぽく速すぎない）。
`prefers-reduced-motion` にフォールバック。ストリーム不可 / 失敗時は非ストリームにフォールバック
（必ず答えが出る）。コピーは確定テキスト。既存 `/oracle` 非ストリームは不変。

**共通**: typecheck / build、BFF typecheck、`test:entropy` / `test:keywords` が全 PR で通る。
`LS_KEY=v16` 不変。Phase 4.16 / Phase A / Phase U と矛盾しない。

---

## §8 確認手順

```bash
npm install && npm run typecheck && npm run build && npm run test:entropy
cd bff && npm install && npx tsc --noEmit && cd ..
```

- **L-1**: DevTools の Network throttle で `/random` を遅延 → 1.5s 超で crypto（診断 `source` 確認）。
- **L-2**: card モードで送信 → カード・キーワードが従来どおり。`source` 判定不変。
- **L-3**: ローカル BFF（`wrangler dev` + 実 OpenAI キー）で送信 → ストリーム表示。reduced-motion ON →
  即時寄り。BFF を止める / stream をブロック → 非ストリームにフォールバック。
  実 OpenAI キーと `wrangler dev` が要るため、キー未設定では「非ストリームで答えが出る」ところまで確認し、
  ストリーム本番の体感はオーナーがキー設定後に確認する。

---

## §9 スコープ外（このフェーズではやらない）

- Stage 1 のストリーミング（内部処理。無意味）。
- LLM 高速モデルへの切り替え（別途・プロバイダ選定の話）。
- Self Reading の演出変更（体験を損なうので触らない）。
- プレミアム機能・iPad（別フェーズ）。

---

## §10 リスクと注意

- L-3 が全ての品位を損なう / 遅すぎると冗長。オーナーと中庸を探す。
- 二段階の純度を絶対に崩さない。「1 段階にすれば速い」という誘惑が来るが、それは Oracle Mirror で
  なくなる。ストリームは「Stage 2 の出し方」だけを変える。
- 失敗しても（L-1: crypto / L-3: 非ストリーム）ユーザーには必ず答えが届く。これは Phase 4.16 と同じ
  「必ず引ける / 必ず答えが出る」原則。
- 互換: BFF 既存 `/oracle` を壊さない。ストリーミングは標準 Web API（ReadableStream / SSE）。
  npm 依存を足さない。
