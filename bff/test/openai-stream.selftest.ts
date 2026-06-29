// Phase L-3a: OpenAI ストリーミング(SSE)パーサの最小検証スクリプト(依存追加なし)。
//
// 実行: npm run test:stream  (bff 内。node --experimental-strip-types を使用)
//
// globalThis.fetch を SSE 風の ReadableStream を返すモックに差し替え、
// callOpenAIStream が増分(delta)を onDelta に流し、全文を返すこと、
// HTTP エラー / ストリーム内エラー / 全文空 を正しく扱うことを検証する。実 API キーは使わない。

import { callOpenAIStream } from '../src/providers/openai.ts';

type Env = { OPENAI_API_KEY: string; OPENAI_MODEL: string; ALLOWED_ORIGINS: string; ANU_API_KEY: string };
const env: Env = { OPENAI_API_KEY: 'test', OPENAI_MODEL: 'gpt-test', ALLOWED_ORIGINS: 'x', ANU_API_KEY: 'x' };
const sampling = { temperature: 0.7, topP: 0.9 };

const realFetch = globalThis.fetch;
let failures = 0;
function check(label: string, cond: boolean): void {
  if (cond) console.log(`  ok   ${label}`);
  else { failures += 1; console.error(`  FAIL ${label}`); }
}

function sseResponse(events: string[], status = 200): Response {
  const encoder = new TextEncoder();
  const body = new ReadableStream<Uint8Array>({
    start(controller) {
      // 1 イベントずつ、わざと途中で chunk 境界をまたぐように 2 分割して流す(バッファリング検証)。
      for (const ev of events) {
        const text = ev.endsWith('\n\n') ? ev : ev + '\n\n';
        const mid = Math.floor(text.length / 2);
        controller.enqueue(encoder.encode(text.slice(0, mid)));
        controller.enqueue(encoder.encode(text.slice(mid)));
      }
      controller.close();
    },
  });
  return new Response(body, { status, headers: { 'Content-Type': 'text/event-stream' } });
}

function mockFetch(make: () => Response | Promise<Response>): void {
  // @ts-expect-error テスト用にグローバル fetch を差し替える
  globalThis.fetch = async () => make();
}

async function run(): Promise<void> {
  // 1. 正常系: delta が順に流れ、全文が連結される
  console.log('• streams deltas and returns full text');
  mockFetch(() => sseResponse([
    'data: {"type":"response.created"}',
    'data: {"type":"response.output_text.delta","delta":"こん"}',
    'data: {"type":"response.output_text.delta","delta":"にちは"}',
    'data: {"type":"response.output_text.delta","delta":"、鏡。"}',
    'data: {"type":"response.completed"}',
    'data: [DONE]',
  ]));
  const deltas: string[] = [];
  const ok = await callOpenAIStream([{ role: 'user', content: 'hi' }], sampling, 'discernment', env, (d) => deltas.push(d));
  check('ok=true', ok.ok === true);
  check('deltas in order', deltas.join('|') === 'こん|にちは|、鏡。');
  if (ok.ok) check('full text concatenated', ok.text === 'こんにちは、鏡。');

  // 2. HTTP エラー → ProviderCallError
  console.log('• HTTP error -> error result');
  mockFetch(() => new Response(JSON.stringify({ error: { message: 'bad' } }), { status: 429 }));
  const httpErr = await callOpenAIStream([{ role: 'user', content: 'hi' }], sampling, 'discernment', env, () => {});
  check('not ok on HTTP 429', httpErr.ok === false);

  // 3. ストリーム内 error イベント → ProviderCallError
  console.log('• in-stream error event -> error result');
  mockFetch(() => sseResponse([
    'data: {"type":"response.output_text.delta","delta":"x"}',
    'data: {"type":"response.error","error":{"message":"boom"}}',
  ]));
  const streamErr = await callOpenAIStream([{ role: 'user', content: 'hi' }], sampling, 'discernment', env, () => {});
  check('not ok on stream error', streamErr.ok === false);

  // 4. 全文空 → NO_OUTPUT_TEXT
  console.log('• empty stream -> NO_OUTPUT_TEXT');
  mockFetch(() => sseResponse(['data: {"type":"response.completed"}']));
  const empty = await callOpenAIStream([{ role: 'user', content: 'hi' }], sampling, 'discernment', env, () => {});
  check('not ok when no text', empty.ok === false);
  if (!empty.ok) check('code NO_OUTPUT_TEXT', empty.code === 'NO_OUTPUT_TEXT');

  globalThis.fetch = realFetch;

  if (failures > 0) { console.error(`\n${failures} check(s) failed`); process.exit(1); }
  console.log('\nall checks passed');
}

console.log('openai stream self-test');
void run();
