// @ts-nocheck

// ─── Backend API Logic ───────────────────────────────────────────────────────

export const fetchBackendAPI = async (history, systemPrompt) => {
  // 【重要】本番環境では、Gemini APIキーを隠蔽するためのプロキシサーバー(Cloudflare Workers等)のURLを指定してください
  const API_URL = 'https://api.your-backend.com/oracle'; 
  const res = await fetch(API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ history, systemPrompt })
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const data = await res.json();
  return data.text;
};

export const fetchPreviewAPI = async (history, systemPrompt) => {
  const GEMINI_MODEL = 'gemini-2.5-flash-preview-09-2025';
  const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`;
  
  const apiKey = (() => {
    try {
      return (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_GEMINI_API_KEY) || "";
    } catch {
      return "";
    }
  })();

  const delays = [1000, 2000, 4000, 8000, 16000, 32000];
  const maxRetries = 5;
  const RETRYABLE_STATUSES = new Set([429, 500, 502, 503, 504]);

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const res = await fetch(`${GEMINI_URL}?key=${apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: history,
          systemInstruction: { parts: [{ text: systemPrompt }] },
          generationConfig: { temperature: 1.0, topP: 0.95, maxOutputTokens: 2048 }
        })
      });

      if (!res.ok) {
        const e = await res.json().catch(() => ({}));
        const msg = (e.error && e.error.message) || `HTTP ${res.status}`;
        const err = new Error(msg);
        if (!RETRYABLE_STATUSES.has(res.status)) throw Object.assign(err, { fatal: true });
        throw err;
      }
      const data = await res.json();
      return (data.candidates && data.candidates[0] && data.candidates[0].content && data.candidates[0].content.parts && data.candidates[0].content.parts[0] && data.candidates[0].content.parts[0].text) || '…沈黙…';
    } catch (e) {
      if (e.fatal) throw e; 
      if (attempt >= maxRetries) throw new Error("天との接続が途切れました。少し時間をおいてから再び問いかけてください。");
      await new Promise(resolve => setTimeout(resolve, delays[attempt]));
    }
  }
};

export const buildHistory = (messages, newUserText) => {
  const history = messages
    .filter(m => typeof m.text === 'string' && m.text.trim().length > 0)
    .map(m => ({ role: m.role === 'model' ? 'model' : 'user', parts: [{ text: m.text }] }));

  const alternated = [];
  for (const m of history) {
    const last = alternated[alternated.length - 1];
    if (last && last.role === m.role) continue;
    alternated.push(m);
  }

  while (alternated.length > 0 && alternated[alternated.length - 1].role !== 'user') alternated.pop();
  if (alternated.length > 0 && alternated[alternated.length - 1].role === 'user') alternated.pop();

  alternated.push({ role: 'user', parts: [{ text: newUserText }] });
  return alternated;
};
