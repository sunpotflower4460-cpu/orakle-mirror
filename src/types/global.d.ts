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
  // Phase 4.16: 直近のカード抽選がどのエントロピー源で確定したかの診断記録。
  // UI には出さない。問い・カード結果とは結びつけない。
  __oracleMirrorEntropyDiagnostics?: {
    source: 'qrng' | 'crypto';
    provider: string | null;
    failure: 'none' | 'no-backend' | 'timeout' | 'http-error' | 'bad-response' | 'network-error';
    at: number;
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
  __matrixResults?: Array<{
    cellIndex: number;
    personaId: string;
    modeId: string;
    caseId: string;
    query: string;
    ePatternRaw: string;
    ePatternFinal: string;
    startedAt: string;
    finishedAt: string;
    durationMs: number;
    errorMessage: string;
  }>;
  runPromptABComparison?: (userInput?: string, personaId?: 'lumina' | 'zenith' | 'archivist') => void;
  runABComparison?: (personaId?: 'lumina' | 'zenith' | 'archivist') => Promise<void>;
  runDEComparison?: (userInput?: string) => void;
  runFullMatrix?: (options?: { sleepMs?: number }) => Promise<
    Array<{
      cellIndex: number;
      personaId: string;
      modeId: string;
      caseId: string;
      query: string;
      ePatternRaw: string;
      ePatternFinal: string;
      startedAt: string;
      finishedAt: string;
      durationMs: number;
      errorMessage: string;
    }>
  >;
  exportMatrixAsJSON?: () => void;
  exportMatrixAsCSV?: () => void;
}
