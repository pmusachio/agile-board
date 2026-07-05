---
id: EPIC-013-wiki-os-fork-deploy
title: Fork & deploy the wiki knowledge view
status: todo
priority: high
category: infra
assignees: ["@paulo"]
epic: null
created: 2026-07-04
started: null
due: null
finished: null
tags: ["#wiki", "#infra"]
estimate: null
depends_on: []
blocks: []
related: ["[[EPIC-014-ai-explanatory-pages]]", "[[EPIC-003-infrastructure]]", "[[EPIC-002-board-viewer]]"]
---

## Description
Stand up a second, read-only *managerial* face over the same Markdown corpus: a fork of wiki-os (MIT — Ansub/wiki-os) self-hosted at /wiki/ on the same OCI VM, with WIKI_ROOT pointing at the checked-out corpus (/srv/board) that the publish hook already produces. Homepage, search, article pages, backlinks, and a graph view over the exact same stories the board reads. See docs/PRD.md #15 (D14).

## Acceptance Criteria
- [ ] TASK-130..134 complete
- [ ] /wiki/ serves a browsable wiki over the live corpus with working links + graph view

## Subtasks

## Notes
A fork (not upstream-as-is) because wiki-os is early-stage (v0.1.0) — pin and patch it. Low lock-in regardless: it's read-only presentation over Markdown git already owns, so worst case is losing a view, never data. Resource fit on the 1GB VM is a real concern (TASK-134).
