---
id: TASK-065-remove-local-mode
title: Remove local-folder mode entirely; web-only from here on
status: done
priority: medium
category: frontend
assignees: ["@paulo"]
epic: EPIC-006-board-write-mode
created: 2026-07-04
started: 2026-07-04
due: null
finished: 2026-07-04
tags: ["#viewer", "#docs"]
estimate: null
depends_on: ["TASK-063-autosave-override-unsanitize"]
blocks: []
related: ["[[TASK-025-retain-local-edit-mode]]"]
---

## Description
Now that logged-in browser editing works, the dormant upstream local-folder/File
System Access mode (kept since TASK-025) is redundant. Remove it outright — delete
the vendored files that implemented it, trim the HTML that's provably unreachable,
and update every doc that pointed at "try it locally" so the project is presented
as web-only.

## Acceptance Criteria
- [x] board/scripts/03-storage.js, 04-io.js, 10-archive.js, 11-generate.js deleted
      with zero functional regression; README/PRD/NOTICE no longer describe a
      local-run path

## Subtasks
- [x] Full cross-file dependency mapping before deleting anything (grep every function defined in the 4 files against every kept file)
- [x] Fix the one real breakage found: 02-i18n.js's setLanguage() called updateProjectSelector() (03-storage.js) unconditionally — dead call removed
- [x] index.html: removed columnsModal (confirmed unreachable) and the local-folder welcome-screen copy; kept archiveModal and several header buttons deliberately inert, since unmodified vendor files reference them with no existence guard
- [x] 20-remote.js: a manifest-load failure is now always a real error, never a silent fallback to a local-folder screen that no longer exists
- [x] Regression-tested locally: board render, card click/detail view, drag/drop, edit — all still correct after removal
- [x] README, PRD (new decision D6), NOTICE, and this story's own TASK-025 predecessor updated to match

## Notes
The dependency mapping caught two real "would have broken in production" issues
before they shipped: an unguarded `getElementById('archiveModal')` inside
09-task-detail.js's showTaskDetail() (called on every card click, by everyone —
removing that element would have crashed the board for all users), and the
setLanguage() dead call above. Both are documented in NOTICE alongside exactly
which files are genuinely unmodified vs. touched.
