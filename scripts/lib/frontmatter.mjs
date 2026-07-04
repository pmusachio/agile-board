// Minimal parser for the flat YAML-frontmatter subset used by stories/*.md:
// scalars, quoted strings, numbers, null/~, and single-level flow arrays like
// ["a", "b"] or []. It is NOT a general YAML parser (no nesting, no multiline
// block scalars) — that subset is all docs/story.schema.json requires.
export function parseFrontmatter(raw) {
  const match = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/.exec(raw);
  if (!match) return { data: {}, body: raw.trim() };
  const [, fmText, body] = match;
  const data = {};
  for (const line of fmText.split(/\r?\n/)) {
    if (!line.trim() || line.trim().startsWith('#')) continue;
    const m = /^([A-Za-z_][\w-]*):\s*(.*)$/.exec(line);
    if (!m) continue;
    data[m[1]] = parseScalar(m[2]);
  }
  return { data, body: body.trim() };
}

function parseScalar(raw) {
  const v = raw.trim();
  if (v === '' || v === 'null' || v === '~') return null;
  if (v.startsWith('[') && v.endsWith(']')) {
    const inner = v.slice(1, -1).trim();
    // Assumes no commas inside individual elements (fine for ids/handles/tags).
    return inner ? inner.split(',').map((s) => parseScalar(s.trim())) : [];
  }
  if (/^"(.*)"$/.test(v)) return v.slice(1, -1).replace(/\\"/g, '"');
  if (/^'(.*)'$/.test(v)) return v.slice(1, -1).replace(/''/g, "'");
  if (/^-?\d+(\.\d+)?$/.test(v)) return Number(v);
  return v;
}
