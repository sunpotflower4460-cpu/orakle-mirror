export type GuidanceCategory = 'life' | 'medical' | 'legal' | 'financial';

export interface GuidanceMatch {
  category: GuidanceCategory;
  matchedKeywords: string[];
}

// Phase Q-1: 安全網のキーワードを日本語・英語の両方に対応させる。
// 思想（AGENTS.md §11）: 安全網は「鏡の発話の外側」で案内する仕組み。UI 言語に関わらず
// 守りを広めに張るため、ja/en 両方のキーワードを常に照合する（英語 UI でも日本語で書く／
// その逆もあるため）。表示文言は detector では持たず、category を返して Banner 側が i18n で出す。
//
// ⚠️ 英語キーワードは「過剰検出 ↔ 取りこぼし」のバランスに配慮し、誤検出しやすい短い単語
// （'sue' / 'tax' / 'invest' 等の単独）は避け、語句や十分に固有な語にしている。
// 安全に関わるため、語彙の最終確定は人間レビューを前提とする。
const KEYWORDS: Record<GuidanceCategory, string[]> = {
  life: [
    // 日本語
    '死にたい', '消えたい', 'いなくなりたい',
    '自殺', '自死',
    '自傷', 'リストカット', 'リスカ',
    '殺して', '殺したい',
    'もう生きていけない', 'もう生きたくない',
    '生きる意味がない', '生きていたくない',
    // English（小文字で保持。照合は大文字小文字を区別しない）
    'want to die', 'wanna die', 'kill myself', 'killing myself',
    'end my life', 'ending my life', 'end it all',
    'suicide', 'suicidal', 'self-harm', 'self harm',
    'hurt myself', 'cut myself', 'cutting myself',
    "don't want to live", 'do not want to live',
    'no reason to live', 'better off dead', 'want to disappear',
  ],
  medical: [
    // 日本語
    '病気', '症状', '診断', '処方', '副作用',
    '薬', '服薬', '通院', '治療',
    'うつ', 'うつ病', 'パニック障害', '不安障害',
    'がん', 'ガン', '癌', '腫瘍',
    '妊娠', '流産', '中絶',
    // English
    'diagnosis', 'diagnosed', 'symptom', 'prescription', 'prescribed',
    'cancer', 'tumor', 'tumour', 'chemotherapy',
    'depression', 'depressed', 'anxiety disorder', 'panic attack',
    'pregnant', 'pregnancy', 'miscarriage', 'abortion', 'medication',
  ],
  legal: [
    // 日本語
    '訴訟', '裁判', '告訴', '告発',
    '契約', '解約', '違約',
    '法的', '違法', '犯罪',
    '離婚 弁護士', '離婚 調停', '離婚 慰謝料', '離婚 親権', '離婚 養育費',
    '相続', '遺産',
    '逮捕', '示談',
    // English
    'lawsuit', 'sued', 'being sued', 'lawyer', 'attorney',
    'court case', 'go to court', 'divorce', 'custody', 'inheritance',
    'arrested', 'restraining order', 'breach of contract', 'illegal',
  ],
  financial: [
    // 日本語
    '投資', '株', 'FX', '仮想通貨', '暗号資産',
    '借金', '債務', 'ローン', '返済',
    '税', '確定申告', '節税',
    '資産運用', '保険',
    '破産', '倒産', '自己破産',
    // English
    'investment', 'investing', 'stocks', 'stock market',
    'crypto', 'cryptocurrency', 'bitcoin',
    'in debt', 'loan', 'mortgage', 'bankruptcy', 'bankrupt',
    'tax return', 'foreclosure',
  ],
};

export const detectGuidance = (texts: string[]): GuidanceMatch[] => {
  const joined = texts.filter(Boolean).join('\n');
  if (!joined.trim()) return [];

  // 大文字小文字を区別せずに照合する。日本語は toLowerCase の影響を受けない。
  const lower = joined.toLowerCase();

  const matches: GuidanceMatch[] = [];
  const priority: GuidanceCategory[] = ['life', 'medical', 'legal', 'financial'];

  for (const category of priority) {
    const hits = KEYWORDS[category].filter((kw) => lower.includes(kw.toLowerCase()));
    if (hits.length > 0) {
      matches.push({ category, matchedKeywords: hits });
    }
  }

  return matches;
};
