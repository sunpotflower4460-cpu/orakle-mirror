# BFF Production Security

## Origin Control

- `ALLOWED_ORIGINS` must be set to the exact production domain(s) — no trailing slashes, no wildcards.
- Example: `https://app.yourdomain.com` (not `https://*`).
- Do not use wildcard origins in production.

## Secrets

- The Gemini API key must be stored as a Cloudflare secret (`wrangler secret put GEMINI_API_KEY`), not in `wrangler.toml`.
- Never commit API keys or secrets to version control.

## Rate Limiting

- The current in-memory rate limiter resets per Worker isolate restart. It is **not sufficient** as the only production defense.
- Before public release, configure at least one of the following:
  - Cloudflare Rate Limiting (dashboard or Ruleset API)
  - Cloudflare WAF rules
  - KV-based or Durable Objects-based rate limiting for persistent per-IP/per-key counters

## Recommended Hardening

- Add `X-Oracle-App-Version` header check on the BFF to reject requests from very old app versions.
- Log anomalous consecutive access patterns (e.g., >100 requests/minute from a single IP).
- Restrict accepted `Content-Type` to `application/json`.
- Validate request body size to prevent abuse with oversized payloads.

## References

- [Cloudflare Rate Limiting](https://developers.cloudflare.com/waf/rate-limiting-rules/)
- [Cloudflare Workers KV](https://developers.cloudflare.com/kv/)
- [Cloudflare Durable Objects](https://developers.cloudflare.com/durable-objects/)
