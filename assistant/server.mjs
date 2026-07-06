#!/usr/bin/env node
// agile-board assistant backend (MVP2, EPIC-009). Node built-ins only — no
// npm dependencies, matching this project's convention (see scripts/*.mjs).
//
// Endpoints:
//   GET  /api/health  - liveness check, no auth
//   POST /api/ask     - question in, Gemini answer out (TASK-092)
//   POST /api/propose - instruction in, a Gitea PR out (EPIC-012). Never
//                        writes to main directly — see TASK-124.
//
// Reads the story corpus from STORIES_DIR (the same directory the
// post-receive hook publishes to and Caddy serves statically — mounted
// read-only into this container), never from its own image copy, so it
// always sees the live board. Code (this file, scripts/lib/*) comes from
// the image; data comes from the shared volume.
import { createServer } from 'node:http';
import { randomBytes } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { loadCorpus, assembleContext } from '../scripts/lib/context.mjs';
import { verifyGiteaToken } from './lib/gitea-auth.mjs';
import { checkRateLimit } from './lib/rate-limit.mjs';
import { askGemini, proposeActions } from './lib/gemini.mjs';
import { ACTION_TOOLS, ActionError, applyActions } from './lib/actions.mjs';
import { validateProposedChanges } from './lib/validate-tree.mjs';
import { createProposalPR } from './lib/gitea-pr.mjs';

const PORT = process.env.PORT || 3100;
const STORIES_DIR = process.env.STORIES_DIR || '/srv/board/stories';
const GITEA_BASE_URL = process.env.GITEA_BASE_URL; // e.g. http://gitea:3000/
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
// Optional override. Compose's `${GEMINI_MODEL:-}` sets this to an empty
// string, not "unset", when infra/.env doesn't define it — `|| undefined`
// here keeps that from ever reaching gemini.mjs as a falsy-but-defined
// value (it defends against the same thing independently, but a bug
// this real is worth two layers).
const GEMINI_MODEL = process.env.GEMINI_MODEL || undefined;
const REPO_OWNER = process.env.REPO_OWNER || 'paulo';
const REPO_NAME = process.env.REPO_NAME || 'agile-board';
const SCHEMA_PATH = process.env.SCHEMA_PATH || '/srv/board/docs/story.schema.json';

function readJsonBody(req, maxBytes = 64 * 1024) {
  return new Promise((resolve, reject) => {
    let size = 0;
    const chunks = [];
    req.on('data', (chunk) => {
      size += chunk.length;
      if (size > maxBytes) {
        reject(new Error('request body too large'));
        req.destroy();
        return;
      }
      chunks.push(chunk);
    });
    req.on('end', () => {
      try {
        resolve(chunks.length ? JSON.parse(Buffer.concat(chunks).toString('utf8')) : {});
      } catch {
        reject(new Error('invalid JSON body'));
      }
    });
    req.on('error', reject);
  });
}

function sendJson(res, status, body) {
  const payload = JSON.stringify(body);
  res.writeHead(status, { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(payload) });
  res.end(payload);
}

function extractToken(req) {
  const header = req.headers['authorization'] || '';
  const m = /^token\s+(.+)$/i.exec(header);
  return m ? m[1] : null;
}

async function authenticate(req) {
  const token = extractToken(req);
  const username = await verifyGiteaToken(GITEA_BASE_URL, token);
  return username; // null if missing/invalid
}

function loadGraph() {
  const raw = readFileSync(join(STORIES_DIR, 'graph.json'), 'utf8');
  return JSON.parse(raw);
}

function loadSchema() {
  return JSON.parse(readFileSync(SCHEMA_PATH, 'utf8'));
}

function corpusAsMap(stories) {
  return new Map(stories.map((s) => [s.data.id, s]));
}

async function handleAsk(req, res, username) {
  let body;
  try {
    body = await readJsonBody(req);
  } catch (err) {
    return sendJson(res, 400, { error: err.message });
  }
  const question = typeof body.question === 'string' ? body.question.trim() : '';
  if (!question) return sendJson(res, 400, { error: 'missing "question" field' });

  if (!GEMINI_API_KEY) {
    // Never present the missing-key state as a generic 500 — this is an
    // operator configuration gap, not a runtime bug, and the distinction
    // matters when debugging a fresh deploy.
    return sendJson(res, 503, { error: 'assistant not configured (missing GEMINI_API_KEY)' });
  }

  let context;
  try {
    const graph = loadGraph();
    const stories = loadCorpus(STORIES_DIR);
    context = assembleContext(stories, graph).context;
  } catch (err) {
    console.error('agile-board assistant: failed to load corpus/graph', err.message);
    return sendJson(res, 500, { error: 'could not load the board corpus' });
  }

  try {
    const answer = await askGemini({
      apiKey: GEMINI_API_KEY,
      model: GEMINI_MODEL,
      systemContext:
        'You are an assistant for a git-native agile board. Answer questions about the ' +
        'stories, their status, and their relationships (depends_on/blocks/related/epic) ' +
        'using ONLY the knowledge graph and story content provided below. If the answer ' +
        "isn't in the provided data, say so — do not guess.\n\n" + context,
      question,
    });
    return sendJson(res, 200, { answer, askedBy: username });
  } catch (err) {
    console.error('agile-board assistant: Gemini call failed', err.message);
    return sendJson(res, 502, { error: 'the assistant could not get an answer right now' });
  }
}

// TASK-092/123: the act path. Only ever reaches Gitea by creating a branch
// and opening a PR (gitea-pr.mjs) — there is no code path in this file, or
// anywhere in assistant/lib/, that writes to `main`. See TASK-124.
async function handlePropose(req, res, username) {
  let body;
  try {
    body = await readJsonBody(req);
  } catch (err) {
    return sendJson(res, 400, { error: err.message });
  }
  const instruction = typeof body.instruction === 'string' ? body.instruction.trim() : '';
  if (!instruction) return sendJson(res, 400, { error: 'missing "instruction" field' });

  if (!GEMINI_API_KEY) {
    return sendJson(res, 503, { error: 'assistant not configured (missing GEMINI_API_KEY)' });
  }

  let corpus, context, schema;
  try {
    const graph = loadGraph();
    const stories = loadCorpus(STORIES_DIR);
    corpus = corpusAsMap(stories);
    context = assembleContext(stories, graph).context;
    schema = loadSchema();
  } catch (err) {
    console.error('agile-board assistant: failed to load corpus/graph/schema', err.message);
    return sendJson(res, 500, { error: 'could not load the board corpus' });
  }

  let actions;
  try {
    actions = await proposeActions({
      apiKey: GEMINI_API_KEY,
      model: GEMINI_MODEL,
      systemContext:
        'You manage a git-native agile board by calling the provided tools. Given an ' +
        'instruction, call one or more tools to express the intended change — never ' +
        'describe the change in prose, always use a tool call. Use the knowledge graph ' +
        "and story content below to find the right story ids. If the instruction doesn't " +
        'correspond to any available tool, call no tools.\n\n' + context,
      instruction,
      tools: ACTION_TOOLS,
    });
  } catch (err) {
    console.error('agile-board assistant: Gemini call failed', err.message);
    return sendJson(res, 502, { error: 'the assistant could not process that instruction right now' });
  }

  if (actions.length === 0) {
    return sendJson(res, 422, { error: "couldn't map that instruction to any available action" });
  }

  let changes;
  try {
    changes = applyActions(corpus, actions);
  } catch (err) {
    if (err instanceof ActionError) {
      return sendJson(res, 422, { error: `invalid instruction: ${err.message}` });
    }
    console.error('agile-board assistant: applying actions failed', err.message);
    return sendJson(res, 500, { error: 'could not apply the proposed change' });
  }

  const { valid, problems } = validateProposedChanges(corpus, changes, schema);
  if (!valid) {
    // Refused before any PR is opened — see TASK-122.
    return sendJson(res, 422, { error: 'proposed change would be invalid', problems });
  }

  try {
    const branchName = `assistant/${Date.now()}-${randomBytes(3).toString('hex')}`;
    const pr = await createProposalPR({
      giteaBaseUrl: GITEA_BASE_URL,
      token: extractToken(req),
      owner: REPO_OWNER, repo: REPO_NAME, branchName, changes, instruction,
    });
    return sendJson(res, 200, {
      prUrl: pr.url,
      summary: changes.map((c) => c.data.id),
      proposedBy: username,
    });
  } catch (err) {
    console.error('agile-board assistant: PR creation failed', err.message);
    return sendJson(res, 502, { error: 'validated the change but could not open the PR' });
  }
}

const server = createServer(async (req, res) => {
  if (req.method === 'GET' && req.url === '/api/health') {
    return sendJson(res, 200, { ok: true });
  }

  if (req.method === 'POST' && (req.url === '/api/ask' || req.url === '/api/propose')) {
    const username = await authenticate(req);
    if (!username) return sendJson(res, 401, { error: 'log in with Gitea to use the assistant' });

    const limit = checkRateLimit(username);
    if (!limit.allowed) {
      res.setHeader('Retry-After', Math.ceil(limit.retryAfterMs / 1000));
      return sendJson(res, 429, { error: 'too many requests — try again shortly' });
    }

    return req.url === '/api/ask' ? handleAsk(req, res, username) : handlePropose(req, res, username);
  }

  return sendJson(res, 404, { error: 'not found' });
});

server.listen(PORT, () => {
  console.log(`agile-board assistant listening on :${PORT} (stories: ${STORIES_DIR})`);
});
