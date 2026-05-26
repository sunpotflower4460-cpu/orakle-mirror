# Phase 5.5 Provider Abstraction

## 設計境界

- フロントエンドは **BFF クライアント** として振る舞う。
- BFF は **LLM プロバイダ抽象化境界** として振る舞う。
- フロントエンドはプロバイダ名、API URL、API キー、Gemini 固有 payload を持たない。

## フロント側に残す型

- `ChatMessage`
- `SamplingParams`
- `BackendErrorCode`

これらは「BFF に何を渡し、BFF からどの種別の失敗が返りうるか」を表す最小表現であり、特定プロバイダの API 仕様を含まない。

## BFF 側の責務

- 環境変数・secret の保持
- プロバイダ固有 request/response への変換
- レート制御、入力検証、CORS、エラー正規化
- フロントへ返すレスポンス形式の安定化

## 将来のプロバイダ切替指針

将来 OpenAI / Anthropic / 別の LLM へ切り替える場合、フロント側は `callLLMWithSampling(messages, sampling)` を使い続ける。変更箇所は BFF 側に閉じ、現在の `bff/src/gemini.ts` を将来的に `bff/src/providers/` 配下へ移す設計を前提に差し替える。

## Phase 5.5 の到達点

Phase 5.5 完了後、フロントエンドは BFF への `POST {VITE_BACKEND_URL}` のみを行う。LLM プロバイダ知識は BFF 側に隔離され、フロントは UI とプロンプト構築に専念する。
