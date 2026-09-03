// OracleOrb 専用スタイル。globals.ts 末尾に連結する。
// 神秘の水晶玉: 内側の星霞がゆっくり回転し、玉そのものはゆったり浮かぶ。
// ハイライトは光源側に固定し、回転は内部だけにかける。

export const ORACLE_ORB_STYLES: string = `
  @keyframes orbFloat {
    0%, 100% { transform: translate3d(0, 0, 0); }
    50% { transform: translate3d(0, -3.2%, 0); }
  }
  @keyframes orbShadowBreathe {
    0%, 100% { transform: translateX(-50%) scale(1); opacity: 0.48; }
    50% { transform: translateX(-50%) scale(0.88); opacity: 0.30; }
  }
  @keyframes orbInnerSpin {
    to { transform: rotate(360deg); }
  }
  @keyframes orbInnerSpinReverse {
    to { transform: rotate(-360deg); }
  }
  @keyframes orbSparkle {
    0%, 100% { opacity: 0.52; transform: scale(1); }
    50% { opacity: 0.92; transform: scale(1.08); }
  }
  @keyframes orbCoreBreathe {
    0%, 100% { opacity: 0.78; transform: translate(-50%, -50%) scale(0.98); }
    50% { opacity: 1; transform: translate(-50%, -50%) scale(1.04); }
  }
  @keyframes orbAuraCool {
    0%, 100% { opacity: 0.58; }
    50% { opacity: 0.9; }
  }
  @keyframes orbSheenCool {
    0% { transform: translateX(-70%) rotate(-12deg); opacity: 0; }
    22% { opacity: 0.42; }
    55% { transform: translateX(240%) rotate(-12deg); opacity: 0; }
    100% { transform: translateX(240%) rotate(-12deg); opacity: 0; }
  }
  @keyframes orbSigilPulse {
    0%, 100% { opacity: 0.72; transform: scale(1); }
    50% { opacity: 1; transform: scale(1.06); }
  }

  .oracle-orb {
    position: relative;
    display: flex;
    align-items: flex-start;
    justify-content: center;
    pointer-events: none;
  }

  .oracle-orb__aura {
    position: absolute;
    border-radius: 50%;
    pointer-events: none;
  }
  .oracle-orb__aura--gold {
    inset: -6% -12% 20% -12%;
    background: radial-gradient(circle, rgba(255,236,186,0.58) 0%, rgba(255,248,220,0.16) 46%, transparent 74%);
    animation: haloBreathe 11s ease-in-out infinite;
  }
  .oracle-orb__aura--rose {
    inset: -22% -22% 10% -22%;
    background: radial-gradient(circle, rgba(245,199,214,0.46) 0%, rgba(255,233,240,0.18) 40%, transparent 74%);
    animation: pulse 10s ease-in-out infinite;
  }
  .oracle-orb__aura--cool {
    inset: -8% -16% 18% -16%;
    background: radial-gradient(circle, rgba(150,210,255,0.48) 0%, rgba(186,230,255,0.14) 50%, transparent 76%);
    animation: orbAuraCool 13s ease-in-out infinite;
  }

  .oracle-orb__float {
    position: relative;
    width: 100%;
    aspect-ratio: 1;
    z-index: 1;
  }
  .oracle-orb__float--live {
    animation: orbFloat 16s cubic-bezier(0.37, 0, 0.63, 1) infinite;
    will-change: transform;
  }

  .oracle-orb__sphere {
    width: 100%;
    height: 100%;
    border-radius: 50%;
    position: relative;
    overflow: hidden;
    isolation: isolate;
    border: 1px solid rgba(198,176,198,0.42);
    background:
      radial-gradient(ellipse 56% 42% at 28% 18%, rgba(255,255,255,1) 0%, rgba(255,255,255,0.62) 22%, transparent 58%),
      radial-gradient(circle at 46% 38%,
        rgba(255,248,252,0.88) 0%,
        rgba(232,210,240,0.52) 28%,
        rgba(186,210,255,0.48) 52%,
        rgba(168,140,196,0.42) 76%,
        rgba(92,84,148,0.38) 100%),
      linear-gradient(165deg, #fff8fb 0%, #e8d4ee 46%, #c8d4f4 100%);
    box-shadow:
      var(--om-glow-rose),
      var(--om-glow-rose-wide),
      0 16px 30px rgba(140,90,120,0.16),
      0 0 0 1px rgba(255,255,255,0.55),
      inset 0 2px 0 rgba(255,255,255,0.95),
      inset 12px 14px 22px rgba(255,255,255,0.42),
      inset -14px -22px 32px rgba(120,88,130,0.24),
      inset 0 -26px 38px rgba(217,111,140,0.20),
      inset 0 -40px 46px rgba(120,150,220,0.28);
    animation: iridescentShift 18s ease-in-out infinite;
  }

  .oracle-orb__volume {
    position: absolute;
    inset: 0;
    border-radius: 50%;
    background: radial-gradient(circle at 42% 36%, transparent 28%, rgba(130,100,145,0.14) 64%, rgba(68,58,110,0.32) 100%);
    pointer-events: none;
  }

  .oracle-orb__core {
    position: absolute;
    left: 50%;
    top: 52%;
    width: 58%;
    height: 58%;
    border-radius: 50%;
    background: radial-gradient(circle, rgba(255,236,210,0.42) 0%, rgba(217,140,190,0.28) 34%, rgba(150,170,230,0.18) 62%, transparent 78%);
    pointer-events: none;
    animation: orbCoreBreathe 14s ease-in-out infinite;
  }

  /* 内側だけが回る。光源ハイライトは外に残す */
  .oracle-orb__inner {
    position: absolute;
    inset: -22%;
    pointer-events: none;
  }
  .oracle-orb__inner--live {
    animation: orbInnerSpin 36s linear infinite;
    will-change: transform;
  }

  .oracle-orb__mist {
    position: absolute;
    inset: 8%;
    background:
      radial-gradient(ellipse 42% 34% at 30% 36%, rgba(255,168,198,0.50), transparent 68%),
      radial-gradient(ellipse 38% 32% at 72% 62%, rgba(150,196,255,0.46), transparent 70%),
      radial-gradient(ellipse 30% 26% at 54% 28%, rgba(255,228,186,0.34), transparent 68%);
  }

  /* 非対称の渦。回っていることが一目でわかる */
  .oracle-orb__swirl {
    position: absolute;
    inset: 12%;
    border-radius: 50%;
    background: conic-gradient(
      from 0deg,
      transparent 0deg,
      rgba(255,210,230,0.00) 28deg,
      rgba(255,186,214,0.34) 58deg,
      rgba(210,196,255,0.22) 88deg,
      transparent 128deg,
      rgba(170,220,255,0.28) 168deg,
      rgba(255,236,200,0.24) 208deg,
      transparent 248deg,
      rgba(255,200,220,0.20) 300deg,
      transparent 360deg
    );
    mix-blend-mode: overlay;
    opacity: 0.85;
    animation: orbInnerSpinReverse 48s linear infinite;
  }

  .oracle-orb__cosmos {
    position: absolute;
    inset: 18%;
    border-radius: 50%;
    background:
      radial-gradient(circle at 22% 32%, rgba(255,255,255,0.96) 0 5%, rgba(255,236,210,0.55) 9%, transparent 16%),
      radial-gradient(circle at 78% 58%, rgba(186,220,255,0.92) 0 4%, rgba(170,200,255,0.35) 8%, transparent 14%),
      radial-gradient(circle at 58% 18%, rgba(255,210,230,0.88) 0 3.2%, transparent 9%),
      radial-gradient(circle at 34% 78%, rgba(255,236,200,0.80) 0 2.6%, transparent 7%),
      radial-gradient(circle at 12% 54%, rgba(220,200,255,0.70) 0 2.2%, transparent 6%);
  }

  /* 軌道が目で追える、ひと粒の光 */
  .oracle-orb__pearl {
    position: absolute;
    top: 10%;
    left: 50%;
    width: 11%;
    height: 11%;
    margin-left: -5.5%;
    border-radius: 50%;
    background: radial-gradient(circle, rgba(255,255,255,1) 0%, rgba(255,236,210,0.70) 38%, transparent 72%);
    box-shadow: 0 0 12px rgba(255,244,220,0.90), 0 0 22px rgba(186,210,255,0.45);
  }

  .oracle-orb__glass {
    position: absolute;
    inset: 8%;
    border-radius: 50%;
    border: 1px solid rgba(255,255,255,0.50);
    box-shadow:
      inset 0 0 14px rgba(255,255,255,0.24),
      0 0 0 1px rgba(150,130,170,0.10);
    pointer-events: none;
  }

  .oracle-orb__spec {
    position: absolute;
    left: 12%;
    top: 9%;
    width: 46%;
    height: 26%;
    border-radius: 50%;
    background: linear-gradient(180deg, rgba(255,255,255,1) 0%, rgba(255,255,255,0.55) 42%, transparent 100%);
    transform: rotate(-22deg);
    pointer-events: none;
  }
  .oracle-orb__spec-dot {
    position: absolute;
    left: 22%;
    top: 16%;
    width: 12%;
    height: 12%;
    border-radius: 50%;
    background: radial-gradient(circle, rgba(255,255,255,1) 0%, rgba(255,255,255,0.45) 48%, transparent 72%);
    box-shadow: 0 0 18px rgba(255,255,255,0.88);
    pointer-events: none;
    animation: orbSparkle 10s ease-in-out infinite;
  }
  .oracle-orb__spec-sec {
    position: absolute;
    right: 18%;
    top: 36%;
    width: 16%;
    height: 10%;
    border-radius: 50%;
    background: radial-gradient(circle, rgba(255,255,255,0.55) 0%, transparent 70%);
    transform: rotate(18deg);
    pointer-events: none;
    opacity: 0.7;
  }

  .oracle-orb__bottom {
    position: absolute;
    left: 16%;
    right: 16%;
    bottom: 10%;
    height: 28%;
    border-radius: 50%;
    background: linear-gradient(180deg, rgba(255,255,255,0.02), rgba(255,255,255,0.38) 52%, rgba(226,236,255,0.12) 100%);
    pointer-events: none;
  }

  .oracle-orb__rim {
    position: absolute;
    inset: 0;
    border-radius: 50%;
    box-shadow:
      inset 0 0 0 1px rgba(255,255,255,0.72),
      inset 0 0 10px rgba(255,255,255,0.32);
    pointer-events: none;
  }

  /* 中心の星核。ダイヤモンドの輪郭ではなく、遠い光 */
  .oracle-orb__sigil {
    position: absolute;
    inset: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 2;
    pointer-events: none;
  }
  .oracle-orb__sigil-ring {
    position: absolute;
    width: 28%;
    height: 28%;
    border-radius: 50%;
    border: 1px solid rgba(255,255,255,0.42);
    box-shadow: 0 0 12px rgba(255,236,214,0.35), inset 0 0 8px rgba(210,190,255,0.28);
    animation: orbSigilPulse 12s ease-in-out infinite;
  }
  .oracle-orb__sigil-star {
    width: 7%;
    height: 7%;
    border-radius: 50%;
    background: radial-gradient(circle, rgba(255,255,255,0.98) 0%, rgba(255,236,210,0.80) 38%, rgba(210,180,255,0.0) 72%);
    box-shadow: 0 0 14px rgba(255,244,220,0.85), 0 0 28px rgba(186,170,255,0.40);
    animation: orbSigilPulse 12s ease-in-out infinite;
  }

  .oracle-orb__sheen {
    position: absolute;
    top: -40%;
    left: -30%;
    width: 52%;
    height: 180%;
    background: linear-gradient(100deg, transparent, rgba(255,255,255,0.70), transparent);
    pointer-events: none;
    animation: orbSheen 18s ease-in-out infinite;
  }
  .oracle-orb__sheen--cool {
    width: 36%;
    background: linear-gradient(108deg, transparent, rgba(210,228,255,0.36), transparent);
    animation: orbSheenCool 26s ease-in-out 6s infinite;
  }

  .oracle-orb__shadow {
    position: absolute;
    left: 50%;
    bottom: 4%;
    width: 58%;
    height: 11%;
    border-radius: 50%;
    background: radial-gradient(ellipse, rgba(130,80,110,0.38) 0%, transparent 70%);
    transform: translateX(-50%);
    pointer-events: none;
    z-index: 0;
  }
  .oracle-orb__shadow--live {
    animation: orbShadowBreathe 16s cubic-bezier(0.37, 0, 0.63, 1) infinite;
  }

  .oracle-orb--compact .oracle-orb__sheen--cool,
  .oracle-orb--compact .oracle-orb__swirl {
    display: none;
  }
`;
