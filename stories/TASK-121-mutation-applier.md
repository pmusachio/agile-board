---
id: TASK-121-mutation-applier
title: Deterministic mutation applier
status: todo
priority: high
category: backend
assignees: ["@paulo"]
epic: EPIC-012-ai-write-actions
created: 2026-07-04
started: null
due: null
finished: null
tags: ["#ai", "#backend"]
estimate: null
depends_on: ["TASK-120-action-toolset"]
blocks: ["TASK-122-pre-pr-validation-gate"]
related: ["[[TASK-062-contents-api-client]]"]
---

## Description
Given one action plus the story's current file content, produce the new content via fetch-merge-write: overlay only the named fields, preserve everything else byte-for-byte. This encodes the MVP1.5 data-loss lesson as a rule — a writer that rebuilds a file from a partial in-memory view silently drops the rest. board/scripts/21-write.js's saveTask() is the reference for the fetch-merge shape.

## Acceptance Criteria
- [ ] applying an action changes only what it names; a no-op action round-trips byte-identical to the original file

## Subtasks

## Notes
