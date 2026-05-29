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

function check(label, ok, detail) {
  if (ok) {
    console.log(`  ✅  ${label}`);
    passed++;
  } else {
    console.error(`  ❌  ${label}${detail ? ` — ${detail}` : ''}`);
    failed++;
  }
}

function readText(rel) {
  const abs = resolve(ROOT, rel);
  if (!existsSync(abs)) return null;
  return readFileSync(abs, 'utf8');
}

console.log('\n🔍  Oracle Mirror — App Store Readiness Check\n');

// ── 1. Bundle ID placeholder ──────────────────────────────────────────────────
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
const srcFiles = [
  'capacitor.config.ts',
  'src/lib/env.ts',
  '.env.example',
];
const placeholderPattern = /your-backend|<subdomain>|your-domain/i;
for (const rel of srcFiles) {
  const txt = readText(rel) ?? '';
  check(
    `No backend placeholder in ${rel}`,
    !placeholderPattern.test(txt),
    'Replace placeholder backend URL with actual value',
  );
}

// ── 3. PrivacyInfo.xcprivacy exists ───────────────────────────────────────────
check(
  'ios/App/App/PrivacyInfo.xcprivacy exists',
  existsSync(resolve(ROOT, 'ios/App/App/PrivacyInfo.xcprivacy')),
  'Create PrivacyInfo.xcprivacy in ios/App/App/',
);

// ── 4. Required env vars present in .env / .env.local ─────────────────────────
const envFiles = ['.env.local', '.env'];
let envContent = '';
for (const f of envFiles) {
  const txt = readText(f);
  if (txt) { envContent = txt; break; }
}

function envSet(key) {
  const re = new RegExp(`^${key}=(.+)`, 'm');
  const m = envContent.match(re);
  return m && m[1].trim().length > 0;
}

const requiredEnv = ['VITE_TERMS_URL', 'VITE_PRIVACY_URL', 'VITE_BACKEND_URL'];
for (const key of requiredEnv) {
  check(
    `${key} is set`,
    envSet(key),
    `Add ${key}=<value> to .env.local`,
  );
}
check(
  'VITE_SUPPORT_URL or VITE_SUPPORT_EMAIL is set',
  envSet('VITE_SUPPORT_URL') || envSet('VITE_SUPPORT_EMAIL'),
  'Add VITE_SUPPORT_URL or VITE_SUPPORT_EMAIL to .env.local',
);

// ── 5. Purchases mock not in production imports ────────────────────────────────
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

// ── 6. npm run typecheck ───────────────────────────────────────────────────────
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
  console.error('\n🚫  App Store readiness check FAILED. Fix the issues above.\n');
  process.exit(1);
} else {
  console.log('\n🎉  All checks passed. Ready for the next step!\n');
}
