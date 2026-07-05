---
id: TASK-121-mutation-applier
title: Deterministic mutation applier
status: done
priority: high
category: backend
assignees: ["@paulo"]
epic: EPIC-012-ai-write-actions
created: 2026-07-04
started: 2026-07-05
due: null
finished: 2026-07-05
tags: ["#ai", "#backend"]
estimate: null
depends_on: ["TASK-120-action-toolset"]
blocks: ["TASK-122-pre-pr-validation-gate"]
related: ["[[TASK-062-contents-api-client]]"]
---

## Description
Given one action plus the story's current file content, produce the new content via fetch-merge-write: overlay only the named fields, preserve everything else byte-for-byte. This encodes the MVP1.5 data-loss lesson as a rule — a writer that rebuilds a file from a partial in-memory view silently drops the rest. board/scripts/21-write.js's saveTask() is the reference for the fetch-merge shape.

## Acceptance Criteria
- [x] applying an action changes only what it names; a no-op action round-trips byte-identical to the original file

## Subtasks

## Notes
Implemented as applyAction()/applyActions() in assistant/lib/actions.mjs, using new shared scripts/lib/sections.mjs + scripts/lib/serialize.mjs (ported from 21-write.js's proven client-side serializer). A real bug caught here: Acceptance Criteria must be carried through verbatim, never reconstructed from parseChecklist — the same multi-line-checklist-item truncation risk flagged (but only defended against) in TASK-071 actually hit TASK-065's own AC section once this code treated AC as parseable/rebuildable. Fixed by making AC opaque/verbatim (only Subtasks is array-derived, since that's the only section any action tool touches) — matching 21-write.js's already-proven design. Verified: all 79 stories round-trip byte-identical unchanged; all 11 action types tested individually (valid + invalid cases) against the real corpus; sequential multi-action batching (applyActions) verified to avoid id collisions when two create_story calls land in one instruction.
