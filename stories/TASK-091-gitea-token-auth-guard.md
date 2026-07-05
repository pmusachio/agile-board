---
id: TASK-091-gitea-token-auth-guard
title: Gitea-token auth guard
status: in-progress
priority: high
category: backend
assignees: ["@paulo"]
epic: EPIC-009-assistant-backend
created: 2026-07-04
started: 2026-07-05
due: null
finished: null
tags: ["#ai", "#backend", "#gitea"]
estimate: null
depends_on: ["TASK-090-assistant-api-scaffold"]
blocks: ["TASK-092-gemini-call"]
related: []
---

## Description
Verify the caller's bearer token against Gitea's /api/v1/user (same call 21-write.js's fetchUsername() already makes client-side) before doing anything else; reject missing/invalid tokens. No new auth system.

## Acceptance Criteria
- [x] no/bad token is rejected
- [ ] a real logged-in user's token is accepted (verified against a stubbed Gitea response; not yet against the live instance — needs the deploy step in TASK-090)

## Subtasks

## Notes
Implemented as assistant/lib/gitea-auth.mjs's verifyGiteaToken(). Verified three ways: (1) no token / garbage token against the real live Gitea → correctly 401; (2) the real gitea-push-token.txt PAT (which lacks read:user scope) → Gitea itself returns 403, correctly translated to 401 — proves the "not ok" rejection path works against a real server response, not just a hypothetical; (3) a stubbed fetch returning a valid {login} body → correctly extracts the username. The positive path against a real read:user-scoped token (e.g. the OAuth2 token from a real browser login) is the one thing not yet exercised — reasonable given no such token exists as a static file to test with, and the identical GET /api/v1/user + res.json().login pattern is already proven live in board/scripts/21-write.js's fetchUsername().
