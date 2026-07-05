---
id: TASK-122-pre-pr-validation-gate
title: Pre-PR validation gate
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
depends_on: ["TASK-121-mutation-applier"]
blocks: ["TASK-123-branch-pr-creation"]
related: ["[[TASK-012-validation-check]]"]
---

## Description
Before opening any PR, run the same schema + referential-integrity checks validate-stories.mjs runs over the proposed tree; refuse (clear message, no PR) on an invalid enum, malformed frontmatter, or a dangling depends_on/blocks/related/epic reference. This is the structural guarantee that the AI can't author an invalid or destructive file.

## Acceptance Criteria
- [x] an instruction that would create an invalid or dangling story is rejected with a reason and opens no PR

## Subtasks

## Notes
Reuse the existing validator logic rather than reimplementing it, so client, publish pipeline, and AI writer all agree on what "valid" means. Did this literally: refactored scripts/validate-stories.mjs's inline schema+referential-integrity logic into scripts/lib/validate.mjs's validateCorpus(), confirmed the CLI's own output is byte-identical after the refactor, then built assistant/lib/validate-tree.mjs's validateProposedChanges() on top of that same function — one definition of "valid" for the whole project. Verified: a valid single action passes, a deliberately invalid status is caught before any PR would open, and it correctly handles a proposed tree built from a multi-action batch.
