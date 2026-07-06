---
id: TASK-150-board-wiki-link
title: Board ↔ wiki link
status: done
priority: medium
category: frontend
assignees: ["@paulo"]
epic: EPIC-015-knowledge-view-launch
created: 2026-07-04
started: 2026-07-06
due: null
finished: 2026-07-06
tags: ["#wiki", "#viewer"]
estimate: null
depends_on: ["TASK-132-wiki-caddy-route"]
blocks: ["TASK-152-mvp3-e2e-verification"]
related: []
---

## Description
A one-click link in the board header to /wiki/ (and ideally a link back from the wiki), so the two faces feel like one product. Additive board change, no vendored file touched — same layering discipline as 20/21/22-*.js.

## Acceptance Criteria
- [x] a user moves between board and wiki in one click

## Subtasks

## Notes
A plain `<a href="../wiki/">🧠 Wiki</a>` button in board/index.html's header, next to the
existing buttons — no JS needed, no vendored file touched. The other direction (wiki →
board) is the Footer's "Board" link in wiki/quartz.layout.ts (see NOTICE's entry for the
two modified Quartz config files). Confirmed live: `https://agile-board.duckdns.org/board/`
renders the button with `href="../wiki/"`.
