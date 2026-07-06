---
id: EPIC-013-wiki-os-fork-deploy
title: Fork & deploy the wiki knowledge view
status: in-progress
priority: high
category: infra
assignees: ["@paulo"]
epic: null
created: 2026-07-04
started: 2026-07-06
due: null
finished: null
tags: ["#wiki", "#infra"]
estimate: null
depends_on: []
blocks: []
related: ["[[EPIC-014-ai-explanatory-pages]]", "[[EPIC-003-infrastructure]]", "[[EPIC-002-board-viewer]]"]
---

## Description
Stand up a second, read-only *managerial* face over the same Markdown corpus: a static wiki built by Quartz (MIT — jackyzha0/quartz), served at /wiki/ on the same OCI VM, rebuilt by the existing publish hook from the checked-out corpus (/srv/board). Homepage, search, article pages, backlinks, and a graph view over the exact same stories the board reads. See docs/PRD.md #15 (D14).

**D14 revised 2026-07-06:** originally planned as a fork of wiki-os (Fastify + SQLite,
a persistent service). Paulo pushed back on standing up a database just to view Markdown
for a non-technical audience — a fair point, since this is meant to replace "share the
vault via Obsidian Publish," not add a new backend. Pivoted to Quartz (v4 branch, MIT):
a static-site generator purpose-built for this exact case — no server, no database, just
`quartz build` as one more step in the hook alongside build-manifest.mjs/build-graph.mjs,
output served as plain static files by Caddy exactly like /board/ already is.

## Acceptance Criteria
- [ ] TASK-130..134 complete
- [ ] /wiki/ serves a browsable wiki over the live corpus with working links + graph view

## Subtasks

## Notes
Vendored (not upstream-as-is) so the deployed version is pinned and patchable, same
reasoning as the MarkdownTaskManager fork. Low lock-in regardless: it's read-only
presentation over Markdown git already owns, so worst case is losing a view, never data.

Locally verified before touching the VM: `wiki/` (vendored Quartz v4.5.2, pinned commit
d25a6eab) builds real story content in under 1s, wikilinks/backlinks/graph all confirmed
working in a browser preview against the real 79-story corpus. Caught and fixed two real
bugs along the way (see TASK-130/133's notes): a YAML-quoting gap in this project's own
frontmatter serializer, and a `related`/`depends_on`/`blocks` graph-edge visibility gap
(those edges live only in frontmatter, never in body text, so Quartz's own wikilink
resolution — which only scans body Markdown — would never have surfaced them without
scripts/build-wiki-content.mjs injecting an "At a glance" section per page).

Resource fit on the 1GB VM (TASK-134) is a smaller concern now than it was for wiki-os:
Quartz has no persistent process or database, just a build step. Still needs a real
measurement on the actual VM before calling it done.
