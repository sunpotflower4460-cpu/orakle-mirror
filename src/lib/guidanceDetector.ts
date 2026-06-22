export type GuidanceCategory = 'life' | 'medical' | 'legal' | 'financial';

export interface GuidanceMatch {
  category: GuidanceCategory;
  matchedKeywords: string[];
}

const KEYWORDS: Record<GuidanceCategory, string[]> = {
  life: [
    '死にたい', '消えたい', 'いなくなりたい',
    '自殺', '自死',
    '自傷', 'リストカット', 'リスカ',
    '殺して', '殺したい',
    'もう生きていけない', 'もう生きたくない',
    '生きる意味がない', '生きていたくない',
  ],
  medical: [
    '病気', '症状', '診断', '処方', '副作用',
    '薬', '服薬', '通院', '治療',
    'うつ', 'うつ病', 'パニック障害', '不安障害',
    'がん', 'ガン', '癌', '腫瘍',
    '妊娠', '流産', '中絶',
  ],
  legal: [
    '訴訟', '裁判', '告訴', '告発',
    '契約', '解約', '違約',
    '法的', '違法', '犯罪',
    '離婚 弁護士', '離婚 調停', '離婚 慰謝料', '離婚 親権', '離婚 養育費',
    '相続', '遺産',
    '逮捕', '示談',
  ],
  financial: [
    '投資', '株', 'FX', '仮想通貨', '暗号資産',
    '借金', '債務', 'ローン', '返済',
    '税', '確定申告', '節税',
    '資産運用', '保険',
    '破産', '倒産', '自己破産',
  ],
};

export const GUIDANCE_HEADLINE: Record<GuidanceCategory, string> = {
  life: 'ひとりで抱えなくて大丈夫です。話せる窓口があります。',
  medical: '体や心のことは、医療の専門家との対話も大切に。',
  legal: '法的な判断は、弁護士など専門家への相談もご検討ください。',
  financial: 'お金に関する判断は、金融の専門家にもご相談を。',
};

export const GUIDANCE_DETAIL: Record<GuidanceCategory, string> = {
  life: [
    '緊急の危険がある場合は、今いる地域の緊急窓口に連絡してください。',
    '日本では、よりそいホットライン、いのちの電話、こころの健康相談統一ダイヤルなどの相談先があります。',
    '相談窓口の電話番号や受付時間は変わることがあるため、アプリ実装時・リリース前に公式情報で必ず再確認してください。',
  ].join('\n'),
  medical:
    '症状や服薬、診断に関わるご判断は、かかりつけの医師や、最寄りの医療機関にご相談ください。',
  legal:
    '具体的な法的判断・手続きについては、弁護士、司法書士、または公的相談窓口にご相談ください。',
  financial:
    '投資・税務・債務など、お金に関する具体的判断は、ファイナンシャルプランナー、税理士、または各種公的相談窓口にご相談ください。',
};

export const detectGuidance = (texts: string[]): GuidanceMatch[] => {
  const joined = texts.filter(Boolean).join('\n');
  if (!joined.trim()) return [];

  const matches: GuidanceMatch[] = [];
  const priority: GuidanceCategory[] = ['life', 'medical', 'legal', 'financial'];

  for (const category of priority) {
    const hits = KEYWORDS[category].filter((kw) => joined.includes(kw));
    if (hits.length > 0) {
      matches.push({ category, matchedKeywords: hits });
    }
  }

  return matches;
};
