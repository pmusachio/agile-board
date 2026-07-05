---
id: TASK-093-basic-abuse-guard
title: Basic abuse guard
status: in-progress
priority: medium
category: backend
assignees: ["@paulo"]
epic: EPIC-009-assistant-backend
created: 2026-07-04
started: 2026-07-05
due: null
finished: null
tags: ["#ai", "#backend"]
estimate: null
depends_on: ["TASK-092-gemini-call"]
blocks: []
related: []
---

## Description
Simple per-user rate limit (e.g. N requests/minute) — cheap now that every request carries a real identity (TASK-091).

## Acceptance Criteria
- [x] rapid-fire requests from one account are throttled with a clear error, not silently billed forever

## Subtasks

## Notes
Built ahead of TASK-092 rather than after it (a reasonable build-order swap — the guard sits in front of the expensive call regardless of what's behind it). Implemented as assistant/lib/rate-limit.mjs (in-memory sliding window, 10 req/60s per username). Fully verified: a direct unit test confirms the threshold, per-user isolation, and window-expiry; a real-HTTP test against the running server (12 rapid POST /api/ask requests) showed exactly 10 succeed and the rest get 429 with a Retry-After header. Only remaining gap is the shared one from TASK-090: not yet exercised on the live deployed service.
