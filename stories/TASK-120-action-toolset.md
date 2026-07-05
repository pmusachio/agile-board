---
id: TASK-120-action-toolset
title: Action toolset definition
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
depends_on: ["TASK-092-gemini-call"]
blocks: ["TASK-121-mutation-applier"]
related: []
---

## Description
Define the fixed set of tools the model may call (PRD #14.4): set_status, set_field, add_tag/remove_tag, set_description/append_note, add_subtask/toggle_subtask, link, create_story, split_story. Each maps 1:1 to a schema-safe mutation. Expressed as a Gemini function-calling schema. The model chooses actions; it never emits file bytes.

## Acceptance Criteria
- [ ] the toolset is a function-calling schema Gemini can target, and every tool corresponds to a documented, bounded file change

## Subtasks

## Notes
Keeping the surface small and schema-aligned is what makes every AI change reviewable as a small diff and schema-valid by construction (D12).
