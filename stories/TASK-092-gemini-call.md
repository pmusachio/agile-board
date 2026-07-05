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

**Two things this task is genuinely blocked on, both requiring Paulo:**
1. A Gemini API key (Google AI Studio) — a new external cloud-account credential, not
   something to generate/assume.
2. The live deployment of the assistant-api service itself (see TASK-090) — paused for
   explicit go-ahead per the project's OCI-boundary rule.
Once both exist, this task is "set GEMINI_API_KEY in infra/.env and ask a real question."
