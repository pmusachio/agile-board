---
id: TASK-124-guardrail-audit
title: Guardrail + audit review
status: done
priority: medium
category: backend
assignees: ["@paulo"]
epic: EPIC-012-ai-write-actions
created: 2026-07-04
started: 2026-07-05
due: null
finished: 2026-07-05
tags: ["#ai", "#backend"]
estimate: null
depends_on: ["TASK-123-branch-pr-creation"]
blocks: []
related: []
---

## Description
Confirm the backend has no code path that writes to main (only branch + PR); confirm the PR body's audit trail records the original instruction; note the prompt-injection posture (bounded actions + human merge — PRD #14.6).

## Acceptance Criteria
- [x] a code-path audit shows the only route to main is a human merge

## Subtasks

## Notes
Audited: grepped every HTTP write (POST/PUT) across assistant/lib/*.mjs and assistant/server.mjs. All writes live in gitea-pr.mjs, and every one targets the freshly-created `branchName` — never `baseBranch`/main. There is no merge-API call anywhere in the codebase. The PR body (createProposalPR in gitea-pr.mjs) records the verbatim instruction plus a bulleted per-story change summary. Prompt-injection posture per PRD #14.6: the model can only emit bounded ACTION_TOOLS calls (TASK-120), every one is schema-validated before any PR exists (TASK-122), and the worst case is a nonsense PR a human closes — never a silent or destructive write.
