// 参照した虹彩の空: 金の光源・水色・マゼンタ・ラベンダーを、
// 本文が読める明るいパールの上に層として乗せる。

export const CELESTIAL_SKY_BACKGROUND = `
  radial-gradient(ellipse 92% 58% at 50% 10%, rgba(255,248,220,0.82) 0%, rgba(255,232,186,0.32) 28%, transparent 58%),
  radial-gradient(ellipse 72% 50% at 6% 16%, rgba(120,205,255,0.46) 0%, rgba(170,232,255,0.18) 40%, transparent 68%),
  radial-gradient(ellipse 64% 46% at 94% 18%, rgba(186,158,255,0.38) 0%, rgba(214,200,255,0.14) 42%, transparent 66%),
  radial-gradient(ellipse 84% 54% at 16% 94%, rgba(255,152,198,0.42) 0%, rgba(255,196,220,0.16) 44%, transparent 70%),
  radial-gradient(ellipse 70% 48% at 90% 88%, rgba(130,220,222,0.30) 0%, transparent 64%),
  radial-gradient(ellipse 48% 34% at 52% 42%, rgba(255,255,255,0.42) 0%, transparent 72%),
  linear-gradient(180deg, #eaf3ff 0%, #fff7ee 34%, #f7eef7 68%, #e8f4f8 100%)
`;

export const CELESTIAL_AURORA = `
  radial-gradient(ellipse 50% 40% at 14% 22%, rgba(255,164,204,0.42), transparent 64%),
  radial-gradient(ellipse 46% 36% at 86% 12%, rgba(110,198,255,0.40), transparent 62%),
  radial-gradient(ellipse 38% 32% at 50% 8%, rgba(255,232,170,0.50), transparent 60%),
  radial-gradient(ellipse 44% 36% at 78% 72%, rgba(176,158,255,0.34), transparent 64%),
  radial-gradient(ellipse 42% 36% at 20% 80%, rgba(255,186,164,0.30), transparent 62%),
  radial-gradient(ellipse 34% 30% at 54% 48%, rgba(140,232,220,0.24), transparent 60%)
`;

export const CELESTIAL_SKY_STYLES: string = `
  @keyframes celestialSwirl {
    0% { transform: translate3d(-2.2%, -1.2%, 0) rotate(0deg) scale(1); }
    50% { transform: translate3d(2.4%, 1.6%, 0) rotate(7deg) scale(1.06); }
    100% { transform: translate3d(-2.2%, -1.2%, 0) rotate(0deg) scale(1); }
  }

  .om-celestial-sky {
    background: ${CELESTIAL_SKY_BACKGROUND};
  }

  .onboarding-overlay::before {
    content: '';
    position: absolute;
    inset: -18%;
    pointer-events: none;
    z-index: 0;
    background: ${CELESTIAL_AURORA};
    animation: celestialSwirl 26s ease-in-out infinite;
  }
  .onboarding-overlay > * {
    position: relative;
    z-index: 1;
  }

  .onboarding-hero {
    position: relative;
  }
  .onboarding-hero::before {
    content: '';
    position: absolute;
    top: 2%;
    left: 50%;
    transform: translateX(-50%);
    width: min(440px, 94%);
    height: 300px;
    pointer-events: none;
    z-index: 0;
    background:
      radial-gradient(circle at 50% 38%, rgba(255,248,220,0.78) 0%, rgba(255,214,186,0.28) 28%, rgba(255,186,214,0.18) 46%, rgba(150,210,255,0.16) 62%, transparent 74%);
    filter: blur(10px);
    animation: haloBreathe 8.2s ease-in-out infinite;
  }
  .onboarding-hero > * { position: relative; z-index: 1; }
`;
