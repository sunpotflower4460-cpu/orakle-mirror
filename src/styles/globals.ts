
// ─── Constants & Database ────────────────────────────────────────────────────

export const GLOBAL_STYLES: string = `
  :root {
    --sat: env(safe-area-inset-top, 0px);
    --sar: env(safe-area-inset-right, 0px);
    --sab: env(safe-area-inset-bottom, 0px);
    --sal: env(safe-area-inset-left, 0px);
  }
  * { box-sizing:border-box; margin:0; padding:0; -webkit-tap-highlight-color: transparent; }
  body { 
    overscroll-behavior: contain; 
    -webkit-overflow-scrolling: touch; 
    background: #fffafb; 
  }
  ::-webkit-scrollbar { width:4px; }
  ::-webkit-scrollbar-track { background:transparent; }
  ::-webkit-scrollbar-thumb { background:#e9d6de; border-radius:99px; }
  textarea { 
    font-family:inherit; 
    font-size: 16px; 
  }
  .app-shell { height: 100vh; height: 100dvh; }
  
  .sr-only { position: absolute; width: 1px; height: 1px; padding: 0; margin: -1px; overflow: hidden; clip: rect(0, 0, 0, 0); white-space: nowrap; border-width: 0; }
  
  @keyframes oracleReveal { from { opacity:0; transform:translateY(16px) scale(0.98); filter:blur(5px); } to { opacity:1; transform:translateY(0) scale(1); filter:blur(0); } }
  @keyframes userReveal { from { opacity:0; transform:translateX(10px); } to { opacity:1; transform:translateX(0); } }
  @keyframes fadeIn { from { opacity:0; transform:translateY(8px); } to { opacity:1; transform:translateY(0); } }
  @keyframes fadeUp { from { opacity:0; transform:translateX(-50%) translateY(8px); } to { opacity:1; transform:translateX(-50%) translateY(0); } }
  @keyframes spin { to { transform:rotate(360deg); } }
  @keyframes spinSlow { to { transform:rotate(360deg); } }
  @keyframes pulse { 0%,100%{opacity:.25} 50%{opacity:.65} }
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
