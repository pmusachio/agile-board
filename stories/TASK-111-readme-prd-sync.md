---
id: TASK-111-readme-prd-sync
title: README + PRD sync for MVP2
status: done
priority: medium
category: docs
assignees: ["@paulo"]
epic: EPIC-011-mvp2-docs-launch
created: 2026-07-04
started: 2026-07-04
due: null
finished: 2026-07-06
tags: ["#ai", "#docs"]
estimate: null
depends_on: ["TASK-100-chat-panel", "TASK-092-gemini-call"]
blocks: []
related: []
---

## Description
Update README's architecture/roadmap to describe the shipped MVP2 feature, mirroring how D6/write-mode was folded back in after MVP1.5 shipped.

## Acceptance Criteria
- [x] README and PRD both accurately describe the live MVP2 feature, no stale "planned" language left over

## Subtasks

## Notes
README was rewritten for the team-presentation cleanup (trimmed to problem/solution/
architecture/usage, AI ask+propose described as a first-class capability, not a roadmap
item). PRD §14's status line and Definition of Done updated to "shipped and live" for the
ask path; the act path's DoD items are left as in-progress (`[~]`) rather than checked,
since its first real live PR run was still in flight as of this edit — see TASK-112.
