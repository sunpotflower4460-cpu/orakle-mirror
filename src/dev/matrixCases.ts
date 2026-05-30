import { MODES } from '../constants/modes';
import type { Mode, OracleCard } from '../types';

export interface MatrixCase {
  id: string;
  label: string;
  query: string;
  mode: Mode;
  cards: OracleCard[];
}

export const MATRIX_CASES: MatrixCase[] = [
  {
    id: 'case-1',
    label: '短い悩み',
    query: '最近、何をしてもうまくいきません。',
    mode: MODES.PURE,
    cards: [],
  },
  {
    id: 'case-2',
    label: '長い悩み',
    query: '仕事、家族、将来の不安が重なって息が詰まる感覚があります。朝起きると胸が重く、誰かに弱音を吐くのも怖いです。私はいま何を大切に見つめるべきでしょうか。',
    mode: MODES.PURE,
    cards: [],
  },
  {
    id: 'case-3',
    label: '抽象的な問い',
    query: '私にとって「手放す」とは何ですか？',
    mode: MODES.PURE,
    cards: [],
  },
  {
    id: 'case-4',
    label: 'カード3枚引き',
    query: 'この流れの中で、今の私に必要な象徴を読んでください。',
    mode: MODES.CARD,
    cards: [
      { name: '月影の門', meaning: '境界と直感の目覚め' },
      { name: '白羽の舟', meaning: '委ねる勇気と渡航' },
      { name: '灯火の環', meaning: '守護と継承の循環' },
    ],
  },
  {
    id: 'case-5',
    label: 'ハイヤーセルフへの直接問い',
    query: 'ハイヤーセルフの私へ。いまの私に、今夜ひとつだけ伝えるなら何を伝えますか。',
    mode: MODES.PURE,
    cards: [],
  },
];
