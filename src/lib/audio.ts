// Web Audio による神聖なサウンド演出。
//
// 方針:
// - 音声アセットは持たず、すべてその場で合成する(依存ゼロ・軽量・劣化なし)。
// - 大聖堂のような残響(Convolver + 合成インパルス応答)で「聖なる余韻」を作る。
// - 音量は終始 控えめ。儀式の核となる要所(問いを手放す / 神託が降りる)だけに置く。
// - AudioContext は iOS の制約上ユーザー操作の中で生成・resume する(呼び出し側で担保)。

export let sharedAudioCtx: AudioContext | null = null;

// 一度だけ構築する共有グラフ(マスター音量 + 残響バス)
let masterGain: GainNode | null = null;
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
      masterGain.gain.value = 0.82; // 全体を控えめに
      masterGain.connect(ctx.destination);
    }
    if (!reverb) {
      reverb = ctx.createConvolver();
      reverb.buffer = buildImpulse(ctx, 3.0, 3.2);
      reverbGain = ctx.createGain();
      reverbGain.gain.value = 0.5;
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

/**
 * 神託が降りてくる瞬間の音。
 * 温かな根音のドローンの上に、長三和音をやさしく階段状に重ね、
 * 残響の中へ溶かす。遠い聖堂の鐘のような、解決した安らぎ。
 */
export const playMagicSound = (): void => {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;
    const graph = ensureGraph(ctx);
    if (!graph) return;
    const { master, verb } = graph;

    // 根音のドローン(土台の温かみ)
    voice(ctx, master, verb, {
      freq: 220.0, delay: 0, attack: 0.18, duration: 2.8, peak: 0.022, cutoff: 1700, reverbSend: 0.45,
    });

    // 階段状に立ちのぼる A メジャーの調べ(A4 → C#5 → E5 → A5)
    const ascent = [
      { freq: 440.0, peak: 0.040, duration: 2.2 },
      { freq: 554.37, peak: 0.038, duration: 2.3 },
      { freq: 659.25, peak: 0.036, duration: 2.4 },
      { freq: 880.0, peak: 0.030, duration: 2.6 },
    ];
    ascent.forEach((n, i) => {
      voice(ctx, master, verb, {
        freq: n.freq, delay: i * 0.14, attack: 0.035, duration: n.duration,
        peak: n.peak, cutoff: 5200, reverbSend: 0.68,
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

    // やわらかな上昇のひと息(E4 → A4)
    voice(ctx, master, verb, {
      freq: 329.63, glideTo: 440.0, glideTime: 0.22,
      attack: 0.05, duration: 0.62, peak: 0.026, cutoff: 2400, reverbSend: 0.4, delay: 0,
    });

    // 遠くで一瞬きらめく高音(手放した問いが昇っていく余韻)
    voice(ctx, master, verb, {
      freq: 1318.51, type: 'sine', delay: 0.06,
      attack: 0.012, duration: 0.5, peak: 0.012, cutoff: 6000, reverbSend: 0.7,
    });
  } catch (e) {
    console.warn('[audio] playOffer failed', e);
  }
};
