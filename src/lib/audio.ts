
export let sharedAudioCtx: AudioContext | null = null;
export const getAudioContext = (): AudioContext | null => {
  if (!sharedAudioCtx || sharedAudioCtx.state === 'closed') {
    const AudioContextClass: typeof AudioContext | undefined =
      window.AudioContext || (window as Window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (AudioContextClass) sharedAudioCtx = new AudioContextClass();
  }
  if (sharedAudioCtx && sharedAudioCtx.state === 'suspended') sharedAudioCtx.resume();
  return sharedAudioCtx;
};

export const playMagicSound = (): void => {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;
    const now = ctx.currentTime;
    const frequencies = [1046.50, 1318.51, 1567.98, 1975.53, 2349.32];
    frequencies.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine'; osc.frequency.setValueAtTime(freq, now + i * 0.07);
      gain.gain.setValueAtTime(0, now);
      gain.gain.linearRampToValueAtTime(0.06, now + i * 0.07 + 0.03); 
      gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.07 + 2.5);
      osc.connect(gain); gain.connect(ctx.destination);
      osc.start(now + i * 0.07); osc.stop(now + i * 0.07 + 2.5);
    });
  } catch (e) { console.error('Audio playback failed', e); }
};
