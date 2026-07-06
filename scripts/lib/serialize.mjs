// Serializes a story's frontmatter data object back into the file's YAML
// block, ported from board/scripts/21-write.js's client-side serializer —
// same rules, now needed server-side for the MVP2 AI write path (EPIC-012).
// Must round-trip with scripts/lib/frontmatter.mjs's parser.
export const FRONTMATTER_KEY_ORDER = [
  'id', 'title', 'status', 'priority', 'category', 'assignees', 'epic',
  'created', 'started', 'due', 'finished', 'tags', 'estimate',
  'depends_on', 'blocks', 'related',
];
const QUOTABLE_STRING_FIELDS = ['title', 'category'];

// Quoting is required for an empty string (bare `key:` parses back as null,
// not ''), and anything parseScalar would otherwise misinterpret. Matching
// every existing seed file's convention avoids a no-op save producing a
// spurious quoting-only diff on fields an action never touched.
function needsQuoting(v) {
  if (v === '') return true;
  if (v === 'null' || v === '~') return true;
  if (/^\[.*\]$/.test(v)) return true;
  if (/^-?\d+(\.\d+)?$/.test(v)) return true;
  // A `: ` inside the value (e.g. a title like "Compose stack: Gitea + Caddy")
  // parses fine under this project's own lenient parser (splits on the first
  // colon only), but is invalid under a strict YAML parser -- caught when
  // wiki/ (Quartz, real js-yaml) choked on exactly this in TASK-033.
  if (v.includes(': ')) return true;
  return false;
}

function serializeScalar(value) {
  if (value === null || value === undefined) return 'null';
  if (Array.isArray(value)) {
    return `[${value.map((v) => (typeof v === 'string' ? `"${v.replace(/"/g, '\\"')}"` : serializeScalar(v))).join(', ')}]`;
  }
  if (typeof value === 'number') return String(value);
  return String(value);
}

export function serializeFrontmatter(data) {
  const lines = ['---'];
  for (const key of FRONTMATTER_KEY_ORDER) {
    if (!(key in data)) continue;
    const value = data[key];
    const isQuoted = QUOTABLE_STRING_FIELDS.includes(key) && typeof value === 'string' && needsQuoting(value);
    const rendered = isQuoted ? `"${value.replace(/"/g, '\\"')}"` : serializeScalar(value);
    lines.push(`${key}: ${rendered}`);
  }
  lines.push('---');
  return lines.join('\n');
}
