# Gitea's official image is Alpine-based with no Node.js — the post-receive
# publish hook (hooks/post-receive) needs `node` on PATH to rebuild
# stories/index.json after checking out a push, and (EPIC-013) `npm`/`npx`
# to build the wiki (Quartz requires Node >=22; this Alpine base's own
# `nodejs` apk package is 20.x with no npm at all). Copying the official
# node:22-alpine image's binaries in is more reliable than chasing whichever
# nodejs-current apk happens to be current for this Alpine release.
FROM node:22-alpine AS node
FROM gitea/gitea:1.22
# node:22-alpine's binary is musl-built but still dynamically links libstdc++/
# libgcc -- gitea's own Alpine base doesn't have those installed by default.
RUN apk add --no-cache libstdc++ libgcc
COPY --from=node /usr/local/bin/node /usr/local/bin/
COPY --from=node /usr/local/lib/node_modules /usr/local/lib/node_modules
# npm/npx are symlinks to npm-cli.js/npx-cli.js (relative paths, resolved
# from wherever the symlink itself lives) -- COPYing them directly
# dereferences the symlink and drops in npm-cli.js's own tiny loader stub
# at the wrong path, breaking its `require('../lib/cli.js')`. Recreate the
# symlinks instead of copying the files.
RUN ln -s ../lib/node_modules/npm/bin/npm-cli.js /usr/local/bin/npm && \
    ln -s ../lib/node_modules/npm/bin/npx-cli.js /usr/local/bin/npx
