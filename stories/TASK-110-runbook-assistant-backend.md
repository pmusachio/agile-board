---
id: TASK-110-runbook-assistant-backend
title: RUNBOOK — deploy the assistant backend
status: done
priority: medium
category: docs
assignees: ["@paulo"]
epic: EPIC-011-mvp2-docs-launch
created: 2026-07-04
started: 2026-07-04
due: null
finished: 2026-07-06
tags: ["#ai", "#docs", "#infra"]
estimate: null
depends_on: ["TASK-090-assistant-api-scaffold"]
blocks: []
related: []
---

## Description
New RUNBOOK section: Gemini API key provisioning, the new Compose service, the Caddy route — same operational detail level as the existing OCI/Gitea sections.

## Acceptance Criteria
- [x] someone could stand up the backend from the runbook alone

## Subtasks

## Notes
§11 already documented the real deploy sequence (written live, 2026-07-05/06, including
the three real bugs hit and fixed). Added the missing piece: the actual `/api/*` Caddyfile
route snippet, and a gotcha discovered while doing TASK-112's live verification — a token
scoped only for `git push` (`write:repository`) is not enough to call `/api/propose` or
`/api/ask`; Gitea rejects it for missing `read:user`. Testing through the board's own
🤖 Assistant panel (which requests the right OAuth2 scopes) sidesteps this and is the
simplest way to verify the ask/propose paths live.
