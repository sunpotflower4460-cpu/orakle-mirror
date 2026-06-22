# Phase 5.5 Provider Abstraction

## 設計境界

- フロントエンドは **BFF クライアント** として振る舞う。
- BFF は **LLM プロバイダ抽象化境界** として振る舞う。
- フロントエンドはプロバイダ名、API URL、API キー、プロバイダ固有 payload を持たない。

## フロント側に残す型

- `ChatMessage`
- `SamplingParams`
- `BackendErrorCode`

これらは「BFF に何を渡し、BFF からどの種別の失敗が返りうるか」を表す最小表現であり、特定プロバイダの API 仕様を含まない。

## Phase 5.5a 完了: フロント型整理

- フロントと BFF の境界型を `ChatMessage` / `SamplingParams` / `BackendErrorCode` に整理した。
- `callLLMWithSampling` のリクエスト body を `{ messages, sampling, stage }` に固定し、フロント側がプロバイダ固有 payload を組み立てないことを明確化した。
- BFF から未知のエラーコードが返った場合は、フロント側で `UPSTREAM_ERROR` に正規化する。
- 事前調査結果: `src/` 配下に `openai` / `gemini` / `groq` / `anthropic` / `claude` の残存なし。プロバイダ固有 URL（`api.openai.com` / `generativelanguage.googleapis.com` 等）の残存なし。
- `src/lib/api.ts` の `callLLMWithSampling` は Stage 引数（`reception` / `discernment`）を受け取り、Stage 1 / Stage 2 は同関数経由で BFF を呼び出す。
- `ChatMessage.role` は `system` / `developer` / `user` / `assistant` の 4 値に統一した。


## Phase 5.5b 完了: BFF プロバイダディレクトリ化

- `bff/src/openai.ts` を `bff/src/providers/openai.ts` に移動し、OpenAI Responses API 呼び出し本体のリトライ、payload 構築、レスポンス抽出ロジックを維持したまま `openaiProvider` として公開した。
- `bff/src/providers/types.ts` に `LLMProvider` / `ProviderResult` を定義し、`supportsDeveloperRole` で developer ロールのネイティブ対応有無を表す境界を追加した。
- `bff/src/providers/index.ts` に `selectProvider()` を追加した。現時点では OpenAI 固定で返し、`env.LLM_PROVIDER` 等による切り替えは Phase 5.5c 以降に委ねる。
- `bff/src/providers/adapter.ts` に developer ロール非対応プロバイダ向けの `foldDeveloperIntoSystem()` 雛形を追加した。本フェーズでは呼び出さず、将来プロバイダ追加時のために export のみに留める。
- `bff/src/index.ts` は provider オブジェクト経由で呼び出し、プロバイダ固有エラーコードをフロントへ漏らさず `UPSTREAM_ERROR` に正規化する。

現在の BFF プロバイダ構造:

```text
bff/src/providers/
├── adapter.ts  # developer → system 連結アダプタ雛形（未使用）
├── index.ts    # selectProvider() と provider 型の再 export
├── openai.ts   # OpenAI Responses API provider 実装
└── types.ts    # LLMProvider / ProviderResult 共通型
```

## BFF 側の責務

- 環境変数・secret の保持
- プロバイダ固有 request/response への変換
- レート制御、入力検証、CORS、エラー正規化
- フロントへ返すレスポンス形式の安定化

## 将来のプロバイダ切替指針

将来プロバイダを切り替える場合、フロント側は `callLLMWithSampling(messages, sampling, stage)` を使い続ける。変更箇所は BFF 側に閉じ、既存の `bff/src/providers/` 配下のプロバイダ実装と `selectProvider()` を差し替える。

## Phase 5.5 の到達点

Phase 5.5 完了後、フロントエンドは BFF への `POST {VITE_BACKEND_URL}` のみを行う。LLM プロバイダ知識は BFF 側に隔離され、フロントは UI とプロンプト構築に専念する。
