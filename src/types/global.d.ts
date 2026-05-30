// 旧 Safari の AudioContext 互換
interface Window {
  webkitAudioContext?: typeof AudioContext;
  __oracleMirrorDiagnostics?: {
    platform: string;
    isNativePlatform: boolean;
    isStandalone: boolean;
    prefersReducedMotion: boolean;
    supports: {
      backdropFilter: boolean;
      mixBlendMode: boolean;
      dvh: boolean;
    };
    safeArea: {
      sat: string;
      sar: string;
      sab: string;
      sal: string;
    };
  };
  __abResults?: {
    aPatternRaw?: string;
    aPatternFinal?: string;
    bPatternRaw?: string;
    bPatternFinal?: string;
    cPatternRaw?: string;
    cPatternFinal?: string;
    dPatternRaw?: string;
    dPatternFinal?: string;
    ePatternRaw?: string;
    ePatternFinal?: string;
  };
}
