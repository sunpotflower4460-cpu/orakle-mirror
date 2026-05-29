# Cloudflare Deployment Notes

## Current desired commands

Use these commands in Cloudflare Workers & Pages build settings:

```txt
Build command:
npm run build

Deploy command:
npm run deploy:cloudflare

Non-production branch deploy command:
npm run deploy:cloudflare

Path:
/
```

## Why this matters

`npx wrangler versions upload` only uploads a Worker version. It does not automatically assign that version to visible traffic.

A successful log like this means the upload succeeded, but the app may still not be visible:

```txt
Uploaded orakle-mirror
Worker Version ID: ...
To deploy this version to production traffic use the command wrangler versions deploy
Success: Deploy command completed
```

For a directly visible deployment, Cloudflare should run:

```txt
Executing user deploy command: npm run deploy:cloudflare
```

which resolves to:

```txt
wrangler deploy --config wrangler.toml
```

## Static assets config

The root `wrangler.toml` deploys the built Vite output as Workers Static Assets:

```toml
[assets]
directory = "./dist"
not_found_handling = "single-page-application"
```

This avoids Wrangler's Vite auto-configuration path, which requires Vite 6+.

## Trigger note

This file also serves as a harmless deployment-triggering change after Cloudflare build settings are updated.
