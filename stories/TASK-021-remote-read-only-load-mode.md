---
id: TASK-021-remote-read-only-load-mode
title: Remote read-only load mode
status: done
priority: high
category: frontend
assignees: ["@paulo"]
epic: EPIC-002-board-viewer
created: 2026-07-04
started: 2026-07-04
due: null
finished: 2026-07-04
tags: ["#viewer"]
estimate: null
depends_on: ["TASK-011-manifest-generator", "TASK-020-fork-upstream-viewer"]
blocks: []
related: []
---

## Description
Fetch stories/index.json from a configurable base URL (default ../stories/, matching board/ and stories/ being siblings in the repo; override with ?board=) and render columns by status, falling back to upstream’s original local-folder mode if no manifest is found.

## Acceptance Criteria
- [x] pointing at a served index.json renders the correct cards in the right columns

## Subtasks

## Notes
board/scripts/20-remote.js. Verified locally: serving the repo root and opening board/index.html renders all 33 seed stories across the 4 columns with correct counts. Also verified the 404 fallback (leaves upstream's local-folder welcome screen intact) and the malformed-manifest error state.
