
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
    background: #0f172a; 
  }
  ::-webkit-scrollbar { width:4px; }
  ::-webkit-scrollbar-track { background:transparent; }
  ::-webkit-scrollbar-thumb { background:#e2e8f0; border-radius:99px; }
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

  @media (max-width:600px) { .oracle-bubble .bubble-actions { opacity:1; } .room-row .room-del { opacity:1; } }

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
