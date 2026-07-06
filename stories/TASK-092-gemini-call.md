---
id: TASK-092-gemini-call
title: Gemini call
status: done
priority: high
category: backend
assignees: ["@paulo"]
epic: EPIC-009-assistant-backend
created: 2026-07-04
started: 2026-07-05
due: null
finished: 2026-07-06
tags: ["#ai", "#backend"]
estimate: null
depends_on: ["TASK-091-gitea-token-auth-guard", "TASK-080-whole-corpus-context-assembler"]
blocks: ["TASK-093-basic-abuse-guard", "TASK-100-chat-panel", "TASK-120-action-toolset"]
related: []
---

## Description
Wire the assembled context (EPIC-008) plus the user's question into a Gemini API call using a server-side-only API key (env var, never committed — same discipline as the Gitea admin/mirror secrets, PRD #8); return the answer. This is the *ask* (read-only) path; the same Gemini client is reused by the *act* path (EPIC-012, function-calling), which is why the act toolset depends on this task.

## Acceptance Criteria
- [x] a real question against the live corpus returns a real, relevant answer (verified
      directly against the real Gemini API with the real key and the new model name;
      awaiting Paulo's own confirmation through the browser as the final check)

## Subtasks

## Notes
Client code written: assistant/lib/gemini.mjs's askGemini() (single fetch to the Generative
Language API, no SDK — matches the zero-npm-deps convention). Wired into
POST /api/ask in assistant/server.mjs: auth → rate-limit → load corpus+graph → assembleContext
→ askGemini → return {answer}. With no GEMINI_API_KEY set, correctly returns
503 "assistant not configured" (verified over real HTTP) instead of a generic crash — proves
the whole pipeline up to the actual model call is correct.

**Update 2026-07-05:** the live deployment (blocker #2) is done — see TASK-090. Paulo
generated a real Gemini key but deliberately didn't paste it anywhere I'd see it; instead
`/home/ubuntu/agile-board-infra/.env` now has a clearly-labeled placeholder for him to swap
personally. Confirmed live that the pipeline up to the model call is correct: `/api/health`
returns 200, and `/api/ask` correctly rejects missing/wrongly-scoped tokens through the real
deployed service (same as TASK-091).

**Update 2026-07-06 — real bug found and fixed:** once Paulo swapped in his real key and
asked a question through the browser, he got "the assistant could not get an answer right
now" (the deliberately generic 502 message). Container logs showed the real cause without
ever exposing the key: `Gemini API error: HTTP 404`. Diagnosed by querying Gemini's own
`ListModels` endpoint with the real key (read into a shell variable on the VM, never
printed) — confirmed the key itself is valid, then tested the exact `generateContent` call
directly: `gemini-2.0-flash` (the hardcoded default) returns `HTTP 429 RESOURCE_EXHAUSTED`
with `limit: 0` on the free tier — not a quota you exceed, one that was never allocated for
that model generation on this account. `gemini-2.5-flash` and `gemini-2.5-flash-lite` both
return real `HTTP 200` answers. Changed `assistant/lib/gemini.mjs`'s `DEFAULT_MODEL` to
`gemini-2.5-flash`; redeployed (rebuild + force-recreate, same as TASK-090's process).

**Update 2026-07-06 (same day) — retry added, but the failure persisted.** Paulo tried
again and got the same generic message. Manually reproducing the exact live pipeline
inside the container (loadCorpus → assembleContext → askGemini, real 106KB context, real
key) succeeded, so I initially (wrongly) concluded the `HTTP 404`'s empty body meant a
transient upstream blip, and added a single retry with backoff in `callGemini()` plus
clearer error logging. Paulo tried again — same failure, twice in a row even with the
retry, ruling out "transient."

**Update 2026-07-06 (same day) — actual root cause found.** Added temporary diagnostic
logging (request URL minus the key, response status/headers/body — never the key or user
content) and had Paulo try once more. The logged URL was
`.../v1beta/models/:generateContent` — **the model name segment was completely empty.**
Root cause: Docker Compose's `${GEMINI_MODEL:-}` in `docker-compose.yml` sets the
container's `GEMINI_MODEL` env var to an **empty string** when `infra/.env` doesn't define
it — not "unset". `''` is not `undefined`, so `askGemini`'s `model = DEFAULT_MODEL` default
parameter (which only triggers for `undefined`) never kicked in; the real server code was
building a URL with no model name at all, 404ing deterministically every single time. My
earlier manual reproductions never hit this because they called `askGemini()` without
passing `model` at all (parameter omitted, not passed as `''`) — an artifact of how I was
testing, not the real code path.

Fixed at two layers: `assistant/lib/gemini.mjs` now has a `resolveModel()` helper that
treats *any* falsy `model` (`undefined`, `''`, `null`) as "use `DEFAULT_MODEL`", not just
`undefined`; `assistant/server.mjs` also now reads `GEMINI_MODEL` as
`process.env.GEMINI_MODEL || undefined` at the source, so an empty string never even
reaches `gemini.mjs` in the first place. Removed the temporary diagnostic logging.
Verified with a mocked fetch that all three cases (`''`, `undefined`, an explicit model
name) resolve to the correct URL; verified live inside the container, with the exact
broken `GEMINI_MODEL=""` still present, that `askGemini()` now correctly returns a real
answer ("2 + 2 = 4").
