// Web Audio による神聖なサウンド演出。
//
// 方針:
// - 音声アセットは持たず、すべてその場で合成する(依存ゼロ・軽量・劣化なし)。
// - 大聖堂のような残響(Convolver + 合成インパルス応答)で「聖なる余韻」を作る。
// - 音量は終始 控えめ。儀式の核となる要所(問いを手放す / 神託が降りる)だけに置く。
// - AudioContext は iOS の制約上ユーザー操作の中で生成・resume する(呼び出し側で担保)。

export let sharedAudioCtx: AudioContext | null = null;

// 一度だけ構築する共有グラフ(マスター音量 + 細身化 + ヴェール + 残響バス)
let masterGain: GainNode | null = null;
let masterThin: BiquadFilterNode | null = null;
let masterVeil: BiquadFilterNode | null = null;
let reverb: ConvolverNode | null = null;
let reverbGain: GainNode | null = null;

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

/**
 * 残響用インパルス応答を生成する。
 * 指数減衰するノイズ = 広い聖堂で音が遠く溶けていくような余韻になる。
 */
function buildImpulse(ctx: AudioContext, seconds: number, decay: number): AudioBuffer {
  const rate = ctx.sampleRate;
  const length = Math.max(1, Math.floor(seconds * rate));
  const impulse = ctx.createBuffer(2, length, rate);
  for (let ch = 0; ch < 2; ch++) {
    const data = impulse.getChannelData(ch);
    for (let i = 0; i < length; i++) {
      const t = i / length;
      data[i] = (Math.random() * 2 - 1) * Math.pow(1 - t, decay);
    }
  }
  return impulse;
}

/** マスター + 残響バスを一度だけ構築する。失敗時は null を返す。 */
function ensureGraph(ctx: AudioContext): { master: GainNode; verb: ConvolverNode | null } | null {
  try {
    if (!masterGain) {
      masterGain = ctx.createGain();
      masterGain.gain.value = 0.34; // 実機ではごく控えめに(目立たない程度)
      // 細身化(ハイパス): 低域の太さ・body を削いで、薄く細い質感にする
      masterThin = ctx.createBiquadFilter();
      masterThin.type = 'highpass';
      masterThin.frequency.value = 500;
      masterThin.Q.value = 0.5;
      // 薄い膜(ヴェール): 高域をやわらかく丸め、ふわっと霞んだ質感にする
      masterVeil = ctx.createBiquadFilter();
      masterVeil.type = 'lowpass';
      masterVeil.frequency.value = 3400;
      masterVeil.Q.value = 0.5;
      masterGain.connect(masterThin);
      masterThin.connect(masterVeil);
      masterVeil.connect(ctx.destination);
    }
    if (!reverb) {
      reverb = ctx.createConvolver();
      // 軽めの残響: 余韻は短く、空気感だけを添える
      reverb.buffer = buildImpulse(ctx, 1.8, 2.8);
      reverbGain = ctx.createGain();
      reverbGain.gain.value = 0.34;
      reverb.connect(reverbGain);
      reverbGain.connect(masterGain);
    }
    return { master: masterGain, verb: reverb };
  } catch (e) {
    console.warn('[audio] graph init failed', e);
    return null;
  }
}

interface VoiceOpts {
  freq: number;
  /** 指定すると glideTime かけて周波数を滑らかに変化させる(ポルタメント) */
  glideTo?: number;
  glideTime?: number;
  type?: OscillatorType;
  /** ctx.currentTime からの相対秒 */
  delay: number;
  attack: number;
  /** 立ち上がりからほぼ無音に戻るまでの総尺(秒) */
  duration: number;
  peak: number;
  detune?: number;
  /** 倍音を丸めて温かみを出すローパス周波数 */
  cutoff?: number;
  /** 残響への送り量(0〜1) */
  reverbSend?: number;
}

/** 単一のやわらかな声部を鳴らす。クリックノイズを避けるため指数エンベロープを使う。 */
function voice(
  ctx: AudioContext,
  master: GainNode,
  verb: ConvolverNode | null,
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
  g.connect(master);

  if (verb && (o.reverbSend ?? 0) > 0) {
    const send = ctx.createGain();
    send.gain.value = o.reverbSend ?? 0;
    g.connect(send);
    send.connect(verb);
  }

  osc.start(t0);
  osc.stop(t0 + o.duration + 0.08);
}

interface BellOpts {
  freq: number;
  delay: number;
  peak: number;
  /** ほぼ無音まで減衰する秒数 */
  decay: number;
  /** 立ち上がり秒。長いほど打鍵が和らぎ、ふわっと滲む */
  attack?: number;
  /** 定位 -1(左)〜+1(右) */
  pan?: number;
  reverbSend?: number;
}

/**
 * 音楽箱／グロッケンのような澄んだ鈴の粒を一つ鳴らす。
 * 基音に整数倍の倍音を弱く重ね、素早い打鍵→短い減衰で「きらめき」を作る。
 * StereoPanner で左右に散らし、光の粒が降り注ぐ広がりを出す(未対応環境は中央)。
 */
function bell(
  ctx: AudioContext,
  master: GainNode,
  verb: ConvolverNode | null,
  o: BellOpts,
): void {
  const t0 = ctx.currentTime + o.delay;

  const out = ctx.createGain();
  out.gain.value = Math.max(0.0002, o.peak);
  const attack = o.attack ?? 0.02; // やわらかな打鍵(ふわっと滲む)

  // ほぼ純音 + ごく薄い上倍音だけ。太さを出さず、細く繊細なきらめきに。
  const partials = [
    { mult: 1.0, amp: 1.0, dec: o.decay },
    { mult: 2.0, amp: 0.12, dec: o.decay * 0.5 },
    { mult: 3.01, amp: 0.03, dec: o.decay * 0.35 },
  ];
  for (const p of partials) {
    const osc = ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(o.freq * p.mult, t0);
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.0001, t0);
    g.gain.exponentialRampToValueAtTime(p.amp, t0 + attack);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + p.dec);
    osc.connect(g);
    g.connect(out);
    osc.start(t0);
    osc.stop(t0 + p.dec + 0.05);
  }

  let node: AudioNode = out;
  const panner = ctx.createStereoPanner?.();
  if (panner) {
    panner.pan.setValueAtTime(Math.max(-1, Math.min(1, o.pan ?? 0)), t0);
    out.connect(panner);
    node = panner;
  }
  node.connect(master);

  if (verb && (o.reverbSend ?? 0) > 0) {
    const send = ctx.createGain();
    send.gain.value = o.reverbSend ?? 0;
    node.connect(send);
    send.connect(verb);
  }
}

/**
 * 神託が降りてくる瞬間の音。
 * 高音ペンタトニックの鈴が「シャララン」と速く駆け上がり、
 * そこから光の粒が降りそそぐように散っていく。土台に淡い温かなにじみ。
 * 残響は軽く、空気感だけを添える。
 */
export const playMagicSound = (): void => {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;
    const graph = ensureGraph(ctx);
    if (!graph) return;
    const { master, verb } = graph;

    // A メジャーペンタトニック(高音)。立ちのぼる速い run = シャララ
    // 太い土台は置かず、細い鈴の粒だけで構成する。
    const run = [880.0, 987.77, 1108.73, 1318.51, 1479.98, 1760.0, 1975.53, 2217.46, 2637.02];
    let t = 0;
    run.forEach((freq, i) => {
      bell(ctx, master, verb, {
        freq,
        delay: t + (Math.random() - 0.5) * 0.012, // 自然な揺らぎ
        peak: 0.012 - i * 0.0007,
        decay: 0.85 - i * 0.04,
        pan: (Math.random() - 0.5) * 0.95,
        reverbSend: 0.34,
      });
      t += 0.054;
    });

    // 降りそそぐ光の粒:高音から散らしながら、やわらかく舞い降りる = ラン…
    const sprinkle = [2637.02, 2217.46, 1975.53, 1760.0, 1479.98, 1318.51, 1108.73];
    sprinkle.forEach((freq, i) => {
      const starDust = Math.random() < 0.16 ? 2 : 1; // ごく時おり上のオクターブで星屑
      bell(ctx, master, verb, {
        freq: freq * starDust,
        delay: t + i * 0.088 + (Math.random() - 0.5) * 0.03,
        peak: 0.0075 - i * 0.0005,
        decay: 0.6 + i * 0.05,
        pan: (Math.random() - 0.5) * 1.0,
        reverbSend: 0.4,
      });
    });
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
    const { master, verb } = graph;

    // やわらかな上昇のひと息(B4 → E5)。細く保つため高めの音域で。
    voice(ctx, master, verb, {
      freq: 493.88, glideTo: 659.25, glideTime: 0.24,
      attack: 0.08, duration: 0.6, peak: 0.012, cutoff: 2600, reverbSend: 0.4, delay: 0,
    });

    // 遠くで一瞬きらめく高音(手放した問いが昇っていく余韻)
    voice(ctx, master, verb, {
      freq: 1318.51, type: 'sine', delay: 0.07,
      attack: 0.02, duration: 0.5, peak: 0.006, cutoff: 4200, reverbSend: 0.58,
    });
  } catch (e) {
    console.warn('[audio] playOffer failed', e);
  }
};
