---
id: TASK-022-frontmatter-parsing
title: Frontmatter parsing
status: done
priority: high
category: frontend
assignees: ["@paulo"]
epic: EPIC-002-board-viewer
created: 2026-07-04
started: 2026-07-04
due: null
finished: 2026-07-04
tags: ["#viewer", "#data"]
estimate: null
depends_on: ["TASK-020-fork-upstream-viewer"]
blocks: []
related: []
---

## Description
Map each manifest entry’s already-parsed frontmatter into the exact task shape upstream’s renderer expects (including the priority/emoji convention its clean()/displayPriority() helpers rely on), without touching upstream’s own ### TASK-nnn parser.

## Acceptance Criteria
- [x] all schema fields surface on the card model

## Subtasks

## Notes
Frontmatter-to-JSON parsing itself lives server-side in scripts/lib/frontmatter.mjs; the client only maps already-structured data plus splits a story body into its ## sections. Verified locally: priority/category/assignees/tags/dates all render correctly on cards and in the detail modal.
