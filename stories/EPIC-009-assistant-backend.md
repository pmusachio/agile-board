---
id: EPIC-009-assistant-backend
title: Assistant backend service
status: done
priority: high
category: backend
assignees: ["@paulo"]
epic: null
created: 2026-07-04
started: 2026-07-05
due: null
finished: 2026-07-06
tags: ["#ai", "#backend"]
estimate: null
depends_on: []
blocks: []
related: ["[[EPIC-008-context-assembly]]", "[[EPIC-012-ai-write-actions]]", "[[EPIC-010-chat-ui]]", "[[EPIC-003-infrastructure]]"]
---

## Description
The project's first backend, and the shared foundation for both AI capabilities: a small Node.js service that verifies a caller's Gitea token, assembles context, and calls Gemini with a server-side-only API key. This epic finishes the read-only *ask* path (question in, grounded answer out); the *act* path (instruction in, Gitea PR out) is built on top of the same service in EPIC-012. Needed because an LLM API key can't safely live in browser JS the way Gitea's OAuth2 could (D10). Deployed as a new Docker Compose service on the same OCI VM, mounting the board corpus read-only, proxied by the existing Caddy instance.

## Acceptance Criteria
- [x] TASK-090..093 complete

## Subtasks

## Notes
Auth reuses Gitea's own /api/v1/user check (same call the client already makes in write-mode) — no new auth system. Gated behind login per D8, so usage is attributable and rate-limitable from day one.

**Deployed live 2026-07-05, working 2026-07-06.** `https://agile-board.duckdns.org/api/health`
and `/api/ask` both respond correctly through the real Caddy → assistant-api path; auth
rejection verified against the real Gitea instance, and Paulo's own real login cleared the
auth guard successfully (see TASK-091). One real bug found once the real key went in:
`gemini-2.0-flash` (the hardcoded default) has zero free-tier quota on this account —
`HTTP 429 limit: 0`, not a 401/403, so it wasn't an auth or key problem. Fixed by switching
the default to `gemini-2.5-flash` (confirmed working directly against the real key) — see
TASK-092. Awaiting Paulo's own confirmation through the browser as the final real-world
check, but every piece of the pipeline is now independently verified.
