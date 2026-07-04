---
id: TASK-020-fork-upstream-viewer
title: Fork upstream into board/
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
depends_on: ["TASK-002-licensing"]
blocks: []
related: []
---

## Description
Vendor MarkdownTaskManager’s modular src/ (not the minified bundle) into board/, unmodified, so the fork stays readable and diffable against upstream.

## Acceptance Criteria
- [x] board/index.html opens and shows a board

## Subtasks

## Notes
Pinned to upstream commit f173f0d (2026-06-20), recorded in NOTICE. board/scripts/00-12 and board/styles/*.css are byte-for-byte unmodified.
