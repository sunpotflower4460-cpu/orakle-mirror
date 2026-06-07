
// ─── Constants & Database ────────────────────────────────────────────────────

export const GLOBAL_STYLES: string = `
  :root {
    --sat: env(safe-area-inset-top, 0px);
    --sar: env(safe-area-inset-right, 0px);
    --sab: env(safe-area-inset-bottom, 0px);
    --sal: env(safe-area-inset-left, 0px);

    /* ── Oracle Mirror design tokens ─────────────────────────── */
    --om-bg-top: #fffdfd;
    --om-bg-mid: #fff8fa;
    --om-bg-bottom: #fdf2f5;

    --om-surface: rgba(255,255,255,0.78);
    --om-surface-strong: rgba(255,255,255,0.92);
    --om-surface-milk: rgba(255,250,252,0.86);

    --om-border-rose: rgba(217,164,181,0.34);
    --om-border-cool: rgba(155,164,184,0.24);

    --om-text-main: #263044;
    --om-text-soft: #7f8998;
    --om-text-muted: #aab2bf;
    --om-brand-bluegray: #8994a6;

    --om-rose: #d77894;
    --om-rose-soft: #f5dce5;
    --om-rose-milk: #f8e9ee;

    --om-zenith: #757bc3;
    --om-navy: #0d1328;
    --om-navy-2: #141c38;

    --om-shadow-soft: 0 18px 48px rgba(90,60,70,0.06);
    --om-shadow-card: 0 18px 44px rgba(180,110,130,0.08);
    --om-shadow-navy: 0 16px 38px rgba(10,16,36,0.22);
    --om-glow-rose: 0 0 58px rgba(217,111,140,0.22);
    --om-glow-rose-wide: 0 0 104px rgba(217,111,140,0.14);
  }
  * { box-sizing:border-box; margin:0; padding:0; -webkit-tap-highlight-color: transparent; }
  body {
    overscroll-behavior: contain;
    -webkit-overflow-scrolling: touch;
    background: #fffdfd;
  }
  /* 上から静かに降りそそぐ、聖なる光暈(光が天から差し込むような気配) */
  body::before {
    content: '';
    position: fixed;
    inset: 0;
    pointer-events: none;
    z-index: 1;
    background:
      radial-gradient(140% 70% at 50% -22%, rgba(255,236,214,0.30), rgba(255,228,242,0.10) 34%, transparent 60%),
      radial-gradient(120% 55% at 50% 122%, rgba(228,222,255,0.10), transparent 62%);
    animation: haloBreathe 9.5s ease-in-out infinite;
  }
  /* 空間を漂う霊的な光の粒子(精霊のあかり・星屑のような微光) */
  body::after {
    content: '';
    position: fixed;
    inset: -25%;
    pointer-events: none;
    z-index: 2;
    background-image:
      radial-gradient(2px 2px at 12% 18%, rgba(255,255,255,0.92), transparent 66%),
      radial-gradient(5px 5px at 28% 72%, rgba(255,224,182,0.46), transparent 72%),
      radial-gradient(2px 2px at 47% 35%, rgba(255,255,255,0.85), transparent 66%),
      radial-gradient(6px 6px at 63% 58%, rgba(212,216,255,0.42), transparent 74%),
      radial-gradient(2px 2px at 78% 22%, rgba(255,255,255,0.9), transparent 66%),
      radial-gradient(5px 5px at 88% 67%, rgba(255,210,228,0.42), transparent 74%),
      radial-gradient(2px 2px at 38% 90%, rgba(255,255,255,0.82), transparent 66%),
      radial-gradient(4px 4px at 7% 52%, rgba(226,224,255,0.46), transparent 74%),
      radial-gradient(2px 2px at 56% 12%, rgba(255,255,255,0.8), transparent 66%);
    background-size: 300px 300px;
    background-repeat: repeat;
    opacity: 0.55;
    will-change: transform, opacity;
    animation: motesFloat 46s ease-in-out infinite, twinkleField 7.5s ease-in-out infinite;
  }
  ::-webkit-scrollbar { width:4px; }
  ::-webkit-scrollbar-track { background:transparent; }
  ::-webkit-scrollbar-thumb { background:#e9d6de; border-radius:99px; }
  textarea { 
    font-family:inherit; 
    font-size: 16px; 
  }
  .app-shell { height: 100vh; height: 100dvh; position: relative; }
  /* Pearl-white rose-mist background with subtle paper texture */
  .app-shell::before {
    content: '';
    position: fixed;
    inset: 0;
    pointer-events: none;
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='1'/%3E%3C/svg%3E");
    opacity: 0.032;
    mix-blend-mode: multiply;
    z-index: 0;
  }
  .app-shell::after {
    content: '';
    position: fixed;
    inset: -15%;
    pointer-events: none;
    background:
      radial-gradient(circle at 20% 28%, rgba(255,206,226,0.22), transparent 36%),
      radial-gradient(circle at 78% 18%, rgba(176,205,255,0.20), transparent 34%),
      radial-gradient(circle at 62% 60%, rgba(255,240,210,0.15), transparent 40%),
      radial-gradient(circle at 50% 80%, rgba(232,214,255,0.16), transparent 44%);
    mix-blend-mode: screen;
    animation: auroraDrift 19s ease-in-out infinite;
    z-index: 0;
  }
  
  .sr-only { position: absolute; width: 1px; height: 1px; padding: 0; margin: -1px; overflow: hidden; clip: rect(0, 0, 0, 0); white-space: nowrap; border-width: 0; }
  
  @keyframes oracleReveal { from { opacity:0; transform:translateY(16px) scale(0.98); filter:blur(5px); } to { opacity:1; transform:translateY(0) scale(1); filter:blur(0); } }
  @keyframes userReveal { from { opacity:0; transform:translateX(10px); } to { opacity:1; transform:translateX(0); } }
  @keyframes fadeIn { from { opacity:0; transform:translateY(8px); } to { opacity:1; transform:translateY(0); } }
  @keyframes fadeUp { from { opacity:0; transform:translateX(-50%) translateY(8px); } to { opacity:1; transform:translateX(-50%) translateY(0); } }
  @keyframes spin { to { transform:rotate(360deg); } }
  @keyframes spinSlow { to { transform:rotate(360deg); } }
  @keyframes pulse { 0%,100%{opacity:.25} 50%{opacity:.65} }
  @keyframes twinkle { 0%,100%{opacity:.72; transform:scale(1);} 50%{opacity:1; transform:scale(1.16);} }
  @keyframes iridescentShift {
    0%,100% { filter: saturate(1) brightness(1); }
    50% { filter: saturate(1.16) brightness(1.07); }
  }
  @keyframes auroraDrift {
    0% { transform: translate3d(-2%, -1%, 0) rotate(0deg); opacity: .60; }
    50% { transform: translate3d(2%, 1%, 0) rotate(2deg); opacity: .84; }
    100% { transform: translate3d(-2%, -1%, 0) rotate(0deg); opacity: .60; }
  }
  /* 天から差す光暈が、静かに呼吸する */
  @keyframes haloBreathe { 0%,100% { opacity:.7; } 50% { opacity:1; } }
  /* 霊的な光の粒子が、ゆっくりと宙を漂う */
  @keyframes motesFloat {
    0% { transform: translate3d(0, 0, 0); }
    50% { transform: translate3d(2.4%, -3.2%, 0); }
    100% { transform: translate3d(0, 0, 0); }
  }
  /* 粒子の明滅(またたき) */
  @keyframes twinkleField { 0%,100% { opacity:.40; } 50% { opacity:.62; } }
  /* 鏡面を、光の筋が静かに通り過ぎる(聖なるガラスの反射) */
  @keyframes orbSheen {
    0% { transform: translateX(-60%) rotate(8deg); opacity: 0; }
    18% { opacity: .85; }
    50% { transform: translateX(230%) rotate(8deg); opacity: 0; }
    100% { transform: translateX(230%) rotate(8deg); opacity: 0; }
  }
  /* モーダルカードの上品なスケールイン */
  @keyframes modalReveal { from { opacity:0; transform:translateY(12px) scale(0.96); } to { opacity:1; transform:translateY(0) scale(1); } }
  /* オンボーディング各ステップの、鏡に像が結ぶような出現 */
  @keyframes stepReveal { from { opacity:0; transform:translateY(10px); filter:blur(3px); } to { opacity:1; transform:translateY(0); filter:blur(0); } }
  /* 受信中の呼吸するドット */
  @keyframes breathe { 0%,100% { opacity:.3; transform:scale(.8); } 50% { opacity:1; transform:scale(1); } }
  /* 引かれた象徴(カード)が順に浮かび上がる */
  @keyframes cardReveal { from { opacity:0; transform:translateY(8px) scale(0.94); filter:blur(2px); } to { opacity:1; transform:translateY(0) scale(1); filter:blur(0); } }
  /* コピー成功などの小さな確認ポップ */
  @keyframes pop { 0% { transform:scale(0.6); } 60% { transform:scale(1.15); } 100% { transform:scale(1); } }
  .oracle-bubble .bubble-actions { opacity:0; transition:opacity 0.3s; }
  .oracle-bubble:hover .bubble-actions, .oracle-bubble:focus-within .bubble-actions { opacity:1; }
  .room-row .room-del { opacity:0; transition:opacity 0.2s; }
  .room-row:hover .room-del { opacity:1; }
  .send-btn { transition:transform 0.2s cubic-bezier(0.16,1,0.3,1); }
  .send-btn:hover:not(:disabled) { transform:scale(1.07); }
  .send-btn:active:not(:disabled) { transform:scale(0.92); }

  /* キーボード操作時のみ表示されるアクセシブルなフォーカスリング(世界基準) */
  :focus-visible { outline:2px solid rgba(99,102,241,0.55); outline-offset:2px; border-radius:10px; }
  :focus:not(:focus-visible) { outline:none; }

  /* 入力欄シェル:フォーカス時にやわらかく息づく */
  .input-shell { transition:box-shadow 0.45s ease, border-color 0.45s ease, transform 0.45s cubic-bezier(0.16,1,0.3,1); }

  /* 空のhero:鏡そのものが淡く発光するような、放射状の聖なる光暈 */
  .empty-state { position: relative; }
  .empty-state::before {
    content: '';
    position: absolute;
    top: 2%;
    left: 50%;
    transform: translateX(-50%);
    width: min(440px, 92%);
    height: 440px;
    pointer-events: none;
    background: radial-gradient(circle, rgba(255,244,250,0.50) 0%, rgba(226,234,255,0.22) 38%, transparent 70%);
    filter: blur(10px);
    z-index: 0;
    animation: haloBreathe 8.5s ease-in-out infinite;
  }
  .empty-state > * { position: relative; z-index: 1; }

  @media (max-width:600px) {
    .oracle-bubble .bubble-actions { opacity:1; }
    .room-row .room-del { opacity:1; }
    .app-header { padding-bottom: 12px !important; }
    .app-header-top {
      flex-direction: column !important;
      align-items: stretch !important;
      gap: 10px !important;
    }
    .app-header-brand,
    .app-header-actions {
      width: 100% !important;
    }
    .app-header-actions {
      justify-content: space-between !important;
      gap: 4px !important;
      flex-wrap: wrap !important;
    }
    .mode-switch {
      width: 100% !important;
      margin-top: 10px !important;
    }
    .mode-switch-btn {
      padding: 10px 8px !important;
      font-size: 9px !important;
      letter-spacing: 0.08em !important;
      gap: 4px !important;
    }
    .chat-scroll-area {
      padding-top: 18px !important;
      padding-bottom: 18px !important;
    }
    .empty-state {
      min-height: auto !important;
      gap: 18px !important;
      padding-top: 6px !important;
    }
    .empty-state-copy h2 {
      font-size: 16px !important;
      letter-spacing: 0.35em !important;
    }
    .empty-state-copy p {
      font-size: 11px !important;
      letter-spacing: 0.24em !important;
      line-height: 1.7 !important;
    }
    .empty-persona-grid,
    .onboarding-persona-grid {
      display: grid !important;
      grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
      max-width: none !important;
      width: 100% !important;
    }
    .empty-persona-card,
    .onboarding-persona-card {
      min-height: 110px !important;
      padding: 14px 10px !important;
    }
    .empty-persona-card:last-child,
    .onboarding-persona-card:last-child {
      grid-column: 1 / -1;
    }
    .user-message {
      max-width: 100% !important;
      padding-right: 12px !important;
    }
    .oracle-bubble-meta {
      margin-left: 6px !important;
      margin-bottom: 10px !important;
      flex-wrap: wrap !important;
      row-gap: 4px !important;
    }
    .oracle-bubble-card {
      padding: 20px 18px !important;
      border-radius: 20px !important;
    }
    .oracle-bubble-text {
      font-size: 14px !important;
      line-height: 1.95 !important;
    }
    .oracle-bubble-footer {
      margin-top: 18px !important;
      gap: 8px !important;
      align-items: flex-start !important;
      flex-wrap: wrap !important;
    }
    .onboarding-overlay {
      align-items: flex-end !important;
      padding: 12px !important;
      padding-top: calc(12px + var(--sat)) !important;
      padding-bottom: calc(12px + var(--sab)) !important;
    }
    .onboarding-card {
      border-radius: 24px !important;
      padding: 22px 18px !important;
      max-height: min(100%, 820px) !important;
    }
    .onboarding-step {
      min-height: auto !important;
    }
    .onboarding-heading {
      font-size: 20px !important;
      line-height: 1.45 !important;
    }
    .onboarding-body {
      font-size: 14px !important;
      line-height: 1.85 !important;
    }
    .onboarding-nav {
      flex-wrap: wrap !important;
      gap: 8px !important;
    }
    .onboarding-nav-spacer {
      display: none !important;
    }
    .onboarding-secondary,
    .onboarding-primary {
      width: 100% !important;
      justify-content: center !important;
    }
  }

  /* OS の「視差効果を減らす／動きを減らす」設定を尊重する */
  @media (prefers-reduced-motion: reduce) {
    *, *::before, *::after {
      animation-duration:0.001ms !important;
      animation-iteration-count:1 !important;
      transition-duration:0.001ms !important;
      scroll-behavior:auto !important;
    }
  }
`;
