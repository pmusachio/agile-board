---
id: TASK-131-wiki-compose-service
title: Compose service + WIKI_ROOT wiring
status: in-progress
priority: high
category: infra
assignees: ["@paulo"]
epic: EPIC-013-wiki-os-fork-deploy
created: 2026-07-04
started: 2026-07-06
due: null
finished: null
tags: ["#wiki", "#infra"]
estimate: null
depends_on: ["TASK-130-fork-wiki-os", "TASK-033-compose-stack-gitea-caddy"]
blocks: ["TASK-132-wiki-caddy-route", "TASK-134-wiki-resource-check"]
related: []
---

## Description
Wire Quartz into the existing publish pipeline: no new Compose service needed (D14 revised — Quartz has no persistent process), just a `wiki-site` named volume shared between `gitea` (read-write, so the hook can write build output) and `caddy` (read-only, to serve it), and a new step in the post-receive hook that runs `node scripts/build-wiki-content.mjs` then `npx quartz build` after the existing manifest/graph rebuild.

## Acceptance Criteria
- [ ] the service starts and indexes the live corpus; a story file shows up as a wiki page

## Subtasks

## Notes
Code written and locally verified (see EPIC-013's notes) — `infra/docker-compose.yml`'s
`wiki-site` volume, `infra/hooks/post-receive`'s new build step (npm ci only on first run,
since node_modules survives `checkout -f`), and `scripts/build-wiki-content.mjs` (new,
generates the wiki's input content outside the repo entirely, in a tmpdir — Quartz's own
file discovery respects .gitignore, so a gitignored wiki/content/ would make Quartz see
its own input as "ignored" and silently build zero pages; caught locally before this ever
reached the VM). Not yet run for real on the VM — that's the live deploy step.
