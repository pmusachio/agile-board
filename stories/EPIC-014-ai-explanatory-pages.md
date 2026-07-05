---
id: EPIC-014-ai-explanatory-pages
title: AI explanatory / overview pages
status: todo
priority: medium
category: backend
assignees: ["@paulo"]
epic: null
created: 2026-07-04
started: null
due: null
finished: null
tags: ["#ai", "#wiki"]
estimate: null
depends_on: []
blocks: []
related: ["[[EPIC-012-ai-write-actions]]", "[[EPIC-013-wiki-os-fork-deploy]]"]
---

## Description
Give the MVP2 AI act path a purpose beyond editing cards: have it author durable macro→micro explanation / overview / map-of-content pages (how cards relate, how an epic evolved, a bug drilled to its detail) as Markdown with [[wiki-links]], landing as reviewed PRs and surfacing in the wiki view like any other page. "Compounding memory" in the AutoSci sense (D15) — the knowledge base gets richer over time, every addition human-approved.

## Acceptance Criteria
- [ ] TASK-140..141 complete
- [ ] a merged AI explanation page appears in the wiki, cross-linked to the stories it explains

## Subtasks

## Notes
AutoSci (skyllwt/AutoSci) is the reference for this pattern, not a dependency — it's a research-paper agent, wrong domain to adopt. Explanation pages likely live in a wiki/ or notes/ folder distinct from stories/ so prose isn't parsed as a board card (settled in TASK-140).
