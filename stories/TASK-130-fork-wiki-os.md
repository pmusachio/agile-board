---
id: TASK-130-fork-wiki-os
title: Vendor Quartz + record the license
status: done
priority: high
category: infra
assignees: ["@paulo"]
epic: EPIC-013-wiki-os-fork-deploy
created: 2026-07-04
started: 2026-07-06
due: null
finished: 2026-07-06
tags: ["#wiki", "#licensing"]
estimate: null
depends_on: []
blocks: ["TASK-131-wiki-compose-service"]
related: ["[[TASK-002-licensing]]"]
---

## Description
Vendor Quartz (jackyzha0/quartz, MIT) into wiki/ so the deployed version is pinned and patchable (D14, revised — see EPIC-013's notes for why this replaced the original wiki-os plan); add its MIT license + attribution to NOTICE, consistent with how the MarkdownTaskManager fork is recorded.

## Acceptance Criteria
- [x] a pinned fork exists; NOTICE records its MIT license + attribution

## Subtasks

## Notes
Vendored the `v4` branch (latest tag-equivalent v4.5.2), pinned at commit
d25a6eabf96751ffca56f8a8139272def7a65041 — deliberately not the default branch
(`v5`), which fetches ~40 separate plugin repos from `quartz-community/*` at
install time; `v4` is fully self-contained (single `npm ci`, no extra network
calls at build time), a meaningfully better fit for a build step that runs on
a small production VM on every push. NOTICE records the MIT license, the pinned
commit, and the two config files (`quartz.config.ts`/`quartz.layout.ts`) that
were modified rather than left untouched (site title, base URL, ignore
patterns, analytics disabled, two unused plugins dropped, footer links
repointed at this project instead of upstream's own).
