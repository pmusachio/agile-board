---
id: TASK-063-autosave-override-unsanitize
title: autoSave() override + dirty-diff + un-sanitize guard
status: in-review
priority: high
category: frontend
assignees: ["@paulo"]
epic: EPIC-006-board-write-mode
created: 2026-07-04
started: 2026-07-04
due: null
finished: null
tags: ["#viewer"]
estimate: null
depends_on: ["TASK-062-contents-api-client"]
blocks: []
related: []
---

## Description
Reassign autoSave() (a no-op in remote mode today) to write via the Contents API when logged in, identifying which task(s) actually changed via a snapshot diff rather than re-wrapping every upstream mutator (drag/drop, edit form, subtask CRUD all already call autoSave() for free). Un-sanitize the board/modal DOM for logged-in users via a small guard in 20-remote.js, while keeping story creation and archive/delete out of scope regardless of login.

## Acceptance Criteria
- [ ] dragging a card or submitting the edit form persists exactly the changed story, nothing else; anonymous mode is pixel-for-pixel unchanged

## Subtasks
- [x] Snapshot-based diff (metadata fields vs. body fields tracked separately, so a lazy loadStoryBody() completing is never mistaken for a user edit)
- [x] Same-column reorder (no status change) correctly produces zero writes
- [x] 20-remote.js guard: skip sanitizing drag/edit/subtask-editing when window.__agileBoardWriteMode, but always still strip column-add-btn and archive/delete (out of scope regardless of login)
- [x] Live verification with a real logged-in user

## Notes
The diff design specifically avoids re-wrapping 6+ upstream call sites (drop, form submit, 4 subtask handlers) — one seam (autoSave) plus a structural "was empty, now loaded" check for the lazy-body-load race was enough.

Real bug found via live testing: editing worked but dragging silently didn't persist. Root cause was a race — activateWriteMode() (which installs the real autoSave()) was gated behind refreshAuthUI()'s async username-verification fetch, used only for the button label. A drag-and-drop completes faster than that fetch resolves: the board was already un-sanitized (draggable intact, from the synchronous window.__agileBoardWriteMode flag alone), so the drag looked like it worked, but autoSave() itself hadn't been overridden yet. Editing didn't show the bug because opening the modal and submitting a form is slow enough for the fetch to finish first. Fixed by calling activateWriteMode() synchronously off isLoggedIn() (a plain localStorage check), decoupled entirely from the async fetch.
