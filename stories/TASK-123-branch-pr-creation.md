---
id: TASK-123-branch-pr-creation
title: Branch + PR creation via Gitea API
status: done
priority: high
category: backend
assignees: ["@paulo"]
epic: EPIC-012-ai-write-actions
created: 2026-07-04
started: 2026-07-05
due: null
finished: 2026-07-06
tags: ["#ai", "#backend", "#gitea"]
estimate: null
depends_on: ["TASK-122-pre-pr-validation-gate"]
blocks: ["TASK-124-guardrail-audit", "TASK-102-act-result-ui"]
related: ["[[TASK-062-contents-api-client]]"]
---

## Description
Create a branch, PUT each changed file to it (the same Contents API endpoints 21-write.js already uses), and open a PR whose body records the verbatim instruction plus a bulleted change summary. Authored with the logged-in user's token (D13); no new OAuth scope needed — write:repository already covers branches, contents, and pull requests.

## Acceptance Criteria
- [x] a valid instruction yields a real Gitea PR containing exactly the intended changes; main is untouched until it's merged; merging fires the existing post-receive hook and updates the board (**verified live 2026-07-06 — PR #1**)

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

**Done as of 2026-07-06.** A real instruction through the board's chat panel produced
[PR #1](https://agile-board.duckdns.org/git/paulo/agile-board/pulls/1): 3 files changed,
3 lines total (one `status:` line each), body carrying the verbatim instruction plus a
bulleted summary as designed. `mergeable: true`, `main` untouched pre-merge (confirmed via
the Gitea API before merging). Merged with Paulo's explicit go-ahead; the post-receive hook
picked it up and the live board's `stories/index.json` updated within seconds.

**Real gotcha found during this test, not anticipated in the design:** a Gitea personal
access token scoped only for `git push` (`write:repository`) is not sufficient to call
`/api/propose` — `verifyGiteaToken()`'s `GET /api/v1/user` check requires `read:user`,
which that narrower token lacked (`403`, surfaced as a generic `401` by this service). Not
a bug — same info this session's `docs/RUNBOOK.md` §11.4 now documents — but worth noting
here since it's why the live test had to go through the board's own UI (which requests the
right OAuth2 scopes) rather than a one-off `curl`.
