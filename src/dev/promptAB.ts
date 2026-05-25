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
import type { ChatMessage, Message, Mode, ModeId, OracleCard, Persona, PersonaId } from '../types';

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

export interface MatrixCellResult {
  cellNumber: number;
  personaId: PersonaId;
  modeId: ModeId;
  caseLabel: string;
  query: string;
  cPatternRaw: string | null;
  cPatternFinal: string | null;
  dPatternRaw: string | null;
  dPatternFinal: string | null;
  latencyMs: {
    cTotal: number | null;
    dTotal: number | null;
  };
  error: string | null;
  timestamp: string;
}

export interface MatrixVerificationResult {
  startedAt: string;
  finishedAt: string;
  totalCells: number;
  succeededCells: number;
  failedCells: number;
  cells: MatrixCellResult[];
}

type DevWindow = Window & typeof globalThis & {
  __abResults?: unknown;
  __matrixResult?: MatrixVerificationResult;
  runFullMatrixVerification?: typeof runFullMatrixVerification;
  downloadMatrixResultAsJson?: typeof downloadMatrixResultAsJson;
  downloadMatrixResultAsMarkdown?: typeof downloadMatrixResultAsMarkdown;
};

/**
 * @deprecated Phase 4.11 以降は runFullMatrixVerification を使用してください。
 */
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

  (window as DevWindow).__abResults = results;
};

const finalizeMatrixResult = (
  cells: MatrixCellResult[],
  startedAt: string
): MatrixVerificationResult => ({
  startedAt,
  finishedAt: new Date().toISOString(),
  totalCells: cells.length,
  succeededCells: cells.filter((c) => c.error === null).length,
  failedCells: cells.filter((c) => c.error !== null).length,
  cells,
});

export const runFullMatrixVerification = async (
  options: {
    onProgress?: (cellNumber: number, total: number, label: string) => void;
    continueOnError?: boolean;
  } = {}
): Promise<MatrixVerificationResult> => {
  const { onProgress, continueOnError = true } = options;
  const personas = [PERSONAS.lumina, PERSONAS.zenith, PERSONAS.archivist] as Persona[];
  const modes = [MODES.PURE, MODES.CARD] as Mode[];
  const cards3 = TEST_CASES[3].cards;
  const cells: MatrixCellResult[] = [];
  const startedAt = new Date().toISOString();
  let cellNumber = 0;
  const total = personas.length * modes.length * TEST_CASES.length;

  for (const persona of personas) {
    for (const mode of modes) {
      for (const tc of TEST_CASES) {
        cellNumber += 1;
        const cards = mode.id === 'card' ? cards3 : [];
        const label = `persona=${persona.id} mode=${mode.id} case=${tc.label}`;
        onProgress?.(cellNumber, total, label);
        console.log(`[${cellNumber}/${total}] ${label}`);

        const cell: MatrixCellResult = {
          cellNumber,
          personaId: persona.id,
          modeId: mode.id,
          caseLabel: tc.label,
          query: tc.query,
          cPatternRaw: null,
          cPatternFinal: null,
          dPatternRaw: null,
          dPatternFinal: null,
          latencyMs: { cTotal: null, dTotal: null },
          error: null,
          timestamp: new Date().toISOString(),
        };

        try {
          const cStart = performance.now();
          const cMsgs = buildReceptionMessagesWithoutTuning(persona, mode, cards, [], tc.query);
          const cResult = await fetchOracleTwoStage(cMsgs, (raw) => buildDiscernmentMessages(persona, raw));
          cell.cPatternRaw = cResult.raw;
          cell.cPatternFinal = cResult.final;
          cell.latencyMs.cTotal = performance.now() - cStart;

          const dStart = performance.now();
          const dMsgs = buildReceptionMessages(persona, mode, cards, [], tc.query);
          const dResult = await fetchOracleTwoStage(dMsgs, (raw) => buildDiscernmentMessages(persona, raw));
          cell.dPatternRaw = dResult.raw;
          cell.dPatternFinal = dResult.final;
          cell.latencyMs.dTotal = performance.now() - dStart;

          console.log(
            `[${cellNumber}/${total}] ${label} (cMs=${cell.latencyMs.cTotal.toFixed(0)}, dMs=${cell.latencyMs.dTotal.toFixed(0)})`
          );
        } catch (e: unknown) {
          cell.error = e instanceof Error ? e.message : String(e);
          console.error(`[${cellNumber}/${total}] FAILED: ${label}`, cell.error);
          cells.push(cell);
          if (!continueOnError) {
            const result = finalizeMatrixResult(cells, startedAt);
            (window as DevWindow).__matrixResult = result;
            return result;
          }
          continue;
        }

        cells.push(cell);
      }
    }
  }

  const result = finalizeMatrixResult(cells, startedAt);
  (window as DevWindow).__matrixResult = result;
  return result;
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

/**
 * 検証結果を JSON ファイルとしてダウンロードする。
 * ブラウザのコンソールから呼び出すことを想定。
 */
export const downloadMatrixResultAsJson = (
  result: MatrixVerificationResult,
  filename = `phase-4-9-4-10-verification-${Date.now()}.json`
): void => {
  const blob = new Blob([JSON.stringify(result, null, 2)], {
    type: 'application/json',
  });
  triggerDownload(blob, filename);
};

/**
 * 検証結果を Markdown 表として整形してダウンロードする。
 * 30セル全てを Phase 4.9 検証テンプレートの形式に合わせる。
 */
export const downloadMatrixResultAsMarkdown = (
  result: MatrixVerificationResult,
  filename = `phase-4-9-4-10-verification-${Date.now()}.md`
): void => {
  const md = renderMatrixMarkdown(result);
  const blob = new Blob([md], { type: 'text/markdown' });
  triggerDownload(blob, filename);
};

const triggerDownload = (blob: Blob, filename: string): void => {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

const renderMatrixMarkdown = (result: MatrixVerificationResult): string => {
  const header = [
    '# Phase 4.9 + 4.10 Verification Result',
    '',
    `- Started: ${result.startedAt}`,
    `- Finished: ${result.finishedAt}`,
    `- Total: ${result.totalCells} / Succeeded: ${result.succeededCells} / Failed: ${result.failedCells}`,
    '',
    '## Matrix',
    '',
    '| # | Persona | Mode | Case | C Raw | C Final | D Raw | D Final | C ms | D ms | Error |',
    '|---|---|---|---|---|---|---|---|---|---|---|',
  ];
  const rows = result.cells.map((c) => {
    const escapeCell = (s: string | null): string =>
      s === null
        ? ''
        : s
            .replace(/\\/g, '\\\\')
            .replace(/\|/g, '\\|')
            .replace(/\r?\n/g, '')
            .slice(0, 200);

    return `| ${c.cellNumber} | ${c.personaId} | ${c.modeId} | ${escapeCell(c.caseLabel)} | ${escapeCell(c.cPatternRaw)} | ${escapeCell(c.cPatternFinal)} | ${escapeCell(c.dPatternRaw)} | ${escapeCell(c.dPatternFinal)} | ${c.latencyMs.cTotal?.toFixed(0) ?? ''} | ${c.latencyMs.dTotal?.toFixed(0) ?? ''} | ${escapeCell(c.error)} |`;
  });

  return [...header, ...rows, ''].join('\n');
};

if (typeof window !== 'undefined' && import.meta.env.DEV) {
  const devWindow = window as DevWindow;
  devWindow.runFullMatrixVerification = runFullMatrixVerification;
  devWindow.downloadMatrixResultAsJson = downloadMatrixResultAsJson;
  devWindow.downloadMatrixResultAsMarkdown = downloadMatrixResultAsMarkdown;
}
