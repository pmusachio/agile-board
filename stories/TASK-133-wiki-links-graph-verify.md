---
id: TASK-133-wiki-links-graph-verify
title: Verify links + graph + refresh
status: in-progress
priority: medium
category: frontend
assignees: ["@paulo"]
epic: EPIC-013-wiki-os-fork-deploy
created: 2026-07-04
started: 2026-07-06
due: null
finished: null
tags: ["#wiki", "#viewer"]
estimate: null
depends_on: ["TASK-132-wiki-caddy-route"]
blocks: []
related: []
---

## Description
Confirm [[wiki-links]] render as navigable links with backlinks, the graph view reflects the real depends_on/blocks/related/epic + body wiki-link edges, and a merge/push refreshes the wiki with no manual step (same source of truth as the board).

## Acceptance Criteria
- [ ] PRD #15.5 link / graph / refresh criteria pass on the live corpus

## Subtasks

## Notes
Verified locally against the real 79-story corpus, in a browser preview (not yet the live
domain): opened a generated page, confirmed the Backlinks panel lists every other story
whose `related`/`depends_on`/`blocks`/`epic` points at it, confirmed the Graph View renders
real connections, and confirmed a `related` wikilink in the "At a glance" section navigates
to the right page. This only works because `related`/`depends_on`/`blocks`/`epic` are
frontmatter-only in stories/*.md — Quartz's own wikilink resolution only scans body
Markdown, so without scripts/build-wiki-content.mjs rendering those edges as real
`[[wikilinks]]` in an injected body section, none of this would have shown up at all. Also
caught and fixed a real YAML bug this way: one story's title contained an unquoted `: `,
valid under this project's own lenient frontmatter parser but not under Quartz's strict
YAML parser (see scripts/lib/serialize.mjs's `needsQuoting()`).
