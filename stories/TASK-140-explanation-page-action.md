---
id: TASK-140-explanation-page-action
title: Explanation-page action + folder convention
status: todo
priority: medium
category: backend
assignees: ["@paulo"]
epic: EPIC-014-ai-explanatory-pages
created: 2026-07-04
started: null
due: null
finished: null
tags: ["#ai", "#wiki"]
estimate: null
depends_on: ["TASK-123-branch-pr-creation", "TASK-070-graph-schema-builder-script"]
blocks: ["TASK-141-surface-ai-pages-wiki"]
related: []
---

## Description
Extend the MVP2 action toolset (EPIC-012) so the AI can author durable macro→micro explanation / overview / map-of-content pages as Markdown with [[wiki-links]], via the same propose-via-PR path. Settle where they live (e.g. a wiki/ or notes/ folder) so explanatory prose isn't parsed as a board card by build-manifest.mjs / validate-stories.mjs.

## Acceptance Criteria
- [ ] the AI can propose an explanation page; merged, it's a normal Markdown file in the chosen folder, not a story card

## Subtasks

## Notes
Keep the story pipeline (stories/*.md) and the explanation pages in separate folders so the manifest/validator only ever see cards.
