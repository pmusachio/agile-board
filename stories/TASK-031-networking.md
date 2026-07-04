---
id: TASK-031-networking
title: Networking
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
depends_on: ["TASK-030-provision-oci-vm"]
blocks: []
related: []
---

## Description
Open the ports the board and Gitea need, in both places OCI requires it.

## Acceptance Criteria
- [x] curl to 80/443 from outside reaches the VM

## Subtasks

## Notes
Known gotcha: OCI needs ports opened in BOTH the security list/NSG (cloud-level) AND the instance’s own OS firewall (Oracle’s Ubuntu images ship a restrictive default iptables ruleset) — easy to open one and forget the other.
