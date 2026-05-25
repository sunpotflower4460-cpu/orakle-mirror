# Oracle Mirror BFF

Cloudflare Workers 上で動作する Backend For Frontend。
Gemini API キーをクライアントから秘匿し、ChatMessage 配列 → Gemini API への変換と
レート制限・CORS 制御を担う。

## 開発

### 必要環境

- Node.js 20 系
- npm 10 系
- Cloudflare アカウント(デプロイ時のみ)

### セットアップ

```bash
cd bff
npm install
cp .dev.vars.example .dev.vars
# .dev.vars の GEMINI_API_KEY に開発用の値を記入
```

### ローカル起動

```bash
npm run dev
```

http://localhost:8787 で起動。

### 疎通確認

```bash
# ヘルスチェック
curl http://localhost:8787/

# Oracle エンドポイント
curl -X POST http://localhost:8787/oracle \
  -H "Content-Type: application/json" \
  -H "Origin: http://localhost:5173" \
  -d '{
    "messages": [
      { "role": "system", "content": "あなたは静かな鏡である。" },
      { "role": "user", "content": "今日の私に必要な響きを置いてください。" }
    ],
    "sampling": { "temperature": 1.0, "topP": 0.95 }
  }'
```

## API 仕様

### POST /oracle

**リクエスト:**

```json
{
  "messages": [
    { "role": "system" | "developer" | "user" | "assistant", "content": "..." }
  ],
  "sampling": { "temperature": 1.0, "topP": 0.95, "topK": 40 }
}
```

**成功レスポンス(200):**

```json
{ "text": "応答テキスト" }
```

**エラーレスポンス(4xx / 5xx):**

```json
{ "error": { "code": "ERROR_CODE", "message": "ユーザー向けメッセージ" } }
```

### 制限

- ボディサイズ: 32KB まで
- メッセージ数: 64 件まで
- メッセージ合計文字数: 16,000 字まで
- レート制限: IP あたり 20 req/分、200 req/時

## デプロイ(人間タスク M-3)

詳細は本リポジトリ直下の実行設計書を参照。エージェントは本ディレクトリのコード作成までを担当し、
実際の `wrangler login` / `wrangler secret put` / `wrangler deploy` は人間が手動で行う。
