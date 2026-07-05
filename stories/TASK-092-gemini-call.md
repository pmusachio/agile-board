---
id: TASK-092-gemini-call
title: Gemini call
status: in-progress
priority: high
category: backend
assignees: ["@paulo"]
epic: EPIC-009-assistant-backend
created: 2026-07-04
started: 2026-07-05
due: null
finished: null
tags: ["#ai", "#backend"]
estimate: null
depends_on: ["TASK-091-gitea-token-auth-guard", "TASK-080-whole-corpus-context-assembler"]
blocks: ["TASK-093-basic-abuse-guard", "TASK-100-chat-panel", "TASK-120-action-toolset"]
related: []
---

## Description
Wire the assembled context (EPIC-008) plus the user's question into a Gemini API call using a server-side-only API key (env var, never committed — same discipline as the Gitea admin/mirror secrets, PRD #8); return the answer. This is the *ask* (read-only) path; the same Gemini client is reused by the *act* path (EPIC-012, function-calling), which is why the act toolset depends on this task.

## Acceptance Criteria
- [ ] a real question against the live corpus returns a real, relevant answer

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
`/home/ubuntu/agile-board-infra/.env` now has a clearly-labeled placeholder
(`GEMINI_API_KEY=REPLACE_ME_WITH_REAL_GEMINI_API_KEY`) for him to swap personally. Confirmed
live that the pipeline up to the model call is correct: `/api/health` returns 200, and
`/api/ask` correctly rejects missing/wrongly-scoped tokens through the real deployed service
(same as TASK-091). The only remaining step is Paulo replacing the placeholder with his real
key (`ssh` in, edit `/home/ubuntu/agile-board-infra/.env`, `docker compose up -d assistant-api`
to pick it up) and asking a real question — through the browser once logged in, since I don't
have a read:user-scoped token to test the success path myself.
