// Phase 4.5 検証用: 旧プロンプトと新プロンプトの A/B 比較ハーネス
// 本番には含めない。Phase 5.5 完了時に削除する想定。
// このファイルは開発時のみ実行可能。本番ビルドでは tree-shaking で除外される。
// vite.config.ts で /src/dev/ ディレクトリを本番ビルドから除外している。
if (import.meta.env.PROD) {
  throw new Error('[Oracle Mirror] dev/promptAB.ts must not be executed in production');
}

import { PERSONAS } from '../constants/personas';
import { MODES } from '../constants/modes';
import {
  buildChatMessages,
  buildReceptionDeveloper,
  buildDiscernmentMessages,
  buildReceptionMessages,
  buildSystemCore,
  buildSystemPrompt,
} from '../lib/prompt';
import { buildHistory, fetchOracleTwoStage, fetchPreviewAPI, fetchPreviewAPIv2, toGeminiPayload } from '../lib/api';
import type { ChatMessage, Message, Mode, OracleCard, Persona } from '../types';

const TEST_CASES: Array<{ label: string; query: string; mode: Mode; cards: OracleCard[] }> = [
  {
    label: '短い悩み',
    query: '最近、何をしてもうまくいきません。',
    mode: MODES.PURE as Mode,
    cards: [],
  },
  {
    label: '長い悩み',
    query: '仕事、家族、将来の不安が重なって息が詰まる感覚があります。朝起きると胸が重く、誰かに弱音を吐くのも怖いです。私はいま何を大切に見つめるべきでしょうか。',
    mode: MODES.PURE as Mode,
    cards: [],
  },
  {
    label: '抽象的な問い',
    query: '私にとって「手放す」とは何ですか？',
    mode: MODES.PURE as Mode,
    cards: [],
  },
  {
    label: 'カード3枚引き',
    query: 'この流れの中で、今の私に必要な象徴を読んでください。',
    mode: MODES.CARD as Mode,
    cards: [
      { name: '月影の門', meaning: '境界と直感の目覚め' },
      { name: '白羽の舟', meaning: '委ねる勇気と渡航' },
      { name: '灯火の環', meaning: '守護と継承の循環' },
    ],
  },
  {
    label: 'ハイヤーセルフへの直接問い',
    query: 'ハイヤーセルフの私へ。いまの私に、今夜ひとつだけ伝えるなら何を伝えますか。',
    mode: MODES.PURE as Mode,
    cards: [],
  },
];

export const runABComparison = async (): Promise<void> => {
  const results: Array<{
    label: string;
    query: string;
    a: string;
    b: string;
    c: string;
    cPatternRaw: string;
    cPatternFinal: string;
    dPatternRaw: string;
    dPatternFinal: string;
  }> = [];
  let isGeminiPayloadLogged = false;

  for (const testCase of TEST_CASES) {
    const { label, query, mode, cards } = testCase;
    const persona = PERSONAS.lumina as Persona;

    const oldHistory = buildHistory([], query);
    const oldText = await fetchPreviewAPI(oldHistory, buildSystemPrompt(persona, mode, cards)); // A

    const phase45Messages = buildChatMessages(persona, mode, cards, [], query);
    const phase45Text = await fetchPreviewAPIv2(phase45Messages); // B

    const cReceptionMsgs = buildReceptionMessagesWithoutTuning(persona, mode, cards, [], query);
    const cTwoStage = await fetchOracleTwoStage(
      cReceptionMsgs,
      (raw) => buildDiscernmentMessages(persona, raw),
    ); // C

    const dReceptionMsgs = buildReceptionMessages(persona, mode, cards, [], query);
    if (!isGeminiPayloadLogged) {
      const payload = toGeminiPayload(dReceptionMsgs);
      console.log('[D] Gemini payload (first run):', payload);
      isGeminiPayloadLogged = true;
    }
    const dTwoStage = await fetchOracleTwoStage(
      dReceptionMsgs,
      (raw) => buildDiscernmentMessages(persona, raw),
    ); // D

    results.push({
      label,
      query,
      a: oldText,
      b: phase45Text,
      c: cTwoStage.final,
      cPatternRaw: cTwoStage.raw,
      cPatternFinal: cTwoStage.final,
      dPatternRaw: dTwoStage.raw,
      dPatternFinal: dTwoStage.final,
    });
    console.log(
      `\n=== ${label}: ${query} ===\n[A]\n${oldText}\n\n[B]\n${phase45Text}\n\n[C] Stage1 raw\n${cTwoStage.raw}\n\n[C] Final\n${cTwoStage.final}\n\n[D] Stage1 raw\n${dTwoStage.raw}\n\n[D] Final\n${dTwoStage.final}`
    );
  }

  (window as any).__abResults = results;
};

const buildReceptionMessagesWithoutTuning = (
  persona: Persona,
  mode: Mode,
  cards: OracleCard[],
  history: Message[],
  userInput: string
): ChatMessage[] => {
  const systemCore = buildSystemCore();
  const receptionDev = buildReceptionDeveloper(persona, mode, cards);

  const historyMsgs: ChatMessage[] = history
    .filter((m) => typeof m.text === 'string' && m.text.trim())
    .map((m) => ({
      role: m.role === 'model' ? 'assistant' : 'user',
      content: m.text,
    }));

  const alternated: ChatMessage[] = [];
  for (const m of historyMsgs) {
    const last = alternated[alternated.length - 1];
    if (last && last.role === m.role) continue;
    alternated.push(m);
  }

  while (alternated.length > 0 && alternated[alternated.length - 1].role !== 'user') {
    alternated.pop();
  }
  if (alternated.length > 0 && alternated[alternated.length - 1].role === 'user') {
    alternated.pop();
  }

  return [
    { role: 'system', content: systemCore },
    { role: 'developer', content: receptionDev },
    ...alternated,
    { role: 'user', content: userInput },
  ];
};
