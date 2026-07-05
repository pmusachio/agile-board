---
id: EPIC-010-chat-ui
title: Chat UI in the board
status: done
priority: medium
category: frontend
assignees: ["@paulo"]
epic: null
created: 2026-07-04
started: 2026-07-05
due: null
finished: 2026-07-05
tags: ["#ai", "#viewer"]
estimate: null
depends_on: []
blocks: []
related: ["[[EPIC-009-assistant-backend]]", "[[EPIC-012-ai-write-actions]]", "[[EPIC-006-board-write-mode]]"]
---

## Description
A chat panel layered on top of the board the same non-invasive way write-mode was (`board/scripts/22-assistant.js`, no vendored file touched), visible only to logged-in users, calling the new assistant backend with the already-stored Gitea token. It renders both AI outputs: an *ask* answer (grounded text), and an *act* result (a plain-language change summary + a link to the opened Gitea PR, or the refusal reason when the backend declined to open one).

## Acceptance Criteria
- [x] TASK-100..102 complete

## Subtasks

## Notes
Reuses `window.__agileBoardWriteMode` as the visibility gate — the same flag EPIC-006 already introduced, so a logged-out visitor sees nothing new at all.

**Verified in a real browser preview (2026-07-05)** — the UI's own logic is done and confirmed working: logged-out shows no affordance; logged-in shows the button/panel; Ask and Propose both send the correct request (verified auth header + body shape); every response shape renders correctly (answer text, PR summary + working link, 401/429/422/503/500/network-error all produce a distinct clear message, never a stuck UI). What's not yet verified is against the REAL assistant-api (it doesn't exist live yet — see EPIC-009/012's own status) — this epic's scope (the frontend) is complete regardless of that.
