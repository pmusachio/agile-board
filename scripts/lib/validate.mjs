// Shared validation core, used by both scripts/validate-stories.mjs (the CLI
// check) and assistant/lib/validate-tree.mjs (TASK-122's pre-PR gate) — one
// definition of "valid" for the whole project, not two that could drift.

// Small interpreter for the specific subset of JSON Schema used by
// docs/story.schema.json (type/enum/pattern/minLength/minimum/format:date/
// items/required/additionalProperties). Not a general-purpose validator.
export function validate(data, node, path = '') {
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

export function stripWikiLink(id) {
  const m = /^\[\[(.+)\]\]$/.exec(id);
  return m ? m[1] : id;
}

// Validates a full set of {file, data} entries: schema conformance per file,
// plus id/filename agreement, id uniqueness, and referential integrity
// (depends_on/blocks/related/epic must point at ids that exist IN THIS SET).
// Returns a Map<file, string[]> — empty array means that file is valid.
export function validateCorpus(parsed, schema) {
  const seenIds = new Map(); // id -> file
  const perFileErrors = new Map();

  for (const { file, data } of parsed) {
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
  }

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

  return perFileErrors;
}
