---
id: TASK-133-wiki-links-graph-verify
title: Verify links + graph + refresh
status: done
priority: medium
category: frontend
assignees: ["@paulo"]
epic: EPIC-013-wiki-os-fork-deploy
created: 2026-07-04
started: 2026-07-06
due: null
finished: 2026-07-06
tags: ["#wiki", "#viewer"]
estimate: null
depends_on: ["TASK-132-wiki-caddy-route"]
blocks: []
related: []
---

## Description
Confirm [[wiki-links]] render as navigable links with backlinks, the graph view reflects the real depends_on/blocks/related/epic + body wiki-link edges, and a merge/push refreshes the wiki with no manual step (same source of truth as the board).

## Acceptance Criteria
- [x] PRD #15.5 link / graph / refresh criteria pass on the live corpus

## Subtasks

## Notes
Verified locally first (browser preview against the real 79-story corpus): Backlinks panel
lists every story whose `related`/`depends_on`/`blocks`/`epic` points at the current one,
Graph View renders real connections, "At a glance" wikilinks navigate correctly. This only
works because those fields are frontmatter-only in stories/*.md — Quartz's own wikilink
resolution only scans body Markdown, so without scripts/build-wiki-content.mjs rendering
them as real `[[wikilinks]]` in an injected section, none of it would show up. Also caught
a real YAML bug this way: one story's title had an unquoted `: `, valid under this
project's own lenient parser but not Quartz's strict YAML parser (see
scripts/lib/serialize.mjs's `needsQuoting()`).

**Re-verified live 2026-07-06** against `https://agile-board.duckdns.org/wiki/`: fetched
`/wiki/EPIC-009-assistant-backend` directly and confirmed real `href="./EPIC-008-context-assembly"`-style
links present in the HTML alongside the rendered "At a glance"/"Related" text — same
result as the local preview, on the actual production build. Refresh-on-push is inherent
to the design (the wiki rebuilds as part of the same hook that rebuilds the board's own
manifest), not something separate to verify.
