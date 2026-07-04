#!/usr/bin/env node
// Validates every stories/*.md against docs/story.schema.json, plus two
// cross-file checks the schema alone can't express: id/filename agreement,
// id uniqueness, and that every depends_on/blocks/epic/related reference
// points at a story that actually exists. Exits 1 on any failure.
import { readFileSync, readdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseFrontmatter } from './lib/frontmatter.mjs';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const storiesDir = join(root, 'stories');
const schema = JSON.parse(readFileSync(join(root, 'docs', 'story.schema.json'), 'utf8'));

// Small interpreter for the specific subset of JSON Schema used by
// story.schema.json (type/enum/pattern/minLength/minimum/format:date/items/
// required/additionalProperties). Not a general-purpose JSON Schema validator.
function validate(data, node, path = '') {
  const errors = [];
  if (node.type === 'object') {
    if (node.additionalProperties === false) {
      for (const key of Object.keys(data)) {
        if (!(key in node.properties)) errors.push(`${path || '<root>'}: unknown field '${key}'`);
      }
    }
    for (const req of node.required || []) {
      if (data[req] === undefined || data[req] === null) {
        errors.push(`${path || '<root>'}: missing required field '${req}'`);
      }
    }
    for (const [key, propSchema] of Object.entries(node.properties || {})) {
      if (data[key] !== undefined && data[key] !== null) {
        errors.push(...validate(data[key], propSchema, path ? `${path}.${key}` : key));
      }
    }
    return errors;
  }

  const types = Array.isArray(node.type) ? node.type : [node.type];
  const actual = Array.isArray(data) ? 'array' : typeof data;
  if (node.type && !types.includes(actual)) {
    errors.push(`${path}: expected ${types.join('|')}, got ${actual}`);
    return errors;
  }
  if (node.enum && !node.enum.includes(data)) {
    errors.push(`${path}: '${data}' is not one of [${node.enum.join(', ')}]`);
  }
  if (node.pattern && typeof data === 'string' && !new RegExp(node.pattern).test(data)) {
    errors.push(`${path}: '${data}' does not match ${node.pattern}`);
  }
  if (node.format === 'date' && typeof data === 'string' && !/^\d{4}-\d{2}-\d{2}$/.test(data)) {
    errors.push(`${path}: '${data}' is not a YYYY-MM-DD date`);
  }
  if (typeof node.minLength === 'number' && typeof data === 'string' && data.length < node.minLength) {
    errors.push(`${path}: shorter than minLength ${node.minLength}`);
  }
  if (typeof node.minimum === 'number' && typeof data === 'number' && data < node.minimum) {
    errors.push(`${path}: ${data} is below minimum ${node.minimum}`);
  }
  if (node.type === 'array' && Array.isArray(data) && node.items) {
    data.forEach((item, i) => errors.push(...validate(item, node.items, `${path}[${i}]`)));
  }
  return errors;
}

function stripWikiLink(id) {
  const m = /^\[\[(.+)\]\]$/.exec(id);
  return m ? m[1] : id;
}

function main() {
  const files = readdirSync(storiesDir).filter((f) => f.endsWith('.md') && !f.startsWith('_')).sort();
  const seenIds = new Map(); // id -> file
  const perFileErrors = new Map(); // file -> string[]
  const parsed = []; // {file, data}

  for (const file of files) {
    const raw = readFileSync(join(storiesDir, file), 'utf8');
    const { data } = parseFrontmatter(raw);
    const errors = validate(data, schema);

    if (data.id) {
      if (!(file === `${data.id}.md` || file.startsWith(`${data.id}-`))) {
        errors.push(`filename does not match id: expected '${data.id}.md' or '${data.id}-<slug>.md'`);
      }
      if (seenIds.has(data.id)) {
        errors.push(`duplicate id '${data.id}' (also used by ${seenIds.get(data.id)})`);
      } else {
        seenIds.set(data.id, file);
      }
    }
    perFileErrors.set(file, errors);
    parsed.push({ file, data });
  }

  // Referential integrity: depends_on/blocks/epic/related must point at known ids.
  for (const { file, data } of parsed) {
    const refs = [
      ...(data.depends_on || []),
      ...(data.blocks || []),
      ...(data.related || []).map(stripWikiLink),
      ...(data.epic ? [data.epic] : []),
    ];
    for (const ref of refs) {
      if (!seenIds.has(ref)) {
        perFileErrors.get(file).push(`references unknown story/epic id '${ref}'`);
      }
    }
  }

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
