// Minimal Gemini API client (Google AI Studio / Generative Language API) — a
// single fetch, no SDK dependency, matching this project's zero-npm-deps
// convention (see scripts/*.mjs). Model name is configurable (GEMINI_MODEL
// env var) since provider model names AND free-tier availability change
// over time — confirmed live 2026-07-06 against a real key that
// gemini-2.0-flash/-lite both return HTTP 429 RESOURCE_EXHAUSTED with
// "limit: 0" on the free tier (not a quota you used up — a quota that was
// never allocated for that model generation), while gemini-2.5-flash and
// gemini-2.5-flash-lite both work. If this stops working again, list what
// your key actually has access to:
//   curl "https://generativelanguage.googleapis.com/v1beta/models?key=$KEY"
// and look for "generateContent" in supportedGenerationMethods.
const DEFAULT_MODEL = 'gemini-2.5-flash';

export async function askGemini({ apiKey, model = DEFAULT_MODEL, systemContext, question }) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: question }] }],
      systemInstruction: { parts: [{ text: systemContext }] },
    }),
  });
  if (!res.ok) {
    // Never include `url` here — it carries the API key as a query param.
    const detail = await res.text().catch(() => '');
    throw new Error(`Gemini API error: HTTP ${res.status} ${detail.slice(0, 200)}`);
  }
  const body = await res.json();
  const text = body?.candidates?.[0]?.content?.parts?.map((p) => p.text).join('') ?? '';
  if (!text) throw new Error('Gemini API returned no text');
  return text;
}

// TASK-120/123: the act path. Gives the model the bounded ACTION_TOOLS
// (function-calling) instead of asking for prose — it returns a list of
// chosen actions, never file bytes (D12). Each returned action is exactly
// one of assistant/lib/actions.mjs's tool calls, applied deterministically
// by the caller (never executed by the model itself).
export async function proposeActions({ apiKey, model = DEFAULT_MODEL, systemContext, instruction, tools }) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: instruction }] }],
      systemInstruction: { parts: [{ text: systemContext }] },
      tools: [{ functionDeclarations: tools }],
    }),
  });
  if (!res.ok) {
    const detail = await res.text().catch(() => '');
    throw new Error(`Gemini API error: HTTP ${res.status} ${detail.slice(0, 200)}`);
  }
  const body = await res.json();
  const parts = body?.candidates?.[0]?.content?.parts ?? [];
  const actions = parts
    .filter((p) => p.functionCall)
    .map((p) => ({ tool: p.functionCall.name, ...p.functionCall.args }));
  return actions;
}
