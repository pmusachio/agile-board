#!/usr/bin/env node
// Scans stories/*.md and writes stories/index.json: the lightweight manifest
// the board viewer fetches to render cards without loading every story body.
// Run manually to preview locally, or by the Gitea post-receive hook on push
// (see infra/).
import { readFileSync, writeFileSync, readdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseFrontmatter } from './lib/frontmatter.mjs';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const storiesDir = join(root, 'stories');

const CARD_FIELDS = [
  'id', 'title', 'status', 'priority', 'category', 'assignees', 'epic',
  'created', 'started', 'due', 'finished', 'tags', 'estimate',
  'depends_on', 'blocks', 'related',
];

function loadStories() {
  const files = readdirSync(storiesDir)
    .filter((f) => f.endsWith('.md') && !f.startsWith('_'))
    .sort();

  const stories = [];
  for (const file of files) {
    const raw = readFileSync(join(storiesDir, file), 'utf8');
    const { data } = parseFrontmatter(raw);
    if (!data.id || !data.title || !data.status || !data.priority) {
      throw new Error(
        `${file}: missing a required field (id/title/status/priority). Run ` +
        `'node scripts/validate-stories.mjs' for details.`
      );
    }
    const card = { file };
    for (const key of CARD_FIELDS) card[key] = data[key] ?? null;
    stories.push(card);
  }
  return stories;
}

function main() {
  const stories = loadStories();
  const manifest = {
    title: 'agile-board',
    generated: new Date().toISOString(),
    stories,
  };
  const outPath = join(storiesDir, 'index.json');
  writeFileSync(outPath, JSON.stringify(manifest, null, 2) + '\n');
  console.log(`Wrote ${outPath} (${stories.length} stories)`);
}

main();
