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
