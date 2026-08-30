// Phase L-3b: Stage 2 ストリーミングの「表示用テキスト」抽出(純粋ロジック)。
//
// Stage 2 の生出力は <final> ... </final> で包まれる。ストリーム途中の raw から、
// タグを一切表示せずに「中の本文だけ」を安全に取り出す。<final> が揃うまでは何も出さず、
// </final>(部分含む)も出さない。タグが無いモデル出力は全体を返す(extractTag のフォールバックと同義)。
//
// app 固有 import を持たない leaf にして、Node(--experimental-strip-types)で単体検証できる。

const OPEN_TAG = '<final>';
const CLOSE_TAG = '</final>';

/** s が tag の接頭辞で終わる最長長さ(末尾の部分タグ検出用)。 */
export function trailingPartialLen(s: string, tag: string): number {
  const max = Math.min(s.length, tag.length - 1);
  for (let k = max; k > 0; k--) {
    if (s.slice(s.length - k) === tag.slice(0, k)) return k;
  }
  return 0;
}

/**
 * ストリーム途中の raw から「表示してよい最終本文」を返す。タグは絶対に表示しない。
 * 累積で返す(呼び出し側はこれを表示ターゲットにする)。
 * extractTag と同様、タグ名は大文字小文字を区別しない。
 */
export function extractFinalForDisplay(raw: string): string {
  const lower = raw.toLowerCase();
  const openIdx = lower.indexOf(OPEN_TAG);
  if (openIdx !== -1) {
    const content = raw.slice(openIdx + OPEN_TAG.length);
    const contentLower = content.toLowerCase();
    const closeIdx = contentLower.indexOf(CLOSE_TAG);
    if (closeIdx !== -1) return content.slice(0, closeIdx);
    // 閉じタグがまだ揃っていない。末尾の部分 '</final>' を表示しないよう削る。
    const k = trailingPartialLen(contentLower, CLOSE_TAG);
    return k > 0 ? content.slice(0, content.length - k) : content;
  }
  // 開始タグがまだ揃っていない。先頭が '<' か、末尾が '<final>' の部分なら確定まで待つ。
  const lead = raw.replace(/^\s+/, '');
  if (lead.startsWith('<') || trailingPartialLen(lower, OPEN_TAG) > 0) return '';
  // タグが全く無いモデル出力 → 全体をそのまま(extractTag のフォールバックと同義)。
  return raw;
}
