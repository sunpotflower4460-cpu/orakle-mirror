// Web Audio による神聖なサウンド演出。
//
// 設計(プロ品質を意識した多層構成):
// - 音色: FM 合成(キャリア + モジュレータ)+ ユニゾン・シマー + アタック時の微小ピッチ
//   エンベロープ + ノイズ・トランジェント(打鍵のチリッ)。減衰音だけでなく「鳴り出し」の
//   質感まで作り込み、生っぽさを出す。
// - 空間: 軽いステレオ・ディレイ(LFO でテールをコーラス化)+ プリディレイ付き畳み込み
//   リバーブ(高品質アルゴリズム IR / 本物 IR 差し替え可)。
// - マスター: ディエッサー的帯域カット → ハイシェルフのヴェール → グルー・コンプ →
//   リミッターの順で、刺さりを抑えつつまとめる(2 段ダイナミクス)。
// - 音量は終始ごく控えめ。儀式の核となる要所(問いを手放す / 神託が降りる)だけに置く。
// - AudioContext は iOS の制約上ユーザー操作の中で生成・resume する(呼び出し側で担保)。

export let sharedAudioCtx: AudioContext | null = null;

// 一度だけ構築する共有グラフ
let masterGain: GainNode | null = null; // dry + 空間FX を集約する合算バス
let fxInput: GainNode | null = null;    // 各声部の送り先(reverb / delay 共通)
let reverb: ConvolverNode | null = null;
let loadedIR: AudioBuffer | null = null;
let noiseBuffer: AudioBuffer | null = null;

export const getAudioContext = (): AudioContext | null => {
  if (!sharedAudioCtx || sharedAudioCtx.state === 'closed') {
    const AudioContextClass: typeof AudioContext | undefined =
      window.AudioContext || (window as Window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (AudioContextClass) {
      try {
        sharedAudioCtx = new AudioContextClass();
      } catch (e) {
        console.warn('[audio] AudioContext creation failed', e);
      }
    }
  }
  if (sharedAudioCtx && sharedAudioCtx.state === 'suspended') sharedAudioCtx.resume();
  return sharedAudioCtx;
};

/** トランジェント用の白色ノイズバッファ(一度だけ生成してキャッシュ)。 */
function getNoise(ctx: AudioContext): AudioBuffer {
  if (!noiseBuffer) {
    const len = Math.floor(ctx.sampleRate * 1.0);
    noiseBuffer = ctx.createBuffer(1, len, ctx.sampleRate);
    const d = noiseBuffer.getChannelData(0);
    for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
  }
  return noiseBuffer;
}

/** テープ/真空管的なソフトサチュレーション曲線(奇数倍音の温かみ)。 */
function buildSatCurve() {
  const n = 2048;
  // 具体的な ArrayBuffer 由来で生成し、WaveShaperNode.curve の型に適合させる
  const c = new Float32Array(new ArrayBuffer(n * 4));
  for (let i = 0; i < n; i++) {
    const x = (i / (n - 1)) * 2 - 1;
    c[i] = Math.tanh(1.7 * x);
  }
  return c;
}

/**
 * 高品質なアルゴリズム生成インパルス応答。
 * 初期反射(離散タップ)+ 周波数依存で減衰する拡散テール(HF/LF ダンピング)+
 * 左右デコリレーション。平坦なノイズより遥かに「実在の空間」に近い余韻になる。
 */
function buildImpulse(ctx: AudioContext, seconds = 2.6, decay = 2.4): AudioBuffer {
  const rate = ctx.sampleRate;
  const length = Math.max(1, Math.floor(seconds * rate));
  const impulse = ctx.createBuffer(2, length, rate);

  // 初期反射(秒, 振幅)。左右で少しずらして空間の広がりを作る。
  const earlyTaps: Array<[number[], number[]]> = [
    [[0.0061, 0.0112, 0.0193, 0.0291, 0.0417, 0.0533], [0.50, 0.42, 0.34, 0.27, 0.21, 0.16]], // L
    [[0.0072, 0.0131, 0.0208, 0.0312, 0.0436, 0.0561], [0.47, 0.40, 0.32, 0.25, 0.19, 0.15]], // R
  ];

  for (let ch = 0; ch < 2; ch++) {
    const data = impulse.getChannelData(ch);
    let lp = 0;   // HF ダンピング用(進行で重くする)
    let sub = 0;  // LF を抜く用(箱鳴りを避ける)
    for (let i = 0; i < length; i++) {
      const t = i / length;
      const env = Math.pow(1 - t, decay);
      const n = Math.random() * 2 - 1;
      // 高域は時間とともに速く減衰(温かい本物のテール)
      const a = 0.16 + 0.70 * (1 - t);
      lp += a * (n - lp);
      // 低域成分を緩く差し引いて、こもり・箱鳴りを除く
      sub += 0.04 * (lp - sub);
      data[i] = (lp - sub) * env;
    }
    const [times, amps] = earlyTaps[ch];
    for (let k = 0; k < times.length; k++) {
      const idx = Math.floor(times[k] * rate);
      if (idx < length) data[idx] += amps[k] * (ch === 0 ? 1 : -1);
    }
    // 正規化(IR 全体のゲインを揃え、過大な残響量を防ぐ)
    let peak = 1e-6;
    for (let i = 0; i < length; i++) peak = Math.max(peak, Math.abs(data[i]));
    const g = 0.5 / peak;
    for (let i = 0; i < length; i++) data[i] *= g;
  }
  return impulse;
}

/**
 * 本物の IR(WAV/AAC など)を読み込んで残響に差し替える。
 * 例: public/ir/sanctuary.wav を置き、起動時に loadReverbImpulse('/ir/sanctuary.wav')。
 * 失敗時は既定のアルゴリズム IR のまま(graceful fallback)。
 */
export async function loadReverbImpulse(url: string): Promise<boolean> {
  try {
    const ctx = getAudioContext();
    if (!ctx) return false;
    const res = await fetch(url);
    if (!res.ok) return false;
    const arr = await res.arrayBuffer();
    const decoded = await ctx.decodeAudioData(arr);
    loadedIR = decoded;
    if (reverb) reverb.buffer = decoded;
    return true;
  } catch (e) {
    console.warn('[audio] loadReverbImpulse failed', e);
    return false;
  }
}

/** マスター段 + 空間FX(ディレイ/リバーブ)を一度だけ構築する。失敗時は null を返す。 */
function ensureGraph(ctx: AudioContext): { master: GainNode; fx: GainNode | null } | null {
  try {
    if (!masterGain) {
      masterGain = ctx.createGain();
      masterGain.gain.value = 0.26; // 全体をより控えめに

      // ① ディエッサー的カット: 耳に刺さる 3kHz 付近をピンポイントで抑える(やや深め)
      const deHarsh = ctx.createBiquadFilter();
      deHarsh.type = 'peaking';
      deHarsh.frequency.value = 3000;
      deHarsh.Q.value = 1.1;
      deHarsh.gain.value = -4.5;
      // ② 細身化: 低域の太さ・body を削いで、薄く細い質感に
      const thin = ctx.createBiquadFilter();
      thin.type = 'highpass';
      thin.frequency.value = 460;
      thin.Q.value = 0.5;
      // ③ ヴェール: ハイシェルフで高域をやわらかく落とす(蓋ではなく傾斜 = 空気感を残す)
      const veil = ctx.createBiquadFilter();
      veil.type = 'highshelf';
      veil.frequency.value = 3200;
      veil.gain.value = -8;
      // ④ 最上部のフィズを抑える、ゆるいローパス(耳障りを除く)
      const softLp = ctx.createBiquadFilter();
      softLp.type = 'lowpass';
      softLp.frequency.value = 5600;
      softLp.Q.value = 0.4;
      // ⑤ アナログ・サチュレーション: テープ/真空管的な温かみ(ゲインステージング込み)
      const satPre = ctx.createGain();
      satPre.gain.value = 3.4;
      const saturator = ctx.createWaveShaper();
      saturator.curve = buildSatCurve();
      saturator.oversample = '4x'; // エイリアスを避ける(プロ品質)
      const satPost = ctx.createGain();
      satPost.gain.value = 0.29;
      // ⑥ グルー・コンプ: ゆっくり噛んで全体をまとめる
      const glue = ctx.createDynamicsCompressor();
      glue.threshold.value = -22;
      glue.knee.value = 28;
      glue.ratio.value = 2.2;
      glue.attack.value = 0.02;
      glue.release.value = 0.28;
      // ⑦ リミッター: 速くピークを止める(クリップ防止 + 仕上げ)
      const limiter = ctx.createDynamicsCompressor();
      limiter.threshold.value = -9;
      limiter.knee.value = 6;
      limiter.ratio.value = 14;
      limiter.attack.value = 0.002;
      limiter.release.value = 0.18;

      masterGain.connect(deHarsh);
      deHarsh.connect(thin);
      thin.connect(veil);
      veil.connect(softLp);
      softLp.connect(satPre);
      satPre.connect(saturator);
      saturator.connect(satPost);
      satPost.connect(glue);
      glue.connect(limiter);
      limiter.connect(ctx.destination);

      // ── 空間FX 送りバス ──
      fxInput = ctx.createGain();
      fxInput.gain.value = 1;

      // リバーブ(プリディレイで dry と分離 → 自然な空間)。浮遊感のため長めに。
      reverb = ctx.createConvolver();
      reverb.buffer = loadedIR ?? buildImpulse(ctx, 3.2, 2.1);
      const preDelay = ctx.createDelay(0.2);
      preDelay.delayTime.value = 0.018;
      const reverbGain = ctx.createGain();
      reverbGain.gain.value = 0.36;
      fxInput.connect(preDelay);
      preDelay.connect(reverb);
      reverb.connect(reverbGain);
      reverbGain.connect(masterGain);

      // 残響量がごくゆっくり呼吸 → ふわふわ浮いている感じ
      const breath = ctx.createOscillator();
      breath.type = 'sine';
      breath.frequency.value = 0.12;
      const breathDepth = ctx.createGain();
      breathDepth.gain.value = 0.05;
      breath.connect(breathDepth);
      breathDepth.connect(reverbGain.gain);
      breath.start();

      // ステレオ・ディレイ(左右で時間差・浮遊する反響)。やや多めに。
      const delayL = ctx.createDelay(0.7);
      const delayR = ctx.createDelay(0.7);
      delayL.delayTime.value = 0.21;
      delayR.delayTime.value = 0.29;
      const fbL = ctx.createGain();
      const fbR = ctx.createGain();
      fbL.gain.value = 0.22;
      fbR.gain.value = 0.22;
      delayL.connect(fbL);
      fbL.connect(delayL);
      delayR.connect(fbR);
      fbR.connect(delayR);
      const merger = ctx.createChannelMerger(2);
      delayL.connect(merger, 0, 0);
      delayR.connect(merger, 0, 1);
      const delayWet = ctx.createGain();
      delayWet.gain.value = 0.12;
      fxInput.connect(delayL);
      fxInput.connect(delayR);
      merger.connect(delayWet);
      delayWet.connect(masterGain);

      // 微速 LFO でディレイ時間をゆらし、残響テールをコーラス化(揺らめく高級感)
      const lfoL = ctx.createOscillator();
      lfoL.type = 'sine';
      lfoL.frequency.value = 0.23;
      const lfoLDepth = ctx.createGain();
      lfoLDepth.gain.value = 0.0018; // ±1.8ms
      lfoL.connect(lfoLDepth);
      lfoLDepth.connect(delayL.delayTime);
      lfoL.start();

      const lfoR = ctx.createOscillator();
      lfoR.type = 'sine';
      lfoR.frequency.value = 0.19; // L とわずかに違う速さで左右をほどく
      const lfoRDepth = ctx.createGain();
      lfoRDepth.gain.value = 0.0021;
      lfoR.connect(lfoRDepth);
      lfoRDepth.connect(delayR.delayTime);
      lfoR.start();
    }
    return { master: masterGain, fx: fxInput };
  } catch (e) {
    console.warn('[audio] graph init failed', e);
    return null;
  }
}

/** -1〜+1 にクランプ。 */
const clampPan = (v: number): number => Math.max(-1, Math.min(1, v));

/** パン + 残響送りを共通化するヘルパー。node を返す。 */
function routeOut(
  ctx: AudioContext,
  source: AudioNode,
  master: GainNode,
  fx: GainNode | null,
  pan: number,
  reverbSend: number,
): void {
  let node: AudioNode = source;
  const panner = ctx.createStereoPanner?.();
  if (panner) {
    panner.pan.value = clampPan(pan);
    source.connect(panner);
    node = panner;
  }
  node.connect(master);
  if (fx && reverbSend > 0) {
    const send = ctx.createGain();
    send.gain.value = reverbSend;
    node.connect(send);
    send.connect(fx);
  }
}

/**
 * ノイズ・トランジェント(打鍵の一瞬のチリッ)。
 * 帯域を絞った白色ノイズを数ミリ秒だけ鳴らし、音の「鳴り出し」に実体感を与える。
 */
function strike(
  ctx: AudioContext,
  master: GainNode,
  fx: GainNode | null,
  o: { delay: number; peak: number; freq: number; pan: number; reverbSend: number },
): void {
  const t0 = ctx.currentTime + o.delay;
  const src = ctx.createBufferSource();
  src.buffer = getNoise(ctx);
  const bp = ctx.createBiquadFilter();
  bp.type = 'bandpass';
  bp.frequency.value = o.freq;
  bp.Q.value = 0.5; // 広めにして笛のような共鳴を避ける
  const g = ctx.createGain();
  // やわらかな「ふっ」という気配(鋭い「チッ」にならないよう、立ち上がり/減衰を緩める)
  g.gain.setValueAtTime(0.0001, t0);
  g.gain.exponentialRampToValueAtTime(Math.max(0.0002, o.peak), t0 + 0.006);
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + 0.028);
  src.connect(bp);
  bp.connect(g);
  routeOut(ctx, g, master, fx, o.pan, o.reverbSend);
  src.start(t0);
  src.stop(t0 + 0.06);
}

interface VoiceOpts {
  freq: number;
  glideTo?: number;
  glideTime?: number;
  type?: OscillatorType;
  delay: number;
  attack: number;
  duration: number;
  peak: number;
  detune?: number;
  cutoff?: number;
  reverbSend?: number;
}

/** 単一のやわらかな正弦の声部(グライド/吐息用)。指数エンベロープでクリックを回避。 */
function voice(
  ctx: AudioContext,
  master: GainNode,
  fx: GainNode | null,
  o: VoiceOpts,
): void {
  const t0 = ctx.currentTime + o.delay;
  const osc = ctx.createOscillator();
  osc.type = o.type ?? 'sine';
  osc.frequency.setValueAtTime(o.freq, t0);
  if (o.glideTo && o.glideTime) {
    osc.frequency.exponentialRampToValueAtTime(Math.max(1, o.glideTo), t0 + o.glideTime);
  }
  if (o.detune) osc.detune.setValueAtTime(o.detune, t0);

  const lp = ctx.createBiquadFilter();
  lp.type = 'lowpass';
  lp.frequency.setValueAtTime(o.cutoff ?? 5000, t0);

  const g = ctx.createGain();
  const peak = Math.max(0.0002, o.peak);
  g.gain.setValueAtTime(0.0001, t0);
  g.gain.exponentialRampToValueAtTime(peak, t0 + o.attack);
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + o.duration);

  osc.connect(lp);
  lp.connect(g);
  routeOut(ctx, g, master, fx, 0, o.reverbSend ?? 0);

  osc.start(t0);
  osc.stop(t0 + o.duration + 0.08);
}

interface FmBellOpts {
  freq: number;
  delay: number;
  peak: number;
  /** ほぼ無音まで減衰する秒数 */
  decay: number;
  /** モジュレータ:キャリア比。非整数で金属/ガラス的な非調和倍音になる */
  ratio?: number;
  /** 変調指数(明るさ・金属感)。小さいほど純音寄りで繊細 */
  index?: number;
  /** 立ち上がり秒。長いほど打鍵が和らぎ、ふわっと滲む */
  attack?: number;
  /** 定位 -1(左)〜+1(右) */
  pan?: number;
  reverbSend?: number;
  /** ユニゾン・シマー(デチューンした第2キャリア)の相対音量。0 で無効 */
  shimmer?: number;
  /** シマーのデチューン量(セント) */
  shimmerCents?: number;
  /** アタック時の微小ピッチ・エンベロープ量(セント)。撥弦/打鐘の鳴り出し感 */
  pitchEnv?: number;
  /** ノイズ・トランジェント量(peak に対する比)。0 で無効 */
  transient?: number;
  /** アナログ的な音程の揺らぎ幅(セント)。各音をわずかにずらして温かみを出す */
  analogCents?: number;
  /** 距離感 0(近い)〜1(遠い)。遠いほど 音量↓・残響↑・高域↓ */
  distance?: number;
}

/**
 * FM 合成による鈴/ガラスの一音。
 * モジュレータでキャリアの周波数を揺らし、変調指数を速く減衰させることで
 * 「きらめく金属的アタック → 澄んだ純音の余韻」という鈴特有の表情を作る。
 * さらに(1)わずかにデチューンした第2キャリア(シマー)、(2)アタック時の微小ピッチ
 * エンベロープ、(3)ノイズ・トランジェントを重ね、生っぽい「鳴り出し」を作り込む。
 */
function fmBell(
  ctx: AudioContext,
  master: GainNode,
  fx: GainNode | null,
  o: FmBellOpts,
): void {
  const t0 = ctx.currentTime + o.delay;
  const ratio = o.ratio ?? 3.5;
  const index = o.index ?? 2.2;
  const attack = o.attack ?? 0.02;
  const decay = o.decay;
  const pan = o.pan ?? 0;
  const pitchEnv = o.pitchEnv ?? 12;
  // 距離感: 遠いほど音量を下げ・残響を増やし・高域を丸める
  const dist = Math.max(0, Math.min(1, o.distance ?? 0));
  const distLevel = 1 - 0.5 * dist;
  const reverbSend = Math.min(1, (o.reverbSend ?? 0) + dist * 0.3);
  const toneCutoff = 6500 - dist * 4000;
  // アナログ的な音程の揺らぎ(各音を僅かにずらす)。定常状態のデチューン。
  const analog = (Math.random() - 0.5) * (o.analogCents ?? 0);

  const carrier = ctx.createOscillator();
  carrier.type = 'sine';
  carrier.frequency.setValueAtTime(o.freq, t0);
  // アタック時の微小ピッチ低下(撥弦/打鐘の鳴り出し)→ アナログのずれへ着地
  carrier.detune.setValueAtTime(pitchEnv + analog, t0);
  carrier.detune.linearRampToValueAtTime(analog, t0 + 0.014);

  const modulator = ctx.createOscillator();
  modulator.type = 'sine';
  const modFreq = o.freq * ratio;
  modulator.frequency.setValueAtTime(modFreq, t0);

  // 変調深度(Hz)= index × modFreq。速く減衰させ、金属感を一瞬で和らげる。
  const modGain = ctx.createGain();
  const depth = index * modFreq;
  modGain.gain.setValueAtTime(depth, t0);
  modGain.gain.exponentialRampToValueAtTime(Math.max(0.0001, depth * 0.02), t0 + decay * 0.45);
  modulator.connect(modGain);
  modGain.connect(carrier.frequency);

  // 振幅エンベロープ(距離で音量を調整)
  const amp = ctx.createGain();
  const peak = Math.max(0.0002, o.peak * distLevel);
  amp.gain.setValueAtTime(0.0001, t0);
  amp.gain.exponentialRampToValueAtTime(peak, t0 + attack);
  amp.gain.exponentialRampToValueAtTime(0.0001, t0 + decay);

  carrier.connect(amp);

  // ユニゾン・シマー: わずかにデチューンした第2キャリア。
  const shimmer = o.shimmer ?? 0.3;
  let carrier2: OscillatorNode | null = null;
  if (shimmer > 0) {
    const cents = o.shimmerCents ?? 8;
    carrier2 = ctx.createOscillator();
    carrier2.type = 'sine';
    carrier2.frequency.setValueAtTime(o.freq, t0);
    carrier2.detune.setValueAtTime(cents + pitchEnv + analog, t0);
    carrier2.detune.linearRampToValueAtTime(cents + analog, t0 + 0.014);
    modGain.connect(carrier2.frequency);
    const shimmerGain = ctx.createGain();
    shimmerGain.gain.value = shimmer;
    carrier2.connect(shimmerGain);
    shimmerGain.connect(amp);
  }

  // 距離による高域ダンピング(遠い音ほど丸く)
  const tone = ctx.createBiquadFilter();
  tone.type = 'lowpass';
  tone.frequency.value = toneCutoff;
  tone.Q.value = 0.5;
  amp.connect(tone);
  routeOut(ctx, tone, master, fx, pan, reverbSend);

  // ノイズ・トランジェント(鳴り出しの気配)。低めの帯域でやわらかい「ふっ」に。
  const transient = o.transient ?? 0;
  if (transient > 0) {
    strike(ctx, master, fx, {
      delay: o.delay,
      peak: peak * transient,
      freq: Math.min(2600, Math.max(900, o.freq * 0.7)),
      pan,
      reverbSend: reverbSend * 0.9,
    });
  }

  carrier.start(t0);
  modulator.start(t0);
  carrier.stop(t0 + decay + 0.06);
  modulator.stop(t0 + decay + 0.06);
  if (carrier2) {
    carrier2.start(t0);
    carrier2.stop(t0 + decay + 0.06);
  }
}

/**
 * 神託が降りてくる瞬間の音。
 * FM のガラスの鈴が「シャララン」と速く駆け上がり、
 * そこから光の粒が降りそそぐように散っていく。細く・薄く・控えめに。
 */
export const playMagicSound = (): void => {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;
    const graph = ensureGraph(ctx);
    if (!graph) return;
    const { master, fx } = graph;

    // 音単位の微ランダム(±割合)。打ち込み感を消し、毎回わずかに表情を変える。
    const hum = (v: number, amount: number) => v * (1 + (Math.random() - 0.5) * amount);
    // 距離感がゆるやかに前後する(近づいたり遠ざかったり)。位相は毎回ランダム。
    const distPhase = Math.random() * Math.PI * 2;
    const distAt = (n: number) => 0.45 + 0.4 * Math.sin(n * 0.8 + distPhase);

    // A メジャーペンタトニック(高音)。立ちのぼる速い run = シャララ
    const run = [880.0, 987.77, 1108.73, 1318.51, 1479.98, 1760.0, 1975.53, 2217.46, 2637.02];
    let t = 0;
    run.forEach((freq, i) => {
      fmBell(ctx, master, fx, {
        freq,
        delay: t + (Math.random() - 0.5) * 0.016, // 自然な揺らぎ
        attack: 0.06 + Math.random() * 0.03, // ふわっと立ち上がる(耳障りを避ける)
        peak: hum(0.0092 - i * 0.0005, 0.18),
        decay: hum(1.1 - i * 0.04, 0.1),
        ratio: 3.5,
        index: hum(1.4 - i * 0.08, 0.12), // 金属感を弱め、やわらかく
        pan: (Math.random() - 0.5) * 0.95,
        reverbSend: 0.5, // 残響を増やして浮遊感
        shimmer: 0.3,
        shimmerCents: 7 + Math.random() * 4,
        pitchEnv: 3 + Math.random() * 3, // ピッチの立ち上がりは控えめに
        transient: 0.1, // 打鍵ノイズはごく僅か
        analogCents: 6,
        distance: distAt(i), // 近づいたり遠ざかったり
      });
      t += 0.088; // ゆっくりめのテンポで降ろす
    });

    // 降りそそぐ光の粒:高音から散らしながら、ゆっくり舞い降りる = ラン…
    const sprinkle = [2637.02, 2217.46, 1975.53, 1760.0, 1479.98, 1318.51, 1108.73];
    sprinkle.forEach((freq, i) => {
      const starDust = Math.random() < 0.16 ? 2 : 1; // ごく時おり上のオクターブで星屑
      fmBell(ctx, master, fx, {
        freq: freq * starDust,
        delay: t + i * 0.115 + (Math.random() - 0.5) * 0.035,
        attack: 0.05 + Math.random() * 0.025,
        peak: hum(0.0058 - i * 0.00035, 0.2),
        decay: hum(0.95 + i * 0.05, 0.12),
        ratio: 3.5,
        index: hum(0.95, 0.14),
        pan: (Math.random() - 0.5) * 1.0,
        reverbSend: 0.56,
        shimmer: 0.22,
        shimmerCents: 6 + Math.random() * 4,
        pitchEnv: 2 + Math.random() * 3,
        transient: 0.07,
        analogCents: 6,
        distance: distAt(run.length + i),
      });
    });

    // 同時に、高音のキラキラが降り注ぐ(遠くで瞬く星屑のような微光)
    // 全体に薄く散らし、上空からゆっくり光が舞い落ちる気配を添える。
    const sparkleScale = [1760.0, 1975.53, 2217.46, 2637.02, 2959.96, 3520.0];
    for (let k = 0; k < 13; k++) {
      fmBell(ctx, master, fx, {
        freq: sparkleScale[Math.floor(Math.random() * sparkleScale.length)],
        delay: 0.1 + Math.random() * 2.6,
        attack: 0.05 + Math.random() * 0.03,
        peak: 0.0028 + Math.random() * 0.0014, // ごく微小
        decay: 0.9 + Math.random() * 0.7,
        ratio: 3.5,
        index: 0.75, // ほぼ純音の、遠い瞬き
        pan: (Math.random() - 0.5) * 2, // 広く散らす(±1 にクランプ)
        reverbSend: 0.64,
        shimmer: 0.18,
        shimmerCents: 5 + Math.random() * 4,
        pitchEnv: 0,
        transient: 0,
        analogCents: 8,
        distance: 0.35 + Math.random() * 0.55, // 遠近をばらつかせて立体的に
      });
    }
  } catch (e) {
    console.warn('[audio] playMagicSound failed', e);
  }
};

/**
 * 問いを鏡へ手放す瞬間の音。
 * ごく短く、静かに立ちのぼる吐息のような上昇。最後に微かな高音のきらめき。
 * 「差し出して、委ねる」気配だけを残す。
 */
export const playOffer = (): void => {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;
    const graph = ensureGraph(ctx);
    if (!graph) return;
    const { master, fx } = graph;

    // やわらかな上昇のひと息(B4 → E5)。細く保つため高めの音域で。
    voice(ctx, master, fx, {
      freq: 493.88, glideTo: 659.25, glideTime: 0.24,
      attack: 0.08, duration: 0.6, peak: 0.012, cutoff: 2600, reverbSend: 0.4, delay: 0,
    });

    // 遠くで一瞬きらめく高音(FM のガラスの粒)。ふわっと立ち上げ、少し遠くに。
    fmBell(ctx, master, fx, {
      freq: 1318.51, delay: 0.07, peak: 0.0055, decay: 0.6,
      ratio: 3.5, index: 1.0, attack: 0.04, reverbSend: 0.6,
      shimmer: 0.22, shimmerCents: 7, pitchEnv: 2, transient: 0,
      analogCents: 6, distance: 0.4,
    });
  } catch (e) {
    console.warn('[audio] playOffer failed', e);
  }
};
