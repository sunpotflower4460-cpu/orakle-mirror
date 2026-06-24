// Phase Q-6: 最小構成の ESLint(flat config / ESLint v9)。
//
// 方針(設計書 §2 Q-6):
// - devDependencies のみ。アプリのバンドルには含まれない。
// - 既存コードを大量に書き換えないよう、警告中心の最小ルールから始める。
// - 対象は src/ の TypeScript/TSX のみ。bff/ は独自 tsconfig、scripts/ や設定ファイルは対象外。

import tseslint from 'typescript-eslint';
import reactHooks from 'eslint-plugin-react-hooks';
import globals from 'globals';

export default tseslint.config(
  {
    ignores: [
      'dist/**',
      'node_modules/**',
      'ios/**',
      'bff/**',
      'scripts/**',
      '*.config.js',
      '*.config.ts',
    ],
  },
  {
    files: ['src/**/*.{ts,tsx}'],
    languageOptions: {
      parser: tseslint.parser,
      parserOptions: { ecmaVersion: 'latest', sourceType: 'module' },
      globals: { ...globals.browser, ...globals.es2021 },
    },
    plugins: {
      '@typescript-eslint': tseslint.plugin,
      'react-hooks': reactHooks,
    },
    rules: {
      // Hook の呼び出し規約は破ると実害があるため error。
      'react-hooks/rules-of-hooks': 'error',
      // 依存配列は警告にとどめ、既存コードを赤くしない。
      'react-hooks/exhaustive-deps': 'warn',
      // 未使用変数は警告。_ 始まりは意図的な無視として許容。
      '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],
      // 本番コードの console は警告(dev/ と ErrorBoundary は下で除外)。
      'no-console': 'warn',
    },
  },
  {
    // 開発専用ツールと、致命エラーを開発者へ知らせる ErrorBoundary は console を許可。
    files: ['src/dev/**', 'src/components/ErrorBoundary.tsx'],
    rules: { 'no-console': 'off' },
  },
);
