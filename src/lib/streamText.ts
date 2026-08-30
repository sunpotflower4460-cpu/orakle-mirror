// Phase L-3b: Stage 2 ストリーミングの「表示用テキスト」抽出(純粋ロジック)。
//
// Stage 2 の生出力は <final> ... </final> で包まれる。ストリーム途中の raw から、
// タグを一切表示せずに「中の本文だけ」を安全に取り出す。<final> が揃うまでは何も出さず、
// </final>(部分含む)も出さない。タグが無いモデル出力は全体を返す(extractTag のフォールバックと同義)。
//
// app 固有 import を持たない leaf にして、Node(--experimental-strip-types)で単体検証できる。

const OPEN_TAG_RE = /<final>/i;
const CLOSE_TAG_RE = /<\/final>/i;
const OPEN_TAG_ASCII = '<final>';
const CLOSE_TAG_ASCII = '</final>';

/**
 * ASCII A-Z だけを小文字化して比較する。
 * String#toLowerCase() だと İ→i̇ (U+0069 + U+0307) で UTF-16 長がずれ、
 * lower 上の index を original にそのまま当てると </final> が本文へ漏れる。
 */
function asciiIeq(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  for (let i = 0; i < a.length; i++) {
    const ca = a.charCodeAt(i);
    const cb = b.charCodeAt(i);
    const la = ca >= 65 && ca <= 90 ? ca + 32 : ca;
    const lb = cb >= 65 && cb <= 90 ? cb + 32 : cb;
    if (la !== lb) return false;
  }
  return true;
}

/** s が tag(ASCII) の接頭辞で終わる最長長さ。比較は ASCII 大小無視のみ。 */
export function trailingPartialLen(s: string, tag: string): number {
  const max = Math.min(s.length, tag.length - 1);
  for (let k = max; k > 0; k--) {
    if (asciiIeq(s.slice(s.length - k), tag.slice(0, k))) return k;
  }
  return 0;
}

/**
 * ストリーム途中の raw から「表示してよい最終本文」を返す。タグは絶対に表示しない。
 * 累積で返す(呼び出し側はこれを表示ターゲットにする)。
 * extractTag と同様、タグ名は大文字小文字を区別しない。
 */
export function extractFinalForDisplay(raw: string): string {
  const openMatch = raw.match(OPEN_TAG_RE);
  if (openMatch && openMatch.index !== undefined) {
    const content = raw.slice(openMatch.index + openMatch[0].length);
    const closeMatch = content.match(CLOSE_TAG_RE);
    if (closeMatch && closeMatch.index !== undefined) {
      return content.slice(0, closeMatch.index);
    }
    // 閉じタグがまだ揃っていない。末尾の部分 '</final>' を表示しないよう削る。
    const k = trailingPartialLen(content, CLOSE_TAG_ASCII);
    return k > 0 ? content.slice(0, content.length - k) : content;
  }
  // 開始タグがまだ揃っていない。先頭が '<' か、末尾が '<final>' の部分なら確定まで待つ。
  const lead = raw.replace(/^\s+/, '');
  if (lead.startsWith('<') || trailingPartialLen(raw, OPEN_TAG_ASCII) > 0) return '';
  // タグが全く無いモデル出力 → 全体をそのまま(extractTag のフォールバックと同義)。
  return raw;
}
