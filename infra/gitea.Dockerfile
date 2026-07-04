# Gitea's official image is Alpine-based with no Node.js — the post-receive
# publish hook (hooks/post-receive) needs `node` on PATH to rebuild
# stories/index.json after checking out a push. See docs/RUNBOOK.md.
FROM gitea/gitea:1.22
RUN apk add --no-cache nodejs
