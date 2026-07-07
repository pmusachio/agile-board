#!/usr/bin/env node
// Generates wiki/content/*.md from stories/*.md for the Quartz build (EPIC-013).
// Same frontmatter (re-serialized through the same serializer the rest of the
// project uses, so quoting rules stay identical), but with an "At a glance"
// section injected at the top of the body rendering status/priority/
// assignees and the depends_on/blocks/related/epic graph edges as real
// [[wikilinks]]. Those edges live only in frontmatter today; Quartz's
// wikilink/backlink resolution only looks at body text, so without this
// step every edge would be invisible to the wiki -- no clickable links, no
// backlinks, no graph. Run by the Gitea post-receive hook on every push,
// right before `npx quartz build -d <outDir>` (see infra/hooks/post-receive).
//
// Writes outside the repo entirely (a tmpdir, not wiki/content/): Quartz's
// own file discovery respects .gitignore (globby's `gitignore: true`,
// hardcoded in quartz/util/glob.ts), so a generated-and-gitignored
// wiki/content/ would make Quartz's build see its own input as "ignored"
// and silently process zero files -- caught by testing this locally before
// ever touching the VM.
import { readFileSync, writeFileSync, readdirSync, rmSync, mkdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { tmpdir } from 'node:os';
import { parseFrontmatter } from './lib/frontmatter.mjs';
import { serializeFrontmatter } from './lib/serialize.mjs';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const storiesDir = join(root, 'stories');
const outDir = process.env.WIKI_CONTENT_DIR || join(tmpdir(), 'agile-board-wiki-content');

function renderAtAGlance(data) {
  const lines = [`- **Status:** ${data.status}`, `- **Priority:** ${data.priority}`];
  if (data.category) lines.push(`- **Category:** ${data.category}`);
  if (data.assignees?.length) lines.push(`- **Assignees:** ${data.assignees.join(', ')}`);
  if (data.due) lines.push(`- **Due:** ${data.due}`);
  if (data.epic) lines.push(`- **Epic:** [[${data.epic}]]`);
  if (data.depends_on?.length) {
    lines.push(`- **Depends on:** ${data.depends_on.map((id) => `[[${id}]]`).join(', ')}`);
  }
  if (data.blocks?.length) {
    lines.push(`- **Blocks:** ${data.blocks.map((id) => `[[${id}]]`).join(', ')}`);
  }
  if (data.related?.length) {
    // Already stored as "[[id]]" strings -- see docs/story.schema.json.
    lines.push(`- **Related:** ${data.related.join(', ')}`);
  }
  return lines.join('\n');
}

function renderIndex(epics) {
  const list = epics
    .sort((a, b) => a.id.localeCompare(b.id))
    .map((e) => `- [[${e.id}]] — ${e.title}`)
    .join('\n');
  return (
    '---\ntitle: DUX Company — Board Knowledge\n---\n\n' +
    'A browsable view over the same Markdown [the board](/board/) itself reads — ' +
    'every story and its relationships, one click away. Use search or the graph to ' +
    'the right to explore; the epics below are a starting point.\n\n' +
    '## Epics\n' +
    list +
    '\n'
  );
}

function main() {
  rmSync(outDir, { recursive: true, force: true });
  mkdirSync(outDir, { recursive: true });

  const files = readdirSync(storiesDir).filter((f) => f.endsWith('.md') && !f.startsWith('_'));
  const epics = [];
  for (const file of files) {
    const raw = readFileSync(join(storiesDir, file), 'utf8');
    const { data, body } = parseFrontmatter(raw);
    if (data.id?.startsWith('EPIC-')) epics.push({ id: data.id, title: data.title });
    const content =
      serializeFrontmatter(data) +
      '\n\n' +
      '## At a glance\n' +
      renderAtAGlance(data) +
      '\n\n' +
      body +
      '\n';
    writeFileSync(join(outDir, file), content);
  }
  writeFileSync(join(outDir, 'index.md'), renderIndex(epics));
  console.log(`Wrote ${files.length} wiki pages + index.md to ${outDir}`);
}

main();
