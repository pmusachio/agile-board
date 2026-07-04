---
id: EPIC-003-infrastructure
title: Infrastructure (OCI + Gitea + Caddy)
status: todo
priority: critical
category: infra
assignees: ["@paulo"]
epic: null
created: 2026-07-04
started: null
due: null
finished: null
tags: ["#infra", "#oci", "#gitea"]
estimate: null
depends_on: []
blocks: []
related: []
---

## Description
Stand up the self-hosted git server and static publish pipeline that makes the board reachable by a public link: OCI VM, networking, DNS, Gitea + Caddy, and the post-receive publish hook.

## Acceptance Criteria
- [ ] TASK-030..036 complete

## Subtasks

## Notes
Requires the OCI account owner (Paulo) to provision the VM — code/config for this epic is prepared in infra/ and docs/RUNBOOK.md ahead of time so provisioning is just following steps.
