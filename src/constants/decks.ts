import { ORACLE_CARDS } from './cards';
import type { OracleCard, SelfReadingDeck } from '../types';

export const DECK_24_CARDS: readonly OracleCard[] = [
  { name: '呼吸', meaning: '答えを急がず、まず息をひとつ深くする時です。整った呼吸のあとに、次の感覚が見えてきます。' },
  { name: '余白', meaning: 'いま必要なのは、何かを足すことより空けることかもしれません。余白は、次の流れが入る場所です。' },
  { name: '静けさ', meaning: '外側の音から少し離れると、内側の小さな声が聞こえやすくなります。静けさは停止ではなく、調律です。' },
  { name: '境界線', meaning: 'やさしさは、すべてを受け入れることとは限りません。守る線を引くことで、関係はかえって穏やかになります。' },
  { name: '小さな一歩', meaning: '大きく変えようとしなくて大丈夫です。今日できる小さな一歩が、流れの向きを静かに変えます。' },
  { name: '受け取る', meaning: '与えることに慣れすぎているなら、受け取る練習をしてみてください。受け取ることも、循環の一部です。' },
  { name: '手放す', meaning: 'もう役目を終えたものを、責めずに置いていく時です。手放すことは、失うことではなく軽くなることです。' },
  { name: '待つ', meaning: 'いまは押し進めるより、熟すのを待つ流れです。止まって見える時間の中でも、見えない準備は進んでいます。' },
  { name: 'まなざし', meaning: '出来事そのものより、どんな目で見ているかが鍵になりそうです。まなざしが変わると、意味も変わります。' },
  { name: '整える', meaning: '心だけでなく、机、部屋、予定、体の感覚を少し整えてみてください。外側の整理が内側の余裕を連れてきます。' },
  { name: '流れ', meaning: 'いまは完全に決め切るより、流れを感じながら進む時です。抵抗が弱まる場所に、次の道があります。' },
  { name: '根', meaning: '高く伸びる前に、足元を確かめる時です。生活、体、安心できる場所が、次の表現を支えてくれます。' },
  { name: '光', meaning: 'すでに見えている希望を、小さくても否定しないでください。光は大きさではなく、向きを教えてくれます。' },
  { name: '影', meaning: '見たくなかった感情にも、あなたを守ろうとした理由があります。無理に消さず、そっと名前をつけてみてください。' },
  { name: 'やわらぐ', meaning: 'かたく握っていたものを、少しゆるめる時です。正しさよりも、呼吸できる選び方を探してみてください。' },
  { name: '選ぶ', meaning: 'すべてを選ぶことはできなくても、いま大切にするものは選べます。小さな選択が、自分の輪郭を作ります。' },
  { name: '信じる', meaning: '根拠が完全にそろう前でも、静かに信じてよい感覚があります。信じるとは、急ぐことではなく、離れないことです。' },
  { name: '休む', meaning: '休むことは遅れることではありません。回復したあなたの感覚が、次の判断をやさしく正確にします。' },
  { name: 'ほどく', meaning: '複雑に絡まったものを、一度に解かなくて大丈夫です。ひとつの結び目に気づくだけで、全体がゆるみ始めます。' },
  { name: 'つなぐ', meaning: '点と点が、少しずつ線になっていく時です。無関係に見えた経験が、今のあなたを支える意味を持ち始めます。' },
  { name: 'いまここ', meaning: '過去の答えや未来の不安から少し戻って、今の体感を見てください。次の一歩は、いまの中にあります。' },
  { name: '扉', meaning: 'まだ開けていない可能性が近くにあります。無理に飛び込まず、まずは扉の前に立ってみるだけで十分です。' },
  { name: '種', meaning: '目に見える成果になる前の、小さな始まりが置かれています。焦らず水をやるように、今日の行動を重ねてください。' },
  { name: '帰る', meaning: '外に探しに行きすぎた時は、自分の中心へ戻る合図です。戻ることは後退ではなく、本来の場所を思い出すことです。' },
];

export const DECK_36_CARDS: readonly OracleCard[] = [];

export const DECKS: readonly SelfReadingDeck[] = [
  {
    id: 'classic48',
    nameKey: 'selfReading.deck.classic48.name',
    descriptionKey: 'selfReading.deck.classic48.description',
    ready: true,
    cards: ORACLE_CARDS,
  },
  {
    id: 'deck24',
    nameKey: 'selfReading.deck.deck24.name',
    descriptionKey: 'selfReading.deck.deck24.description',
    ready: DECK_24_CARDS.length > 0,
    cards: DECK_24_CARDS,
  },
  {
    id: 'deck36',
    nameKey: 'selfReading.deck.deck36.name',
    descriptionKey: 'selfReading.deck.deck36.description',
    ready: false,
    cards: DECK_36_CARDS,
  },
];
