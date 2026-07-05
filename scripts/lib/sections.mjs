// Body-section helpers shared by the AI write-actions applier (assistant/lib/
// actions.mjs) and mirroring board/scripts/21-write.js's client-side logic
// exactly, so client and server writers never disagree about the same
// Markdown shape. See docs/PRD.md #14.4.

// Split a story body into its "## Heading" sections, keyed by lowercased text.
export function splitSections(body) {
  const sections = {};
  let current = null;
  for (const line of body.split(/\r?\n/)) {
    const h = /^##\s+(.+?)\s*$/.exec(line);
    if (h) {
      current = h[1].trim().toLowerCase();
      sections[current] = [];
    } else if (current) {
      sections[current].push(line);
    }
  }
  Object.keys(sections).forEach((k) => (sections[k] = sections[k].join('\n').trim()));
  return sections;
}

// "- [ ] text" / "- [x] text" -> {completed, text}[]
export function parseChecklist(text) {
  if (!text) return [];
  return [...text.matchAll(/^-\s*\[( |x|X)\]\s*(.+)$/gm)].map((m) => ({
    completed: m[1].toLowerCase() === 'x',
    text: m[2].trim(),
  }));
}

// One line per item — pushing nothing when empty (vs. one empty-string line)
// keeps exactly one blank line before the next heading, matching every
// existing seed file's spacing.
export function pushChecklist(lines, items) {
  (items || []).forEach((it) => lines.push(`- [${it.completed ? 'x' : ' '}] ${it.text}`));
}

// Rebuilds a story body from its section pieces. Description/Notes are
// singular strings, always pushed even when empty. Acceptance Criteria is
// carried through VERBATIM as raw text, never reconstructed from a parsed
// checklist array — no AI action tool touches AC (see assistant/lib/
// actions.mjs's toolset), and parseChecklist's regex only captures a
// checklist item's first line, so round-tripping a multi-line-wrapped AC
// item through parse->rebuild would silently truncate it (a real bug this
// caught: see TASK-065's own Acceptance Criteria, which wraps across three
// lines). Subtasks IS array-derived, since add_subtask/toggle_subtask are
// real action tools that need to mutate it.
export function buildBody({ description, acceptanceCriteriaRaw, subtasks, notes }) {
  const lines = ['## Description', description || '', '', '## Acceptance Criteria'];
  if (acceptanceCriteriaRaw) lines.push(acceptanceCriteriaRaw);
  lines.push('', '## Subtasks');
  pushChecklist(lines, subtasks);
  lines.push('', '## Notes', notes || '', '');
  return lines.join('\n');
}
