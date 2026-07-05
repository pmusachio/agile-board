#!/usr/bin/env node
// Scans stories/*.md and writes stories/graph.json: nodes + edges derived from
// depends_on/blocks/epic/related plus [[wiki-links]] found inside story bodies
// (not just the frontmatter related array — see docs/PRD.md #14.5/#15).
// depends_on/blocks/epic are also stored reversed, so "what's blocked on X" or
// "what are this epic's children" is a direct lookup, not an O(n) scan.
// Run manually to preview locally, or by the Gitea post-receive hook on push.
import { readFileSync, writeFileSync, readdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseFrontmatter } from './lib/frontmatter.mjs';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const storiesDir = join(root, 'stories');

// Matches a real double-bracket wiki-link anywhere in a story's Markdown
// body, e.g. "[[TASK-092-gemini-call]]" or "[[EPIC-007-knowledge-graph-builder]]".
const WIKI_LINK_RE = /\[\[((?:TASK|EPIC)-[A-Za-z0-9_-]+)\]\]/g;

function stripWikiLink(id) {
  const m = /^\[\[(.+)\]\]$/.exec(id);
  return m ? m[1] : id;
}

function loadStories() {
  const files = readdirSync(storiesDir)
    .filter((f) => f.endsWith('.md') && !f.startsWith('_'))
    .sort();
  return files.map((file) => {
    const raw = readFileSync(join(storiesDir, file), 'utf8');
    const { data, body } = parseFrontmatter(raw);
    return { file, data, body };
  });
}

function bodyWikiLinks(body) {
  return [...body.matchAll(WIKI_LINK_RE)].map((m) => m[1]);
}

function main() {
  const stories = loadStories();
  const ids = new Set(stories.map((s) => s.data.id).filter(Boolean));

  const nodes = {};
  const dependsOn = {}, dependedOnBy = {};
  const blocks = {}, blockedBy = {};
  const epicOf = {}, epicChildren = {};
  const related = {};

  const addReverse = (map, from, to) => {
    if (!map[to]) map[to] = [];
    if (!map[to].includes(from)) map[to].push(from);
  };

  for (const { data, body } of stories) {
    const id = data.id;
    if (!id) continue;
    nodes[id] = {
      id,
      title: data.title ?? null,
      status: data.status ?? null,
      type: id.startsWith('EPIC-') ? 'EPIC' : 'TASK',
    };

    const deps = (data.depends_on || []).filter((r) => ids.has(r));
    if (deps.length) dependsOn[id] = deps;
    deps.forEach((r) => addReverse(dependedOnBy, id, r));

    const blks = (data.blocks || []).filter((r) => ids.has(r));
    if (blks.length) blocks[id] = blks;
    blks.forEach((r) => addReverse(blockedBy, id, r));

    if (data.epic && ids.has(data.epic)) {
      epicOf[id] = data.epic;
      addReverse(epicChildren, id, data.epic);
    }

    // Related edges come from BOTH the frontmatter `related` wiki-links and
    // any [[wiki-link]] found inside the body text — the PRD always
    // described wiki-links as graph edges (§6); MVP1 only ever parsed the
    // frontmatter array. Deduped, and self-references are dropped.
    const fromFrontmatter = (data.related || []).map(stripWikiLink);
    const fromBody = bodyWikiLinks(body);
    const allRelated = [...new Set([...fromFrontmatter, ...fromBody])].filter(
      (r) => ids.has(r) && r !== id
    );
    if (allRelated.length) related[id] = allRelated;
  }

  const graph = {
    generated: new Date().toISOString(),
    nodes,
    edges: {
      depends_on: dependsOn,
      depended_on_by: dependedOnBy,
      blocks,
      blocked_by: blockedBy,
      epic: epicOf,
      epic_children: epicChildren,
      related,
    },
  };

  const outPath = join(storiesDir, 'graph.json');
  writeFileSync(outPath, JSON.stringify(graph, null, 2) + '\n');
  console.log(`Wrote ${outPath} (${Object.keys(nodes).length} nodes)`);
}

main();
