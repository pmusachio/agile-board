---
id: TASK-024-robust-states-cross-browser
title: Robust states & cross-browser
status: in-review
priority: medium
category: frontend
assignees: ["@paulo"]
epic: EPIC-002-board-viewer
created: 2026-07-04
started: 2026-07-04
due: null
finished: null
tags: ["#viewer", "#reliability"]
estimate: null
depends_on: ["TASK-023-card-read-only-detail-view"]
blocks: []
related: ["[[TASK-052-end-to-end-acceptance]]"]
---

## Description
Empty-board and fetch-error states (network failure, non-2xx, malformed JSON), and confirming the read path works without the File System Access API upstream’s local mode needs.

## Acceptance Criteria
- [ ] works in all three target browsers; graceful message on network error

## Subtasks

## Notes
The read path only uses fetch/URL/URLSearchParams — none of it depends on Chromium-only APIs, by construction. Verified locally: 404 on the manifest falls back to upstream's local-folder screen untouched; a malformed-JSON manifest shows a clear inline error; an empty stories list would render normally (each column already has an upstream empty-state). Still open: only tested in one browser engine so far — a literal pass in Firefox and Safari is still needed before closing this out, tracked under TASK-052.
