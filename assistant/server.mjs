#!/usr/bin/env node
// agile-board assistant backend (MVP2, EPIC-009). Node built-ins only — no
// npm dependencies, matching this project's convention (see scripts/*.mjs).
//
// Endpoints:
//   GET  /health     - liveness check, no auth
//   POST /api/ask    - question in, Gemini answer out (TASK-092)
// (POST /api/propose - the act/write path, added in EPIC-012)
//
// Reads the story corpus from STORIES_DIR (the same directory the
// post-receive hook publishes to and Caddy serves statically — mounted
// read-only into this container), never from its own image copy, so it
// always sees the live board. Code (this file, scripts/lib/*) comes from
// the image; data comes from the shared volume. See docs/PRD.md #14.3.
import { createServer } from 'node:http';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { loadCorpus, assembleContext } from '../scripts/lib/context.mjs';
import { verifyGiteaToken } from './lib/gitea-auth.mjs';
import { checkRateLimit } from './lib/rate-limit.mjs';
import { askGemini } from './lib/gemini.mjs';

const PORT = process.env.PORT || 3100;
const STORIES_DIR = process.env.STORIES_DIR || '/srv/board/stories';
const GITEA_BASE_URL = process.env.GITEA_BASE_URL; // e.g. http://gitea:3000/
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_MODEL = process.env.GEMINI_MODEL; // optional override

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
    // matters when debugging a fresh deploy (see docs/RUNBOOK.md).
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

const server = createServer(async (req, res) => {
  if (req.method === 'GET' && req.url === '/health') {
    return sendJson(res, 200, { ok: true });
  }

  if (req.method === 'POST' && req.url === '/api/ask') {
    const username = await authenticate(req);
    if (!username) return sendJson(res, 401, { error: 'log in with Gitea to use the assistant' });

    const limit = checkRateLimit(username);
    if (!limit.allowed) {
      res.setHeader('Retry-After', Math.ceil(limit.retryAfterMs / 1000));
      return sendJson(res, 429, { error: 'too many requests — try again shortly' });
    }

    return handleAsk(req, res, username);
  }

  return sendJson(res, 404, { error: 'not found' });
});

server.listen(PORT, () => {
  console.log(`agile-board assistant listening on :${PORT} (stories: ${STORIES_DIR})`);
});
