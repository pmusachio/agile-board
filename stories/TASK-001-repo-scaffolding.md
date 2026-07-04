---
id: TASK-001-repo-scaffolding
title: Repo scaffolding
status: done
priority: high
category: process
assignees: ["@paulo"]
epic: EPIC-000-project-setup
created: 2026-07-04
started: 2026-07-04
due: null
finished: 2026-07-04
tags: ["#foundation"]
estimate: null
depends_on: []
blocks: []
related: []
---

## Description
Create the top-level directory layout the rest of the project fills in: board/, stories/, docs/, infra/, scripts/.

## Acceptance Criteria
- [x] `tree -L 2` shows the structure; nothing secret is tracked

## Subtasks
- [x] Create board/, stories/, docs/, infra/, scripts/
- [x] Extend .gitignore for secrets, local env, OS cruft, generated files

## Notes
docs/ already existed from the planning pass (PRD.md, TASKS.md); this task added the rest.
