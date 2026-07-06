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

// Real bug hit live 2026-07-06: Docker Compose's `${GEMINI_MODEL:-}` sets the
// container's env var to an EMPTY STRING when .env doesn't define it, not
// "unset". `''` is not `undefined`, so the `model = DEFAULT_MODEL` default
// parameter never kicked in — the URL ended up as `.../models/:generateContent`
// (no model name at all), which Gemini correctly 404s with an empty body.
// This guard treats any falsy model (undefined, '', null) as "use the
// default", regardless of how the caller ended up passing it that way.
function resolveModel(model) {
  return model || DEFAULT_MODEL;
}

// A single request occasionally comes back with an unhelpful, empty-bodied
// 4xx/5xx that succeeds moments later on identical input — one retry with a
// short backoff absorbs that without masking a genuinely broken request
// (which will fail the retry too, and still surface with full detail).
async function callGemini(url, requestBody) {
  let lastError;
  for (let attempt = 0; attempt < 2; attempt++) {
    if (attempt > 0) await new Promise((r) => setTimeout(r, 500));
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(requestBody),
    });
    if (res.ok) return res.json();
    // Never include `url` here — it carries the API key as a query param.
    const detail = await res.text().catch(() => '');
    lastError = new Error(`Gemini API error: HTTP ${res.status} ${detail ? detail.slice(0, 300) : '(empty response body)'}`);
  }
  throw lastError;
}

export async function askGemini({ apiKey, model, systemContext, question }) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${resolveModel(model)}:generateContent?key=${apiKey}`;
  const body = await callGemini(url, {
    contents: [{ parts: [{ text: question }] }],
    systemInstruction: { parts: [{ text: systemContext }] },
  });
  const text = body?.candidates?.[0]?.content?.parts?.map((p) => p.text).join('') ?? '';
  if (!text) throw new Error('Gemini API returned no text');
  return text;
}

// TASK-120/123: the act path. Gives the model the bounded ACTION_TOOLS
// (function-calling) instead of asking for prose — it returns a list of
// chosen actions, never file bytes (D12). Each returned action is exactly
// one of assistant/lib/actions.mjs's tool calls, applied deterministically
// by the caller (never executed by the model itself).
export async function proposeActions({ apiKey, model, systemContext, instruction, tools }) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${resolveModel(model)}:generateContent?key=${apiKey}`;
  const body = await callGemini(url, {
    contents: [{ parts: [{ text: instruction }] }],
    systemInstruction: { parts: [{ text: systemContext }] },
    tools: [{ functionDeclarations: tools }],
  });
  const parts = body?.candidates?.[0]?.content?.parts ?? [];
  const actions = parts
    .filter((p) => p.functionCall)
    .map((p) => ({ tool: p.functionCall.name, ...p.functionCall.args }));
  return actions;
}
