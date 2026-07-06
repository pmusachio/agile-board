---
id: TASK-131-wiki-compose-service
title: Compose service + WIKI_ROOT wiring
status: done
priority: high
category: infra
assignees: ["@paulo"]
epic: EPIC-013-wiki-os-fork-deploy
created: 2026-07-04
started: 2026-07-06
due: null
finished: 2026-07-06
tags: ["#wiki", "#infra"]
estimate: null
depends_on: ["TASK-130-fork-wiki-os", "TASK-033-compose-stack-gitea-caddy"]
blocks: ["TASK-132-wiki-caddy-route", "TASK-134-wiki-resource-check"]
related: []
---

## Description
Wire Quartz into the existing publish pipeline: no new Compose service needed (D14 revised — Quartz has no persistent process), just a `wiki-site` named volume shared between `gitea` (read-write, so the hook can write build output) and `caddy` (read-only, to serve it), and a new step in the post-receive hook that runs `node scripts/build-wiki-content.mjs` then Quartz's build after the existing manifest/graph rebuild.

## Acceptance Criteria
- [x] the service starts and indexes the live corpus; a story file shows up as a wiki page

## Subtasks

## Notes
**Deployed and verified live 2026-07-06.** `npm ci` inside the gitea container installed
446 packages in ~1 minute (well within the VM's means); the wiki build itself processed
all 79 stories into 116 static files in ~16s. Three more real bugs surfaced only once this
ran on the actual VM (Alpine/musl), none of them visible in local testing on macOS:

1. Gitea's own Alpine base ships Node 20 with no npm/npx at all — Quartz needs Node >=22.
   Fixed in `infra/gitea.Dockerfile` by copying node/npm/npx in from the official
   `node:22-alpine` image (multi-stage `COPY --from`).
2. That copied `node` binary crashed with "Error relocating" for every C++ stdlib symbol —
   it's musl-built but still dynamically links `libstdc++`/`libgcc`, which gitea's base
   doesn't have installed. Fixed with `apk add libstdc++ libgcc`.
3. `COPY --from=node /usr/local/bin/npm` dereferences a symlink (npm/npx are symlinks to
   npm-cli.js/npx-cli.js with relative targets) and drops the target file's own content at
   the wrong path, breaking its `require('../lib/cli.js')`. Fixed by recreating the symlinks
   explicitly instead of copying the files.

See TASK-132/134's notes for the two further bugs found running the actual build (npx's
shebang needing GNU `env -S`, and Quartz's clean-output-dir step failing on a volume mount
root). All fixed, all verified against the real production VM, not just locally.
