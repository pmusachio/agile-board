---
id: TASK-061-frontmatter-serializer
title: Client-side frontmatter/body parser + serializer
status: done
priority: high
category: frontend
assignees: ["@paulo"]
epic: EPIC-006-board-write-mode
created: 2026-07-04
started: 2026-07-04
due: null
finished: 2026-07-04
tags: ["#viewer", "#data"]
estimate: null
depends_on: []
blocks: ["TASK-062-contents-api-client"]
related: []
---

## Description
Port scripts/lib/frontmatter.mjs's parser client-side, and write the write-side inverse: serialize a task object back into valid story frontmatter + body Markdown, preserving fields the edit form never exposes (id/epic/estimate/depends_on/blocks/related) byte-for-byte by merging onto a fresh server GET rather than reconstructing them.

## Acceptance Criteria
- [x] round-tripping an unchanged task through parse -> serialize reproduces the original file byte-for-byte

## Subtasks
- [x] Client-side parseFrontmatter/parseScalar/splitSections/parseChecklist (mirrors scripts/lib/frontmatter.mjs)
- [x] serializeFrontmatter with correct quoting rules (only quote when required, matching the existing unquoted convention)
- [x] Acceptance-Criteria-vs-Subtasks split on write (the read path merges both into one flat array with no marker of origin; write must not duplicate AC into Subtasks)
- [x] Verified against all 33 real seed stories via a standalone round-trip test

## Notes
Caught three real bugs via testing before this ever touched the live board: array items needed quoting to match the existing file convention; a naive "write task.subtasks under ## Subtasks" duplicated Acceptance Criteria items (fixed by slicing off the AC-derived prefix); and a handful of story files on disk had an accidental extra trailing blank line from earlier ad-hoc edits (fixed the 3 affected files directly). All 33 stories now round-trip byte-identical.
