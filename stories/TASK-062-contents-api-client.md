---
id: TASK-062-contents-api-client
title: Gitea Contents API client
status: done
priority: high
category: frontend
assignees: ["@paulo"]
epic: EPIC-006-board-write-mode
created: 2026-07-04
started: 2026-07-04
due: null
finished: null
tags: ["#viewer", "#gitea"]
estimate: null
depends_on: ["TASK-061-frontmatter-serializer"]
blocks: []
related: []
---

## Description
GET a story's current content + sha, overlay the edited fields via the serializer, PUT it back via Gitea's Contents API (same-origin, no CORS needed), and surface a 409 conflict clearly instead of silently overwriting someone else's concurrent change.

## Acceptance Criteria
- [ ] a save lands as a real commit visible in Gitea; a forced conflict shows a clear message instead of clobbering the other writer

## Subtasks
- [x] UTF-8-safe base64 encode/decode (Gitea's API is base64; TextEncoder/TextDecoder + btoa/atob, no library)
- [x] getFileContents / putFileContents against /api/v1/repos/{owner}/{repo}/contents/{path}
- [x] 409 handling: no auto-retry with stale data, clear notification instead
- [ ] Verify against the live Gitea instance once login (TASK-060) is unblocked

## Notes
Caught a real bug while writing this: task._file is just the bare filename (e.g. TASK-030-provision-oci-vm.md), not prefixed with stories/ — the manifest never carries that prefix since it's implied by where the manifest itself lives. Fixed by prefixing stories/ explicitly in saveTask() rather than assuming task._file already includes it.
