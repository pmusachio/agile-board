// Assembles the whole corpus (knowledge graph + every story's frontmatter +
// body) into one bounded text block for the MVP2 assistant's model calls.
// D9: no embeddings/vector search — the corpus (currently well under 100KB
// of raw Markdown) is small enough to just fit in a modern context window,
// so "retrieval" here means "everything", not "the best-matching subset".
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { parseFrontmatter } from './frontmatter.mjs';

// Conservative default budget in *characters*, not tokens — token counting
// needs a model-specific tokenizer we don't carry as a dependency; ~4
// chars/token is a widely-used rough estimate, and erring conservative is
// safe here since underestimating the budget only truncates a bit earlier
// than strictly necessary, never risks overflowing the model's real limit.
export const DEFAULT_CHAR_BUDGET = 800_000; // ~200k tokens — well under Gemini's window

export function loadCorpus(storiesDir) {
  const files = readdirSync(storiesDir)
    .filter((f) => f.endsWith('.md') && !f.startsWith('_'))
    .sort();
  return files.map((file) => {
    const raw = readFileSync(join(storiesDir, file), 'utf8');
    const { data, body } = parseFrontmatter(raw);
    return { file, data, body };
  });
}

function renderStory({ data, body }) {
  const lines = [`### ${data.id}: ${data.title}`];
  lines.push(`status: ${data.status} | priority: ${data.priority} | category: ${data.category ?? ''}`);
  if (data.epic) lines.push(`epic: ${data.epic}`);
  if (data.depends_on?.length) lines.push(`depends_on: ${data.depends_on.join(', ')}`);
  if (data.blocks?.length) lines.push(`blocks: ${data.blocks.join(', ')}`);
  if (data.related?.length) lines.push(`related: ${data.related.join(', ')}`);
  if (data.assignees?.length) lines.push(`assignees: ${data.assignees.join(', ')}`);
  lines.push('', body || '(no body)');
  return lines.join('\n');
}

// Builds the full context string from an already-loaded corpus + graph.
// Pure/synchronous (no disk I/O) so it's trivial to unit-test with a
// synthetic fixture — see TASK-081's oversized-corpus truncation test.
//
// Degrades predictably if over budget (PRD §14.5): drop story BODIES first
// (replace with a placeholder, keep the frontmatter summary line so the
// model still sees status/priority/edges for every story), never touch the
// graph structure itself. This is deliberately simple, not ranked/selective
// — see D9 and TASK-080's notes for why that's the right call at this scale.
export function assembleContext(stories, graph, { charBudget = DEFAULT_CHAR_BUDGET } = {}) {
  const graphBlock = `## Knowledge graph\n\`\`\`json\n${JSON.stringify(graph)}\n\`\`\`\n`;

  const withBodies = graphBlock + '\n## Stories\n\n' + stories.map(renderStory).join('\n\n---\n\n');
  if (withBodies.length <= charBudget) {
    return { context: withBodies, truncated: false };
  }

  const withoutBodies =
    graphBlock +
    '\n## Stories (bodies omitted — corpus exceeds the context budget)\n\n' +
    stories.map((s) => renderStory({ ...s, body: '(body omitted)' })).join('\n\n---\n\n');
  return { context: withoutBodies, truncated: true };
}
