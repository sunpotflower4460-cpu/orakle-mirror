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
}
