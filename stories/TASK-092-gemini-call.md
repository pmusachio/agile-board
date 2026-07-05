---
id: TASK-092-gemini-call
title: Gemini call
status: todo
priority: high
category: backend
assignees: ["@paulo"]
epic: EPIC-009-assistant-backend
created: 2026-07-04
started: null
due: null
finished: null
tags: ["#ai", "#backend"]
estimate: null
depends_on: ["TASK-091-gitea-token-auth-guard", "TASK-080-whole-corpus-context-assembler"]
blocks: ["TASK-093-basic-abuse-guard", "TASK-100-chat-panel", "TASK-120-action-toolset"]
related: []
---

## Description
Wire the assembled context (EPIC-008) plus the user's question into a Gemini API call using a server-side-only API key (env var, never committed — same discipline as the Gitea admin/mirror secrets, PRD #8); return the answer. This is the *ask* (read-only) path; the same Gemini client is reused by the *act* path (EPIC-012, function-calling), which is why the act toolset depends on this task.

## Acceptance Criteria
- [ ] a real question against the live corpus returns a real, relevant answer

## Subtasks

## Notes
