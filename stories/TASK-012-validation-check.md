---
id: TASK-012-validation-check
title: Validation check
status: done
priority: medium
category: data
assignees: ["@paulo"]
epic: EPIC-001-data-pipeline
created: 2026-07-04
started: 2026-07-04
due: null
finished: 2026-07-04
tags: ["#data", "#tooling"]
estimate: null
depends_on: ["TASK-011-manifest-generator"]
blocks: []
related: []
---

## Description
A script validating every story against docs/story.schema.json, plus cross-file checks (id/filename agreement, uniqueness, dangling depends_on/blocks/epic/related references).

## Acceptance Criteria
- [x] a bad enum or missing required field fails the check

## Subtasks

## Notes
scripts/validate-stories.mjs. Interprets the specific JSON-Schema subset the schema file uses, so schema.json stays the single source of truth.
