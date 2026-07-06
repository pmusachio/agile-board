# Gitea's official image is Alpine-based with no Node.js — the post-receive
# publish hook (hooks/post-receive) needs `node` on PATH to rebuild
# stories/index.json after checking out a push, and (EPIC-013) `npm`/`npx`
# to build the wiki (Quartz requires Node >=22; this Alpine base's own
# `nodejs` apk package is 20.x with no npm at all). Copying the official
# node:22-alpine image's binaries in is more reliable than chasing whichever
# nodejs-current apk happens to be current for this Alpine release.
FROM node:22-alpine AS node
FROM gitea/gitea:1.22
COPY --from=node /usr/local/bin/node /usr/local/bin/
COPY --from=node /usr/local/bin/npm /usr/local/bin/
COPY --from=node /usr/local/bin/npx /usr/local/bin/
COPY --from=node /usr/local/lib/node_modules /usr/local/lib/node_modules
