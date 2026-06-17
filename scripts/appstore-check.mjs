#!/usr/bin/env node
/**
 * scripts/appstore-check.mjs
 *
 * App Store readiness check script.
 * Run: node scripts/appstore-check.mjs
 * Or:  npm run appstore:check
 *
 * Exits with code 1 if any check fails.
 */

import { execSync } from 'child_process';
import { existsSync, readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');

let passed = 0;
let failed = 0;

function section(label) {
  console.log(`\n${label}`);
}

function check(label, ok, detail) {
  if (ok) {
    console.log(`  ✅  ${label}`);
    passed++;
  } else {
    console.log(`  ❌  ${label}${detail ? ` — ${detail}` : ''}`);
    failed++;
  }
}

function readText(rel) {
  const abs = resolve(ROOT, rel);
  if (!existsSync(abs)) return null;
  return readFileSync(abs, 'utf8');
}

function stripComments(txt) {
  return txt
    .split('\n')
    .filter((line) => !line.trimStart().startsWith('//') && !line.trimStart().startsWith('*'))
    .join('\n');
}

function stripPlaceholderTokenLists(txt) {
  return txt
    .replace(/const BACKEND_PLACEHOLDER_TOKENS = \[[\s\S]*?\];/m, '')
    .replace(/const LEGAL_PLACEHOLDER_TOKENS = \[[\s\S]*?\];/m, '');
}

function parseEnv(txt) {
  const values = new Map();
  for (const line of txt.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const match = trimmed.match(/^([A-Z0-9_]+)=(.*)$/);
    if (!match) continue;
    values.set(match[1], match[2].trim().replace(/^['"]|['"]$/g, ''));
  }
  return values;
}

function envValue(env, key) {
  return env.get(key)?.trim() ?? '';
}

const placeholderPattern = /your-backend|<subdomain>|<your-|your-domain|your-website|example\.(com|org|net)|\.\.workers\.dev/i;

function hasPlaceholder(value) {
  return placeholderPattern.test(value);
}

function envReady(env, key) {
  const value = envValue(env, key);
  return value.length > 0 && !hasPlaceholder(value);
}

console.log('\n🔍  Oracle Mirror — App Store Readiness Check');

// ── 1. Bundle ID placeholder ──────────────────────────────────────────────────
section('\nBundle ID readiness');
const capacitorCfg = readText('capacitor.config.ts') ?? '';
const pbxproj = readText('ios/App/App.xcodeproj/project.pbxproj') ?? '';

check(
  'No com.example in capacitor.config.ts',
  !capacitorCfg.includes('com.example'),
  'Replace com.example.oraclemirror with the production Bundle ID',
);
check(
  'No com.example in project.pbxproj',
  !pbxproj.includes('com.example'),
  'Replace com.example.oraclemirror with the production Bundle ID',
);

// ── 2. Placeholder backend / domain strings ───────────────────────────────────
section('\nPlaceholder values found in runtime source/config');
const runtimeConfigFiles = [
  'capacitor.config.ts',
  'src/lib/env.ts',
];
for (const rel of runtimeConfigFiles) {
  const txt = stripPlaceholderTokenLists(stripComments(readText(rel) ?? ''));
  check(
    `No production placeholder value in ${rel}`,
    !hasPlaceholder(txt),
    'Remove placeholder values from runtime source/config; keep examples in .env.example or docs only',
  );
}

// .env.example is allowed to be a template, but it must list the expected keys.
section('\nTemplate env file readiness');
const envExample = parseEnv(readText('.env.example') ?? '');
const documentedEnv = [
  'VITE_BACKEND_URL',
  'VITE_REVENUECAT_IOS_API_KEY',
  'VITE_TERMS_URL',
  'VITE_PRIVACY_URL',
  'VITE_SUPPORT_URL',
  'VITE_SUPPORT_EMAIL',
];
for (const key of documentedEnv) {
  check(
    `.env.example documents ${key}`,
    envExample.has(key),
    `Add ${key}= to .env.example as a template key, not a real value`,
  );
}

// ── 3. PrivacyInfo.xcprivacy exists ───────────────────────────────────────────
section('\nPrivacy manifest readiness');
check(
  'ios/App/App/PrivacyInfo.xcprivacy exists',
  existsSync(resolve(ROOT, 'ios/App/App/PrivacyInfo.xcprivacy')),
  'Create PrivacyInfo.xcprivacy in ios/App/App/',
);

// ── 4. Required env vars present in .env / .env.local ─────────────────────────
section('\nRequired local env missing');
const envFiles = ['.env.local', '.env'];
let envContent = '';
let envSource = '';
for (const f of envFiles) {
  const txt = readText(f);
  if (txt) {
    envContent = txt;
    envSource = f;
    break;
  }
}
const localEnv = parseEnv(envContent);

check(
  '.env.local or .env exists for App Store readiness values',
  Boolean(envSource),
  'Copy .env.example to .env.local and replace every placeholder with real values',
);

const requiredEnv = ['VITE_TERMS_URL', 'VITE_PRIVACY_URL', 'VITE_BACKEND_URL'];
for (const key of requiredEnv) {
  check(
    `${key} is set to a non-placeholder value`,
    envReady(localEnv, key),
    `Add a real ${key}= value to .env.local`,
  );
}
check(
  'VITE_SUPPORT_URL or VITE_SUPPORT_EMAIL is set to a non-placeholder value',
  envReady(localEnv, 'VITE_SUPPORT_URL') || envReady(localEnv, 'VITE_SUPPORT_EMAIL'),
  'Add a real support URL or support email to .env.local',
);

// ── 5. Purchases mock not in production imports ────────────────────────────────
section('\nRevenueCat / native purchase readiness');
// capacitorWebMocks.ts is the mock file; it should NOT be directly imported by
// production code (only capacitorMocks.ts should import it conditionally).
const mainAppTxt = readText('src/MainApp.tsx') ?? '';
const subscribeModalTxt = readText('src/components/SubscribeModal.tsx') ?? '';
const directMockImport = /from ['"].*capacitorWebMocks['"]/;
check(
  'MainApp.tsx does not directly import capacitorWebMocks',
  !directMockImport.test(mainAppTxt),
);
check(
  'SubscribeModal.tsx does not directly import capacitorWebMocks',
  !directMockImport.test(subscribeModalTxt),
);
check(
  'VITE_REVENUECAT_IOS_API_KEY is documented for native IAP setup',
  envExample.has('VITE_REVENUECAT_IOS_API_KEY'),
  'Document the RevenueCat iOS public SDK key in .env.example',
);

// ── 6. npm run typecheck ───────────────────────────────────────────────────────
section('\nBuild/typecheck readiness');
console.log('\n  ⏳  Running npm run typecheck…');
try {
  execSync('npm run typecheck', { cwd: ROOT, stdio: 'inherit' });
  check('npm run typecheck', true);
} catch {
  check('npm run typecheck', false, 'Fix TypeScript errors first');
}

// ── 7. npm run build ──────────────────────────────────────────────────────────
console.log('\n  ⏳  Running npm run build…');
try {
  execSync('npm run build', { cwd: ROOT, stdio: 'inherit' });
  check('npm run build', true);
} catch {
  check('npm run build', false, 'Fix build errors first');
}

// ── Summary ───────────────────────────────────────────────────────────────────
console.log(`\n${'─'.repeat(50)}`);
console.log(`  Passed: ${passed}   Failed: ${failed}`);
if (failed > 0) {
  console.log('\n🚫  App Store readiness check FAILED. Fix the human-supplied configuration items above.');
  console.log('    See docs/APP-STORE-ENV-SETUP.md for required local values.\n');
  process.exit(1);
} else {
  console.log('\n🎉  All checks passed. Ready for the next step!\n');
}
