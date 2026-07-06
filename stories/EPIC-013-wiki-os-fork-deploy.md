---
id: EPIC-013-wiki-os-fork-deploy
title: Fork & deploy the wiki knowledge view
status: done
priority: high
category: infra
assignees: ["@paulo"]
epic: null
created: 2026-07-04
started: 2026-07-06
due: null
finished: 2026-07-06
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
- [x] TASK-130..134 complete
- [x] /wiki/ serves a browsable wiki over the live corpus with working links + graph view

## Subtasks

## Notes
Vendored (not upstream-as-is) so the deployed version is pinned and patchable, same
reasoning as the MarkdownTaskManager fork. Low lock-in regardless: it's read-only
presentation over Markdown git already owns, so worst case is losing a view, never data.

**Live at `https://agile-board.duckdns.org/wiki/` as of 2026-07-06.** Locally verified
first (browser preview against the real 79-story corpus: wikilinks/backlinks/graph all
working), then deployed for real, hitting five more real bugs along the way that only
showed up on the actual VM (Alpine/musl, not macOS) — see TASK-131/132/134's notes for
each: Node 20→22 + missing npm, a missing libstdc++/libgcc, a broken npm/npx symlink from
a naive `COPY`, npx's shebang needing GNU `env -S` (BusyBox doesn't have it), and Quartz's
clean-output-dir step failing on a Docker volume mount root. Also two bugs caught locally
before ever touching the VM (TASK-130/133's notes): a YAML-quoting gap in this project's
own frontmatter serializer, and the fact that `related`/`depends_on`/`blocks`/`epic` are
frontmatter-only, never in body text, so Quartz's own wikilink resolution would never have
surfaced them without `scripts/build-wiki-content.mjs` injecting an "At a glance" section.

Resource fit on the 1GB VM (TASK-134) turned out to be a non-issue: no persistent process,
`npm ci` (~1 min, once) and the build itself (~16s, on every push) both comfortable within
the box's means, memory and disk barely moved.
