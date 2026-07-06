---
id: TASK-091-gitea-token-auth-guard
title: Gitea-token auth guard
status: done
priority: high
category: backend
assignees: ["@paulo"]
epic: EPIC-009-assistant-backend
created: 2026-07-04
started: 2026-07-05
due: null
finished: 2026-07-06
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
- [x] a real logged-in user's token is accepted

## Subtasks

## Notes
Implemented as assistant/lib/gitea-auth.mjs's verifyGiteaToken(). Verified: (1) no token / garbage token against the real live Gitea → correctly 401; (2) the real gitea-push-token.txt PAT (which lacks read:user scope) → Gitea itself returns 403, correctly translated to 401; (3) a stubbed fetch returning a valid {login} body → correctly extracts the username.

**Update 2026-07-06:** the positive path is now confirmed too — indirectly, but solidly. When Paulo asked a real question through the browser (logged in with his own account), the error he got ("the assistant could not get an answer right now") only comes from `handleAsk`'s Gemini-call catch block, which only runs *after* auth and rate-limiting both pass. So his real session's token cleared this exact auth guard successfully — the remaining bug was downstream, in the Gemini model name (see TASK-092).
