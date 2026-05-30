# Oracle Mirror BFF

Cloudflare Workers 上で動作する Backend For Frontend。
OpenAI API キーをクライアントから秘匿し、ChatMessage 配列 → OpenAI Responses API への変換と
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
# .dev.vars の OPENAI_API_KEY に開発用の値を記入
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

```js
{
  "messages": [
    // role は "system" | "developer" | "user" | "assistant" のいずれか
    { "role": "user", "content": "..." }
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

### Origin ポリシー

`POST /oracle` は `Origin` ヘッダ必須です。以下の Origin が許可されます:

- `capacitor://localhost`（iOS/Android Capacitor 実機 WebView）
- `ionic://localhost`
- `http://localhost`
- `http://localhost:5173`（Vite 開発サーバー）

`Origin` が付かないリクエスト（サーバー間呼び出し、curl 直接など）は `403 ORIGIN_NOT_ALLOWED` で拒否されます。
将来サーバー間呼び出しを許可する場合は、API キーや署名ヘッダによる別経路の認証を追加してください
（CORS だけでは防衛にならない）。

## デプロイ

```bash
cd bff
npm install
npx wrangler secret put OPENAI_API_KEY
npx wrangler deploy
```

デプロイ後、フロント側のビルド環境変数に以下を設定して再ビルドしてください:

```bash
VITE_BACKEND_URL=https://oracle-mirror-bff.<subdomain>.workers.dev/oracle
```

詳細は本リポジトリ直下の実行設計書を参照。エージェントは本ディレクトリのコード作成までを担当し、
実際の `wrangler login` / `wrangler secret put` / `wrangler deploy` は人間が手動で行う。
