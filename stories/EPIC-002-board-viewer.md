---
id: EPIC-002-board-viewer
title: Board viewer (fork & adapt MarkdownTaskManager)
status: in-review
priority: critical
category: frontend
assignees: ["@paulo"]
epic: null
created: 2026-07-04
started: 2026-07-04
due: null
finished: null
tags: ["#viewer", "#frontend"]
estimate: null
depends_on: []
blocks: []
related: ["[[EPIC-003-infrastructure]]"]
---

## Description
Fork the upstream single-file Kanban viewer and layer a remote read-only mode on top: fetch the manifest, parse frontmatter, render cards, lazy-load story bodies — without modifying a single upstream file.

## Acceptance Criteria
- [ ] TASK-020..025 complete

## Subtasks

## Notes
Implementation and a local end-to-end pass are done (020, 021, 022, 023, 025); TASK-024 stays in-review because the cross-browser part of its AC (Firefox/Safari, not just the one engine tested locally) is still open, tracked under TASK-052.
