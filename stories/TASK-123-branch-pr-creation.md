---
id: TASK-123-branch-pr-creation
title: Branch + PR creation via Gitea API
status: in-progress
priority: high
category: backend
assignees: ["@paulo"]
epic: EPIC-012-ai-write-actions
created: 2026-07-04
started: 2026-07-05
due: null
finished: null
tags: ["#ai", "#backend", "#gitea"]
estimate: null
depends_on: ["TASK-122-pre-pr-validation-gate"]
blocks: ["TASK-124-guardrail-audit", "TASK-102-act-result-ui"]
related: ["[[TASK-062-contents-api-client]]"]
---

## Description
Create a branch, PUT each changed file to it (the same Contents API endpoints 21-write.js already uses), and open a PR whose body records the verbatim instruction plus a bulleted change summary. Authored with the logged-in user's token (D13); no new OAuth scope needed — write:repository already covers branches, contents, and pull requests.

## Acceptance Criteria
- [ ] a valid instruction yields a real Gitea PR containing exactly the intended changes; main is untouched until it's merged; merging fires the existing post-receive hook and updates the board (**code written, request shapes verified — not yet exercised against the real repo, see notes**)

## Subtasks

## Notes
Merging is the only route to main — see TASK-124.

**Status as of 2026-07-05:** implemented as assistant/lib/gitea-pr.mjs (createProposalPR).
Before writing it, confirmed the exact Gitea API field names against the live instance's own
swagger.v1.json rather than assuming: `POST .../branches` takes `{new_branch_name,
old_ref_name}` (not the deprecated `old_branch_name`); the Contents API uses POST to create
a file and PUT (with `sha`) to update one; `POST .../pulls` takes `{head, base, title,
body}`. Verified the request construction with a mocked fetch: correct branch-creation
body, an existing file correctly detected (GET) and PUT with its sha, a new file correctly
POSTed without one, and the PR body carries the original instruction.

**Not yet done: an actual branch+PR against the real repo.** That requires either the live
backend deployment (TASK-090, paused for approval) or a deliberate one-off test call — held
back rather than run speculatively against the live repository. Once TASK-090 is deployed
and a Gemini key exists, this becomes the natural first live end-to-end test.
