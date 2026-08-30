
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
    --om-shadow-modal: 0 28px 64px rgba(90,60,80,0.10), 0 8px 24px rgba(140,100,120,0.06);
    --om-cta-shadow: 0 16px 38px rgba(10,16,36,0.22), inset 0 1px 0 rgba(219,233,255,0.42), 0 0 28px rgba(217,111,140,0.10);
    --om-cta-bg: linear-gradient(180deg, #141c38 0%, #0d1328 58%, #10182f 100%);
    --om-glow-rose: 0 0 58px rgba(217,111,140,0.22);
    --om-glow-rose-wide: 0 0 104px rgba(217,111,140,0.14);

    /* ── Phase U: iPad ユニバーサル対応トークン ───────────────── */
    /* 主コンテンツ列(ヘッダー内側 / チャット本文 / 入力欄 / Self Reading)の
       最大幅。iPhone(画面幅 < 720px)では実質フル幅のままで見た目は変わらない。
       iPad の広い画面でのみ、この幅に収めて間延びを防ぐ。 */
    --om-content-max: 720px;
  }
  * { box-sizing:border-box; margin:0; padding:0; -webkit-tap-highlight-color: transparent; }
  html { height: 100%; }
  body {
    overscroll-behavior: contain;
    -webkit-overflow-scrolling: touch;
    background: #fffdfd;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    text-rendering: optimizeLegibility;
  }
  button, textarea, input { touch-action: manipulation; font-family: inherit; }
  textarea::placeholder { color: var(--om-text-muted); letter-spacing: 0.04em; }
  ::selection { background: rgba(215,120,148,0.22); color: var(--om-text-main); }
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

  /* キーボード操作時のみ表示されるアクセシブルなフォーカスリング(ブランド色) */
  :focus-visible { outline:2px solid rgba(13,19,40,0.38); outline-offset:2px; border-radius:10px; }
  :focus:not(:focus-visible) { outline:none; }

  /* ── 共通操作サーフェス(spiritual luxury の操作感を揃える) ── */
  .om-cta {
    background: var(--om-cta-bg);
    color: #fff;
    border: none;
    box-shadow: var(--om-cta-shadow);
    letter-spacing: 0.12em;
    font-weight: 700;
    cursor: pointer;
    min-height: 48px;
    transition: transform 0.2s cubic-bezier(0.16,1,0.3,1), box-shadow 0.25s ease, filter 0.25s ease, opacity 0.2s ease;
  }
  .om-cta:hover:not(:disabled) { filter: brightness(1.06); }
  .om-cta:active:not(:disabled) { transform: scale(0.97); }
  .om-cta:disabled { opacity: 0.7; cursor: not-allowed; filter: none; }

  .om-glass-btn {
    background: rgba(255,255,255,0.60);
    color: #6f7a8b;
    border: 1px solid rgba(210,200,210,0.35);
    cursor: pointer;
    transition: transform 0.2s cubic-bezier(0.16,1,0.3,1), background 0.25s ease, color 0.25s ease;
  }
  .om-glass-btn:hover:not(:disabled) { background: rgba(255,255,255,0.82); color: #55627a; }
  .om-glass-btn:active:not(:disabled) { transform: scale(0.97); }
  .om-glass-btn:disabled { opacity: 0.6; cursor: not-allowed; }

  .om-icon-btn {
    min-width: 44px;
    min-height: 44px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: transparent;
    border: none;
    cursor: pointer;
    transition: transform 0.2s cubic-bezier(0.16,1,0.3,1), background 0.25s ease, color 0.25s ease, box-shadow 0.25s ease;
  }
  .om-icon-btn:hover:not(:disabled) { background: rgba(255,255,255,0.78); color: #5f6b7a; }
  .om-icon-btn:active:not(:disabled) { transform: scale(0.94); }
  .om-icon-btn:disabled { opacity: 0.5; cursor: not-allowed; }

  .om-star-divider {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 10px;
    --om-star-line: 64px;
  }
  .om-star-divider::before,
  .om-star-divider::after {
    content: '';
    height: 1px;
    width: var(--om-star-line);
    background: rgba(215,120,148,0.28);
  }
  .om-star-divider span { color: #d77894; font-size: 11px; line-height: 1; }
  .om-star-divider--sm { --om-star-line: 48px; }
  .om-star-divider--sm span { font-size: 10px; }

  .om-lang-toggle {
    position: relative;
    display: inline-flex;
    align-items: stretch;
    background: rgba(255,255,255,0.52);
    border-radius: 999px;
    padding: 4px;
    border: 1px solid rgba(210,220,238,0.42);
    box-shadow: inset 0 1px 2px rgba(255,255,255,0.85), var(--om-shadow-soft);
    overflow: hidden;
  }
  .om-lang-thumb {
    position: absolute;
    top: 4px;
    bottom: 4px;
    left: 4px;
    width: calc(50% - 4px);
    border-radius: 999px;
    background: linear-gradient(130deg, rgba(250,214,228,0.96), rgba(232,240,255,0.90));
    box-shadow: 0 6px 16px rgba(180,110,140,0.14), inset 0 1px 0 rgba(255,255,255,0.88);
    transition: transform 0.32s cubic-bezier(0.16,1,0.3,1);
    z-index: 0;
    pointer-events: none;
  }
  .om-lang-btn {
    position: relative;
    z-index: 1;
    flex: 1 1 0;
    min-width: 72px;
    min-height: 44px;
    padding: 6px 16px;
    border: none;
    background: transparent;
    cursor: pointer;
    font-size: 12px;
    font-weight: 600;
    color: #7e8da7;
    transition: color 0.25s ease;
  }
  .om-lang-btn[aria-pressed="true"] { color: #20304b; }

  .om-modal-overlay {
    position: fixed;
    inset: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 16px;
    padding-top: calc(16px + var(--sat));
    padding-bottom: calc(16px + var(--sab));
    overflow: hidden;
    overscroll-behavior: contain;
    animation: fadeIn 0.3s ease;
  }
  .om-modal-card {
    width: 100%;
    max-height: 100%;
    min-height: 0;
    overflow-y: auto;
    overscroll-behavior: contain;
    -webkit-overflow-scrolling: touch;
    border-radius: 32px;
    background: linear-gradient(140deg, rgba(255,255,255,0.92), rgba(255,246,251,0.86), rgba(240,246,255,0.78));
    border: 1px solid rgba(214,224,245,0.42);
    box-shadow: var(--om-shadow-modal);
    animation: modalReveal 0.4s cubic-bezier(0.16,1,0.3,1);
  }
  .om-modal-card--sheet {
    display: flex;
    flex-direction: column;
    overflow: hidden;
  }
  .om-modal-body {
    flex: 1 1 auto;
    min-height: 0;
    overflow-y: auto;
    overscroll-behavior: contain;
    -webkit-overflow-scrolling: touch;
  }
  .om-modal-header {
    flex: 0 0 auto;
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 22px 20px 14px 28px;
    border-bottom: 1px solid rgba(220,210,216,0.28);
    background: linear-gradient(180deg, rgba(255,252,253,0.96), rgba(255,250,252,0.88));
  }
  .om-modal-footer {
    flex: 0 0 auto;
    padding: 14px 28px 24px;
    border-top: 1px solid rgba(220,210,216,0.28);
    background: linear-gradient(180deg, rgba(255,252,253,0.55), rgba(255,250,252,0.96));
  }

  .header-icon-btn:hover { background: rgba(255,255,255,0.78) !important; color: #5f6b7a !important; }
  .header-icon-btn:active { transform: scale(0.94); }
  .empty-persona-card:active,
  .onboarding-persona-card:active { transform: scale(0.98); }
  .room-row:active { background: rgba(255,255,255,0.72); }

  /* backdrop-filter が効かない環境だけ、既存の霧を壊さず不透明度を足す */
  @supports not ((backdrop-filter: blur(1px)) or (-webkit-backdrop-filter: blur(1px))) {
    .app-header { background: rgba(255,253,253,0.96) !important; }
    .input-shell { background: rgba(255,250,252,0.96) !important; }
    .om-modal-card { background: rgba(255,252,253,0.98) !important; }
  }

  /* 入力欄シェル:フォーカス時にやわらかく息づく */
  .input-shell { transition:box-shadow 0.45s ease, border-color 0.45s ease, transform 0.45s cubic-bezier(0.16,1,0.3,1); }

  /* Phase U: ヘッダー / 入力欄の内側ラッパ。既定はフル幅で iPhone は不変。
     iPad では下の min-width:768px ブロックで中央 720px に収める。 */
  .app-header-inner { width: 100%; }
  .input-area-inner { width: 100%; }

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
      font-size: 10px !important;
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
    /* 下端シートにすると言語トグルが画面中央へ沈む。画面いっぱいに伸ばして上を使う。 */
    .onboarding-overlay {
      align-items: stretch !important;
      padding: 10px !important;
      padding-top: calc(6px + var(--sat)) !important;
      padding-bottom: calc(8px + var(--sab)) !important;
    }
    .onboarding-card {
      flex: 1 1 auto !important;
      height: 100% !important;
      max-height: 100% !important;
      max-width: 100% !important;
      border-radius: 28px !important;
      padding: 12px 18px 16px !important;
    }
    .onboarding-header {
      margin-bottom: 4px !important;
    }
    .onboarding-step {
      min-height: 0 !important;
    }
    .onboarding-hero {
      padding-top: 12px !important;
      justify-content: flex-start !important;
    }
    .onboarding-heading {
      font-size: 22px !important;
      line-height: 1.45 !important;
    }
    .onboarding-body {
      font-size: 14px !important;
      line-height: 1.85 !important;
    }
    .onboarding-progress {
      margin: 12px 0 !important;
    }
    .onboarding-nav {
      flex-wrap: nowrap !important;
      gap: 10px !important;
    }
    .onboarding-nav-spacer {
      display: none !important;
    }
    .onboarding-secondary {
      flex: 0 0 auto !important;
      width: auto !important;
      min-width: 104px !important;
      min-height: 52px !important;
      justify-content: center !important;
    }
    .onboarding-primary {
      flex: 1 1 0 !important;
      width: auto !important;
      min-height: 52px !important;
      justify-content: center !important;
    }
  }

  /* ── Phase U: iPad / 大画面のレイアウト隔離帯 ───────────────────
     iPhone(幅 < 768px)には一切影響しない。タブレット以上でのみ、
     主要列(ヘッダー内側・入力欄)を中央 var(--om-content-max) に収め、
     画面端までの間延びを防ぐ。U-2 / U-3 の内側ラッパと対になる。 */
  @media (min-width: 768px) {
    .app-header-inner,
    .input-area-inner {
      max-width: var(--om-content-max);
      margin-left: auto;
      margin-right: auto;
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
