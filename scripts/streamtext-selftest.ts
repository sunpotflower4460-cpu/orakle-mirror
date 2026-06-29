// Phase L-3b: 表示用テキスト抽出(streamText)の最小検証(依存追加なし)。
// 実行: npm run test:streamtext
//
// ストリーム途中の raw を 1 文字ずつ与えても、<final> / </final> タグが一切表示に漏れず、
// 確定時に inner 本文と一致することを検証する。

import { extractFinalForDisplay } from '../src/lib/streamText.ts';

let failures = 0;
function check(label: string, cond: boolean): void {
  if (cond) console.log(`  ok   ${label}`);
  else { failures += 1; console.error(`  FAIL ${label}`); }
}

// raw を 1 文字ずつ累積させ、各段階の display にタグ片が出ないことを確認する。
function streamChars(fullRaw: string): { displays: string[]; final: string } {
  const displays: string[] = [];
  let acc = '';
  for (const ch of fullRaw) {
    acc += ch;
    displays.push(extractFinalForDisplay(acc));
  }
  return { displays, final: extractFinalForDisplay(fullRaw) };
}

console.log('streamText self-test');

// 1. 標準ケース: <final>本文</final>
{
  console.log('• wrapped <final> content never leaks tags');
  const raw = '<final>こんにちは、鏡。</final>';
  const { displays, final } = streamChars(raw);
  check('final equals inner content', final === 'こんにちは、鏡。');
  check('no display ever contains "<"', displays.every((d) => !d.includes('<')));
  check('no display ever contains "final"', displays.every((d) => !d.includes('final')));
  // display は単調増加(累積)で、最終 inner の接頭辞になっている
  check('every display is a prefix of final', displays.every((d) => 'こんにちは、鏡。'.startsWith(d)));
}

// 2. 改行や句読点を含む本文
{
  console.log('• multi-line content');
  const raw = '<final>一行目。\n二行目、ここ。</final>';
  const { final, displays } = streamChars(raw);
  check('final has newline preserved', final === '一行目。\n二行目、ここ。');
  check('no tag leak', displays.every((d) => !d.includes('<')));
}

// 3. タグ無しモデル出力 → 全体を返す(フォールバック)
{
  console.log('• untagged output falls back to whole text');
  // 先頭が '<' でないので、タグ無しはそのまま返る
  const raw = 'タグの無い素の本文';
  check('returns whole text', extractFinalForDisplay(raw) === raw);
}

// 4. 閉じタグが部分的に届いた瞬間にタグ片を出さない
{
  console.log('• partial closing tag is not shown');
  check('content before partial close', extractFinalForDisplay('<final>本文</fi') === '本文');
  check('content before full close', extractFinalForDisplay('<final>本文</final>') === '本文');
  check('open tag forming shows nothing', extractFinalForDisplay('<fin') === '');
}

if (failures > 0) { console.error(`\n${failures} check(s) failed`); process.exit(1); }
console.log('\nall checks passed');
