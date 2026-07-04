---
id: TASK-064-write-mode-docs-polish
title: Write-mode docs + polish
status: done
priority: medium
category: docs
assignees: ["@paulo"]
epic: EPIC-006-board-write-mode
created: 2026-07-04
started: 2026-07-04
due: null
finished: 2026-07-04
tags: ["#docs", "#viewer"]
estimate: null
depends_on: []
blocks: []
related: []
---

## Description
docs/RUNBOOK.md section for enabling write access (self-registration + OAuth2 app registration), docs/CONTRIBUTING.md updated to describe the browser-based editing path alongside the git-based one, NOTICE entries for the new file, and an escapeHtml/textContent audit on every new dynamic string.

## Acceptance Criteria
- [x] docs accurately describe both the git-based and browser-based editing paths; no new dynamic string bypasses the codebase's existing XSS-hardening discipline

## Subtasks
- [x] docs/RUNBOOK.md #10 (self-registration check, OAuth2 app registration, verification steps)
- [x] docs/CONTRIBUTING.md updated (no longer claims "no online editor")
- [x] NOTICE entries for board/scripts/21-write.js and the 20-remote.js guard
- [x] index.html top-comment updated
- [x] Final escapeHtml/textContent audit pass

## Notes
Zero innerHTML usage in board/scripts/21-write.js — the one dynamic string (the logged-in username) goes through textContent, and every showNotification() call uses a fixed string, matching the codebase's existing discipline exactly.
