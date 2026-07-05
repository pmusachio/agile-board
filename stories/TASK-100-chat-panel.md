---
id: TASK-100-chat-panel
title: Chat panel (logged-in only)
status: done
priority: high
category: frontend
assignees: ["@paulo"]
epic: EPIC-010-chat-ui
created: 2026-07-04
started: 2026-07-05
due: null
finished: 2026-07-05
tags: ["#ai", "#viewer"]
estimate: null
depends_on: ["TASK-092-gemini-call"]
blocks: ["TASK-101-loading-error-states", "TASK-102-act-result-ui"]
related: []
---

## Description
New additive script board/scripts/22-assistant.js (next number after 21-write.js, same non-invasive layering — no vendored file touched). Panel/button gated on window.__agileBoardWriteMode (the same flag write-mode already sets); calls the new backend with the already-stored Gitea token.

## Acceptance Criteria
- [x] logged in, a typed question returns a rendered answer; logged out, no chat affordance renders at all

## Subtasks

## Notes
Verified live in a real browser preview (no live backend exists yet, so fetch was stubbed): logged-out shows no button at all; setting window.__agileBoardWriteMode true shows the button, opens the panel, and a typed question correctly POSTs to /api/ask with the stored Gitea token and renders the stubbed answer. Caught and fixed a real bug during this test: the visibility poll only ran for 5 seconds after page load (meant to catch the post-OAuth-callback flip) — a slow OAuth round-trip would have missed that window and left the button hidden until a reload. Changed to poll indefinitely (a boolean check every second is free for as long as the tab is open).
