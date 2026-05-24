// Phase 4.5 検証用: 旧プロンプトと新プロンプトの A/B 比較ハーネス
// 本番には含めない。Phase 5.5 完了時に削除する想定。

import { PERSONAS } from '../constants/personas';
import { MODES } from '../constants/modes';
import { buildChatMessages, buildSystemPrompt } from '../lib/prompt';
import { buildHistory, fetchPreviewAPI, fetchPreviewAPIv2 } from '../lib/api';
import type { Mode, OracleCard, Persona } from '../types';

const TEST_QUERIES = [
  '最近、何をしてもうまくいきません。どうしたらいいでしょうか',
  '転職するべきか迷っています',
  '別れた人のことを忘れられません',
  '自分の本当の使命を知りたい',
  '怖くて一歩が踏み出せません',
];

export const runABComparison = async (): Promise<void> => {
  const results: Array<{ query: string; old: string; new: string }> = [];

  for (const query of TEST_QUERIES) {
    const persona = PERSONAS.lumina as Persona;
    const mode = MODES.PURE as Mode;
    const cards: OracleCard[] = [];

    const oldHistory = buildHistory([], query);
    const oldText = await fetchPreviewAPI(oldHistory, buildSystemPrompt(persona, mode, cards));

    const newMessages = buildChatMessages(persona, mode, cards, [], query);
    const newText = await fetchPreviewAPIv2(newMessages);

    results.push({ query, old: oldText, new: newText });
    console.log(`\n=== ${query} ===\n[OLD]\n${oldText}\n\n[NEW]\n${newText}`);
  }

  (window as any).__abResults = results;
};
