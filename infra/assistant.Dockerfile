# The MVP2 assistant backend: Node built-ins only, no npm dependencies (see
# assistant/server.mjs and scripts/lib/*.mjs) — a plain node:alpine image
# with the repo's code copied in is all this needs.
FROM node:20-alpine
WORKDIR /app
COPY scripts/lib ./scripts/lib
COPY assistant ./assistant
EXPOSE 3100
CMD ["node", "assistant/server.mjs"]
