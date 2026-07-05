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
- [ ] a real logged-in user's token is accepted (verified against a stubbed Gitea response and the real rejection path live; the real acceptance path needs a read:user-scoped token, which doesn't exist as a static file to test with — see notes)

## Subtasks

## Notes
Implemented as assistant/lib/gitea-auth.mjs's verifyGiteaToken(). Verified: (1) no token / garbage token against the real live Gitea (both locally and now through the deployed assistant-api at agile-board.duckdns.org/api/ask) → correctly 401; (2) the real gitea-push-token.txt PAT (which lacks read:user scope) → Gitea itself returns 403, correctly translated to 401 by this code, reproduced against both the local server and the live deployed one — proves the rejection path works against real server responses, not just a hypothetical; (3) a stubbed fetch returning a valid {login} body → correctly extracts the username.

Deliberately not exercised: the positive path against a real read:user-scoped token. Minting one would mean either using Gitea admin credentials (which I don't have — the user rotated the admin password himself earlier this session) or going through a real OAuth2 browser login (which requires an actual account). Rather than work around that, this is left for the user to confirm himself once logged in via the browser — the identical GET /api/v1/user + res.json().login pattern is already proven live in board/scripts/21-write.js's fetchUsername() from MVP1.5, so confidence is high, just not exercised through this exact new code path yet.
