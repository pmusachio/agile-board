---
id: TASK-030-provision-oci-vm
title: Provision OCI VM
status: done
priority: high
category: infra
assignees: ["@paulo"]
epic: EPIC-003-infrastructure
created: 2026-07-04
started: 2026-07-04
due: null
finished: 2026-07-04
tags: ["#infra", "#oci"]
estimate: null
depends_on: []
blocks: []
related: []
---

## Description
Stand up the free ARM VM (Ampere A1, Always Free tier) that will host Gitea and the published board.

## Acceptance Criteria
- [x] reachable over SSH; non-root sudo user

## Subtasks
- [x] Create instance (Ubuntu LTS, Ampere A1)
- [x] Harden SSH (key auth, disable password login)

## Notes
Actual shape ended up as VM.Standard.E2.1.Micro (Always-Free x86, not the Ampere A1 ARM shape this story originally assumed) — still zero-cost, but only 1 OCPU / ~1GB RAM with no swap by default. Added a 2GB swap file (persisted via /etc/fstab) to give Gitea+Caddy enough headroom; documented as a follow-up option to instead recreate on Ampere A1 if the small VM ever proves too tight.
