#!/usr/bin/env node
// CLI wrapper around scripts/lib/validate.mjs's validateCorpus() — the same
// schema + referential-integrity checks used by the MVP2 AI write path's
// pre-PR gate (assistant/lib/validate-tree.mjs, TASK-122), so there's one
// definition of "valid" for the whole project. Exits 1 on any failure.
import { readFileSync, readdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseFrontmatter } from './lib/frontmatter.mjs';
import { validateCorpus } from './lib/validate.mjs';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const storiesDir = join(root, 'stories');
const schema = JSON.parse(readFileSync(join(root, 'docs', 'story.schema.json'), 'utf8'));

function main() {
  const files = readdirSync(storiesDir).filter((f) => f.endsWith('.md') && !f.startsWith('_')).sort();
  const parsed = files.map((file) => {
    const raw = readFileSync(join(storiesDir, file), 'utf8');
    const { data } = parseFrontmatter(raw);
    return { file, data };
  });

  const perFileErrors = validateCorpus(parsed, schema);

  let failed = 0;
  for (const file of files) {
    const errors = perFileErrors.get(file);
    if (errors.length) {
      failed++;
      console.error(`✗ ${file}`);
      errors.forEach((e) => console.error(`    ${e}`));
    }
  }

  if (failed) {
    console.error(`\n${failed}/${files.length} stories failed validation.`);
    process.exit(1);
  }
  console.log(`✓ ${files.length} stories valid.`);
}

main();
