---
id: EPIC-009-assistant-backend
title: Assistant backend service
status: in-progress
priority: high
category: backend
assignees: ["@paulo"]
epic: null
created: 2026-07-04
started: 2026-07-05
due: null
finished: null
tags: ["#ai", "#backend"]
estimate: null
depends_on: []
blocks: []
related: ["[[EPIC-008-context-assembly]]", "[[EPIC-012-ai-write-actions]]", "[[EPIC-010-chat-ui]]", "[[EPIC-003-infrastructure]]"]
---

## Description
The project's first backend, and the shared foundation for both AI capabilities: a small Node.js service that verifies a caller's Gitea token, assembles context, and calls Gemini with a server-side-only API key. This epic finishes the read-only *ask* path (question in, grounded answer out); the *act* path (instruction in, Gitea PR out) is built on top of the same service in EPIC-012. Needed because an LLM API key can't safely live in browser JS the way Gitea's OAuth2 could (D10). Deployed as a new Docker Compose service on the same OCI VM, mounting the board corpus read-only, proxied by the existing Caddy instance.

## Acceptance Criteria
- [ ] TASK-090..093 complete (scaffold ✓, rate limit ✓ done; auth guard + Gemini call each have one remaining check — see their own notes)

## Subtasks

## Notes
Auth reuses Gitea's own /api/v1/user check (same call the client already makes in write-mode) — no new auth system. Gated behind login per D8, so usage is attributable and rate-limitable from day one.

**Deployed live 2026-07-05.** `https://agile-board.duckdns.org/api/health` and `/api/ask`
both respond correctly through the real Caddy → assistant-api path; auth rejection is
verified against the real Gitea instance. `infra/.env` on the VM has a placeholder
`GEMINI_API_KEY` Paulo will replace himself (he generated a real key but deliberately kept
it out of this conversation). What's left for this epic to fully close: Paulo swaps in the
real key and confirms a real question gets a real answer through the browser (I don't have
a read:user-scoped token to do that positive check myself).
