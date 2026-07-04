---
id: TASK-060-oauth2-pkce-login
title: OAuth2 + PKCE login with Gitea
status: in-progress
priority: high
category: frontend
assignees: ["@paulo"]
epic: EPIC-006-board-write-mode
created: 2026-07-04
started: 2026-07-04
due: null
finished: null
tags: ["#viewer", "#gitea"]
estimate: null
depends_on: []
blocks: []
related: []
---

## Description
"Log in with Gitea" button in board/scripts/21-write.js: PKCE code_verifier/challenge/state generated with browser-native crypto (no library), redirect to Gitea's authorize endpoint, handle the ?code=/&state= callback directly on board/index.html (no separate callback page), exchange the code for a token, store it in localStorage, and reflect logged-in/anonymous state in the header button.

## Acceptance Criteria
- [ ] click login, land back authenticated, see "logged in as @you", token visible in localStorage

## Subtasks
- [x] PKCE helpers (verifier/challenge/state via crypto.getRandomValues + crypto.subtle.digest)
- [x] Redirect + callback handling with state (CSRF) verification
- [x] Token storage + logout
- [ ] Register the OAuth2 app in Gitea and fill in GITEA_CLIENT_ID (blocked on Paulo)
- [ ] Verify the full redirect round-trip against the live board

## Notes
Code is written; blocked on registering the OAuth2 application in Gitea to get a real client_id (see docs/RUNBOOK.md #10) before it can be tested end-to-end.
