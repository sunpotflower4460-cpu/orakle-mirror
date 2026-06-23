export const SELF_READING_STYLES = `
  .sr-draw-stage {
    border-radius: 28px;
    border: 1px solid rgba(210,219,236,0.42);
    background: linear-gradient(150deg, rgba(255,255,255,0.86), rgba(255,247,251,0.76), rgba(244,249,255,0.68));
    box-shadow: var(--om-shadow-card);
    padding: 22px 16px;
    overflow: hidden;
  }

  .sr-draw-table {
    position: relative;
    min-height: 360px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 28px;
  }

  .sr-shuffle {
    position: relative;
    width: 150px;
    height: 118px;
    animation: sr-shuffle-fade 1.55s ease both;
  }

  .sr-shuffle-card {
    position: absolute;
    left: 41px;
    top: 8px;
    width: 68px;
    height: 94px;
    border-radius: 14px;
    border: 1px solid rgba(255,255,255,0.7);
    background: linear-gradient(145deg, rgba(38,48,68,0.94), rgba(70,86,122,0.86));
    box-shadow: 0 14px 28px rgba(39,48,74,0.16);
    animation: sr-shuffle-card 1.45s cubic-bezier(0.16,1,0.3,1) both;
  }

  .sr-card-row {
    display: flex;
    justify-content: center;
    align-items: flex-start;
    gap: clamp(10px, 3vw, 18px);
    width: 100%;
    /* Phase U: iPad で画面端まで横長にならないよう本文幅に揃えて中央寄せ。
       iPhone(幅 < 520px)では width:100% が効くため見た目は変わらない。 */
    max-width: 520px;
    margin-left: auto;
    margin-right: auto;
  }

  /* Phase U: vw 依存を外し、親 .sr-card-row の幅に対する flex で安定させる。
     これで iPad でもカードが間延びせず、本文幅の中で 1/2/3 枚が整列する。 */
  .sr-card-shell {
    flex: 1 1 0;
    min-width: 86px;
    max-width: 126px;
    opacity: 0;
    animation: sr-deal-card 0.44s cubic-bezier(0.16,1,0.3,1) forwards;
    perspective: 900px;
  }

  .sr-spread-one .sr-card-shell { max-width: 150px; }
  .sr-spread-three .sr-card-shell:nth-child(1) { transform-origin: bottom right; }
  .sr-spread-three .sr-card-shell:nth-child(3) { transform-origin: bottom left; }

  .sr-flip-card {
    position: relative;
    aspect-ratio: 3 / 4;
    transform-style: preserve-3d;
    animation: sr-flip-card 0.72s cubic-bezier(0.16,1,0.3,1) forwards;
  }

  .sr-card-side {
    position: absolute;
    inset: 0;
    border-radius: 18px;
    overflow: hidden;
    backface-visibility: hidden;
    -webkit-backface-visibility: hidden;
  }

  .sr-card-back {
    border: 1px solid rgba(255,255,255,0.72);
    background:
      radial-gradient(circle at 50% 38%, rgba(255,232,240,0.34), transparent 30%),
      linear-gradient(145deg, rgba(38,48,68,0.96), rgba(76,91,130,0.88));
    box-shadow: 0 16px 30px rgba(39,48,74,0.18);
  }

  .sr-card-back::after {
    content: '✦';
    position: absolute;
    inset: 12px;
    border-radius: 14px;
    border: 1px solid rgba(255,255,255,0.22);
    display: grid;
    place-items: center;
    color: rgba(255,255,255,0.72);
    font-size: 18px;
  }

  .sr-card-front {
    transform: rotateY(180deg);
    border: 1px solid rgba(215,120,148,0.26);
    background: linear-gradient(160deg, rgba(255,255,255,0.98), rgba(255,242,247,0.94) 54%, rgba(244,249,255,0.92));
    box-shadow: 0 16px 30px rgba(215,120,148,0.12);
  }

  .sr-complete {
    opacity: 0;
    animation: sr-complete-in 0.42s ease 2.9s forwards;
  }

  @keyframes sr-shuffle-card {
    0%, 100% { transform: translate3d(0, 0, 0) rotate(0deg); }
    34% { transform: translate3d(var(--sr-x), var(--sr-y), 0) rotate(var(--sr-r)); }
    68% { transform: translate3d(var(--sr-x2), var(--sr-y2), 0) rotate(var(--sr-r2)); }
  }

  @keyframes sr-shuffle-fade {
    0%, 82% { opacity: 1; transform: translateY(0); }
    100% { opacity: 0; transform: translateY(-8px); }
  }

  @keyframes sr-deal-card {
    from { opacity: 0; transform: translateY(18px) scale(0.92); filter: blur(2px); }
    to { opacity: 1; transform: translateY(0) scale(1); filter: blur(0); }
  }

  @keyframes sr-flip-card {
    0%, 45% { transform: rotateY(0deg); }
    100% { transform: rotateY(180deg); }
  }

  @keyframes sr-complete-in {
    from { opacity: 0; transform: translateY(6px); }
    to { opacity: 1; transform: translateY(0); }
  }

  @media (prefers-reduced-motion: reduce) {
    .sr-shuffle { display: none; }
    .sr-card-shell, .sr-flip-card, .sr-complete { animation-duration: 0.001ms !important; animation-delay: 0.001ms !important; }
    .sr-card-shell { opacity: 1; }
    .sr-flip-card { transform: rotateY(180deg); }
    .sr-complete { opacity: 1; }
  }
`;
