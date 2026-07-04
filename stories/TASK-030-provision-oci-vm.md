---
id: TASK-030-provision-oci-vm
title: Provision OCI VM
status: todo
priority: high
category: infra
assignees: ["@paulo"]
epic: EPIC-003-infrastructure
created: 2026-07-04
started: null
due: null
finished: null
tags: ["#infra", "#oci"]
estimate: null
depends_on: []
blocks: []
related: []
---

## Description
Stand up the free ARM VM (Ampere A1, Always Free tier) that will host Gitea and the published board.

## Acceptance Criteria
- [ ] reachable over SSH; non-root sudo user

## Subtasks
- [ ] Create instance (Ubuntu LTS, Ampere A1)
- [ ] Harden SSH (key auth, disable password login)

## Notes
Needs Paulo’s OCI account. Ampere A1 free tier can be capacity-constrained in some regions/ADs; the runbook should note retrying across ADs.
