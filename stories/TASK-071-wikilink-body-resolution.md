---
id: TASK-071-wikilink-body-resolution
title: Wiki-link body resolution
status: todo
priority: medium
category: data
assignees: ["@paulo"]
epic: EPIC-007-knowledge-graph-builder
created: 2026-07-04
started: null
due: null
finished: null
tags: ["#ai", "#graph"]
estimate: null
depends_on: ["TASK-070-graph-schema-builder-script"]
blocks: []
related: []
---

## Description
Parse double-bracket wiki-link references (e.g. a TASK or EPIC id wrapped in two square brackets, same syntax the `related` frontmatter field already uses) found inside story bodies — not just the frontmatter `related` array — into additional graph edges. The PRD always described wiki-links as graph edges (#6); MVP1 only ever parsed the frontmatter array.

Note for whoever implements this: this file's own body is a real test case — none of the prose above should itself be misparsed as a link, since it deliberately avoids writing literal bracket syntax with a fake id.

## Acceptance Criteria
- [ ] a real double-bracketed TASK/EPIC id mentioned anywhere in a story's Markdown body shows up as an edge in graph.json
- [ ] this exact file does not produce any dangling/bogus edges when parsed

## Subtasks

## Notes
