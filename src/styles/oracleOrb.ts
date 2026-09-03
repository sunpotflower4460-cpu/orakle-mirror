// OracleOrb 専用スタイル。globals.ts 末尾に連結する。
// 立体の水晶玉: 体積陰影・内部の霞・屈折・ハイライト・静かな浮遊。

export const ORACLE_ORB_STYLES: string = `
  /* ── Crystal orb (OracleOrb) ───────────────────────────────── */
  @keyframes orbFloat {
    0%, 100% { transform: translate3d(0, 0, 0); }
    50% { transform: translate3d(0, -5%, 0); }
  }
  @keyframes orbShadowBreathe {
    0%, 100% { transform: translateX(-50%) scale(1); opacity: 0.55; }
    50% { transform: translateX(-50%) scale(0.78); opacity: 0.32; }
  }
  @keyframes orbMistDrift {
    0% { transform: rotate(0deg) scale(1); }
    50% { transform: rotate(180deg) scale(1.08); }
    100% { transform: rotate(360deg) scale(1); }
  }
  @keyframes orbCausticSpin {
    to { transform: rotate(360deg); }
  }
  @keyframes orbSparkle {
    0%, 100% { opacity: 0.58; transform: scale(1); }
    42% { opacity: 1; transform: scale(1.22); }
    68% { opacity: 0.4; transform: scale(0.9); }
  }
  @keyframes orbCoreBreathe {
    0%, 100% { opacity: 0.78; transform: translate(-50%, -50%) scale(0.96); }
    50% { opacity: 1; transform: translate(-50%, -50%) scale(1.08); }
  }
  @keyframes orbAuraCool {
    0%, 100% { opacity: 0.55; }
    50% { opacity: 0.95; }
  }
  @keyframes orbSheenCool {
    0% { transform: translateX(-70%) rotate(-12deg); opacity: 0; }
    22% { opacity: 0.55; }
    55% { transform: translateX(240%) rotate(-12deg); opacity: 0; }
    100% { transform: translateX(240%) rotate(-12deg); opacity: 0; }
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
  .oracle-orb__aura--rose {
    inset: -22% -22% 10% -22%;
    background: radial-gradient(circle, rgba(245,199,214,0.46) 0%, rgba(255,233,240,0.18) 40%, transparent 74%);
    animation: pulse 4.8s ease-in-out infinite;
  }
  .oracle-orb__aura--cool {
    inset: -8% -16% 18% -16%;
    background: radial-gradient(circle, rgba(196,216,255,0.42) 0%, rgba(231,241,255,0.12) 50%, transparent 76%);
    animation: orbAuraCool 7.6s ease-in-out infinite;
  }

  .oracle-orb__float {
    position: relative;
    width: 100%;
    aspect-ratio: 1;
    z-index: 1;
  }
  .oracle-orb__float--live {
    animation: orbFloat 6.6s ease-in-out infinite;
  }

  .oracle-orb__sphere {
    width: 100%;
    height: 100%;
    border-radius: 50%;
    position: relative;
    overflow: hidden;
    isolation: isolate;
    border: 0.5px solid rgba(255,255,255,0.86);
    background:
      radial-gradient(ellipse 48% 36% at 30% 22%, rgba(255,255,255,0.98) 0%, rgba(255,255,255,0.42) 38%, transparent 70%),
      radial-gradient(circle at 50% 44%, rgba(255,250,252,0.72) 0%, rgba(255,232,240,0.40) 26%, rgba(226,236,255,0.34) 52%, rgba(236,214,230,0.42) 76%, rgba(168,148,186,0.30) 100%),
      linear-gradient(158deg, rgba(255,255,255,0.92) 0%, rgba(255,236,244,0.58) 42%, rgba(214,228,255,0.52) 100%);
    box-shadow:
      var(--om-glow-rose),
      var(--om-glow-rose-wide),
      0 14px 28px rgba(150,100,120,0.10),
      inset 0 1.5px 0 rgba(255,255,255,0.96),
      inset 10px 12px 18px rgba(255,255,255,0.28),
      inset -12px -18px 28px rgba(170,130,160,0.16),
      inset 0 -22px 34px rgba(217,111,140,0.18),
      inset 0 -36px 42px rgba(160,196,255,0.20);
    animation: iridescentShift 8.8s ease-in-out infinite;
  }

  /* 縁が厚く見えるガラスの体積(フレネル) */
  .oracle-orb__volume {
    position: absolute;
    inset: 0;
    border-radius: 50%;
    background: radial-gradient(circle at 50% 46%, transparent 38%, rgba(150,120,150,0.08) 68%, rgba(90,80,130,0.18) 100%);
    pointer-events: none;
  }

  /* 内部に溜まるローズクォーツの核 */
  .oracle-orb__core {
    position: absolute;
    left: 50%;
    top: 52%;
    width: 54%;
    height: 54%;
    border-radius: 50%;
    background: radial-gradient(circle, rgba(217,111,140,0.34) 0%, rgba(255,220,232,0.16) 42%, rgba(210,222,255,0.08) 68%, transparent 78%);
    pointer-events: none;
    animation: orbCoreBreathe 5.8s ease-in-out infinite;
  }

  /* 玉の中をゆっくり回る霞 */
  .oracle-orb__mist {
    position: absolute;
    inset: -18%;
    background:
      radial-gradient(ellipse 42% 34% at 34% 40%, rgba(255,186,210,0.42), transparent 68%),
      radial-gradient(ellipse 38% 32% at 68% 58%, rgba(186,208,255,0.36), transparent 70%),
      radial-gradient(ellipse 30% 26% at 52% 32%, rgba(255,236,214,0.28), transparent 68%);
    pointer-events: none;
    animation: orbMistDrift 22s linear infinite;
  }

  /* 内部の光の筋(コースティクス) */
  .oracle-orb__caustic {
    position: absolute;
    inset: -8%;
    border-radius: 50%;
    background: conic-gradient(
      from 18deg,
      transparent 0deg,
      rgba(255,255,255,0.16) 24deg,
      rgba(210,180,255,0.10) 48deg,
      transparent 78deg,
      rgba(255,220,232,0.18) 118deg,
      rgba(196,220,255,0.12) 150deg,
      transparent 188deg,
      rgba(255,255,255,0.14) 228deg,
      rgba(255,214,226,0.10) 268deg,
      transparent 310deg,
      rgba(255,255,255,0.08) 340deg,
      transparent 360deg
    );
    mix-blend-mode: soft-light;
    opacity: 0.85;
    pointer-events: none;
    animation: orbCausticSpin 28s linear infinite;
  }

  /* ごく薄い結晶の面 */
  .oracle-orb__facets {
    position: absolute;
    inset: 10%;
    border-radius: 50%;
    background: repeating-conic-gradient(
      from 12deg,
      rgba(255,255,255,0.00) 0deg 18deg,
      rgba(255,255,255,0.07) 18deg 22deg,
      rgba(210,190,230,0.04) 22deg 28deg
    );
    opacity: 0.55;
    pointer-events: none;
    mix-blend-mode: overlay;
  }

  /* 内側のガラス膜(厚み) */
  .oracle-orb__glass {
    position: absolute;
    inset: 7%;
    border-radius: 50%;
    border: 0.5px solid rgba(255,255,255,0.32);
    box-shadow:
      inset 0 0 10px rgba(255,255,255,0.20),
      0 0 0 0.5px rgba(255,255,255,0.10);
    pointer-events: none;
  }

  /* 主ハイライト(三日月) */
  .oracle-orb__spec {
    position: absolute;
    left: 14%;
    top: 11%;
    width: 42%;
    height: 24%;
    border-radius: 50%;
    background: linear-gradient(180deg, rgba(255,255,255,0.92) 0%, rgba(255,255,255,0.28) 48%, transparent 100%);
    transform: rotate(-22deg);
    pointer-events: none;
  }
  .oracle-orb__spec-dot {
    position: absolute;
    left: 24%;
    top: 18%;
    width: 10%;
    height: 10%;
    border-radius: 50%;
    background: radial-gradient(circle, rgba(255,255,255,1) 0%, rgba(255,255,255,0.35) 55%, transparent 72%);
    box-shadow: 0 0 14px rgba(255,255,255,0.72);
    pointer-events: none;
    animation: orbSparkle 4.4s ease-in-out infinite;
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

  /* 底面の内部反射 */
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
      inset 0 0 0 0.5px rgba(255,255,255,0.62),
      inset 0 0 8px rgba(255,255,255,0.28);
    pointer-events: none;
  }

  .oracle-orb__sheen {
    position: absolute;
    top: -40%;
    left: -30%;
    width: 52%;
    height: 180%;
    background: linear-gradient(100deg, transparent, rgba(255,255,255,0.62), transparent);
    pointer-events: none;
    animation: orbSheen 7.2s ease-in-out infinite;
  }
  .oracle-orb__sheen--cool {
    width: 36%;
    background: linear-gradient(108deg, transparent, rgba(210,228,255,0.42), transparent);
    animation: orbSheenCool 11.4s ease-in-out 2.4s infinite;
  }

  .oracle-orb__motes {
    position: absolute;
    inset: 0;
    border-radius: 50%;
    background:
      radial-gradient(circle at 30% 64%, rgba(255,255,255,0.95) 0 1.15px, transparent 2.1px),
      radial-gradient(circle at 70% 40%, rgba(255,236,214,0.88) 0 0.95px, transparent 2px),
      radial-gradient(circle at 56% 74%, rgba(220,230,255,0.9) 0 1px, transparent 2.1px);
    pointer-events: none;
    animation: twinkleField 4.6s ease-in-out infinite;
  }

  .oracle-orb__symbol {
    position: absolute;
    inset: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 2;
    filter: drop-shadow(0 0 8px rgba(255,255,255,0.45));
  }
  .oracle-orb__symbol--ghost {
    z-index: 1;
    opacity: 0.28;
    filter: blur(2.4px);
    transform: translate(3%, 6%) scale(1.12);
  }

  /* 玉の下に落ちる接地影。浮遊と逆位相で、立体が地面を持つ */
  .oracle-orb__shadow {
    position: absolute;
    left: 50%;
    bottom: 4%;
    width: 58%;
    height: 11%;
    border-radius: 50%;
    background: radial-gradient(ellipse, rgba(150,100,130,0.28) 0%, transparent 70%);
    transform: translateX(-50%);
    pointer-events: none;
    z-index: 0;
  }
  .oracle-orb__shadow--live {
    animation: orbShadowBreathe 6.6s ease-in-out infinite;
  }

  .oracle-orb--compact .oracle-orb__motes,
  .oracle-orb--compact .oracle-orb__sheen--cool,
  .oracle-orb--compact .oracle-orb__symbol--ghost,
  .oracle-orb--compact .oracle-orb__facets {
    display: none;
  }
`;
