// TASK-120/121: the bounded, schema-aligned action toolset the AI may choose
// from (Gemini function-calling), and the deterministic applier that turns
// one action into a file change. The model NEVER writes file bytes — every
// tool here maps 1:1 to a mutation this module applies via fetch-merge-write
// (overlay only the named field, preserve everything else byte-for-byte —
// the MVP1.5 data-loss lesson encoded as a rule).
import { splitSections, parseChecklist, buildBody } from '../../scripts/lib/sections.mjs';
import { serializeFrontmatter } from '../../scripts/lib/serialize.mjs';

export class ActionError extends Error {}

const STATUS_ENUM = ['todo', 'in-progress', 'in-review', 'done'];
const PRIORITY_ENUM = ['low', 'medium', 'high', 'critical'];
const SETTABLE_FIELDS = ['priority', 'category', 'due', 'assignees', 'estimate'];
const EDGE_FIELDS = ['depends_on', 'blocks', 'related'];

export const ACTION_TOOLS = [
  { name: 'set_status', description: "Move a story to a different board column.",
    parameters: { type: 'object', properties: { id: { type: 'string' }, status: { type: 'string', enum: STATUS_ENUM } }, required: ['id', 'status'] } },
  { name: 'set_field', description: 'Set priority/category/due/assignees/estimate on a story.',
    parameters: { type: 'object', properties: { id: { type: 'string' }, field: { type: 'string', enum: SETTABLE_FIELDS }, value: {} }, required: ['id', 'field', 'value'] } },
  { name: 'add_tag', description: 'Add a #tag to a story.',
    parameters: { type: 'object', properties: { id: { type: 'string' }, tag: { type: 'string' } }, required: ['id', 'tag'] } },
  { name: 'remove_tag', description: 'Remove a #tag from a story.',
    parameters: { type: 'object', properties: { id: { type: 'string' }, tag: { type: 'string' } }, required: ['id', 'tag'] } },
  { name: 'set_description', description: "Replace a story's Description section.",
    parameters: { type: 'object', properties: { id: { type: 'string' }, text: { type: 'string' } }, required: ['id', 'text'] } },
  { name: 'append_note', description: "Append text to a story's Notes section.",
    parameters: { type: 'object', properties: { id: { type: 'string' }, text: { type: 'string' } }, required: ['id', 'text'] } },
  { name: 'add_subtask', description: 'Add a new unchecked Subtask item.',
    parameters: { type: 'object', properties: { id: { type: 'string' }, text: { type: 'string' } }, required: ['id', 'text'] } },
  { name: 'toggle_subtask', description: 'Check/uncheck a Subtask by its index.',
    parameters: { type: 'object', properties: { id: { type: 'string' }, index: { type: 'integer' } }, required: ['id', 'index'] } },
  { name: 'link', description: 'Add a depends_on/blocks/related edge from one story to another.',
    parameters: { type: 'object', properties: { from: { type: 'string' }, to: { type: 'string' }, edge: { type: 'string', enum: EDGE_FIELDS } }, required: ['from', 'to', 'edge'] } },
  { name: 'create_story', description: 'Create a brand-new story.',
    parameters: { type: 'object', properties: {
      type: { type: 'string', enum: ['TASK', 'EPIC'] }, slug: { type: 'string' }, title: { type: 'string' },
      priority: { type: 'string', enum: PRIORITY_ENUM }, category: { type: 'string' }, epic: { type: 'string' },
      description: { type: 'string' },
    }, required: ['type', 'slug', 'title'] } },
  { name: 'split_story', description: 'Narrow an existing story in place and create one or more new sibling stories, cross-linked via related.',
    parameters: { type: 'object', properties: {
      id: { type: 'string' }, keepTitle: { type: 'string' }, keepDescription: { type: 'string' },
      into: { type: 'array', items: { type: 'object', properties: { slug: { type: 'string' }, title: { type: 'string' }, description: { type: 'string' } }, required: ['slug', 'title'] } },
    }, required: ['id', 'into'] } },
];

function normalizeTag(t) {
  return t.startsWith('#') ? t : `#${t}`;
}

function parseStoryBody(body) {
  const sections = splitSections(body);
  return {
    description: sections['description'] || '',
    // Verbatim, never parsed into an array — see buildBody's comment.
    acceptanceCriteriaRaw: sections['acceptance criteria'] || '',
    subtasks: parseChecklist(sections['subtasks']),
    notes: sections['notes'] || '',
  };
}

// Mutates a single already-parsed story ({data, body}) for the field-level
// actions. Returns the new {data, body} — pure, no disk I/O.
function applySingleStoryAction(story, action) {
  const data = { ...story.data };
  const parts = parseStoryBody(story.body);

  switch (action.tool) {
    case 'set_status':
      if (!STATUS_ENUM.includes(action.status)) throw new ActionError(`invalid status: ${action.status}`);
      data.status = action.status;
      break;
    case 'set_field':
      if (!SETTABLE_FIELDS.includes(action.field)) throw new ActionError(`cannot set field via AI action: ${action.field}`);
      if (action.field === 'priority' && !PRIORITY_ENUM.includes(action.value)) {
        throw new ActionError(`invalid priority: ${action.value}`);
      }
      data[action.field] = action.value;
      break;
    case 'add_tag':
      data.tags = [...new Set([...(data.tags || []), normalizeTag(action.tag)])];
      break;
    case 'remove_tag':
      data.tags = (data.tags || []).filter((t) => t !== normalizeTag(action.tag));
      break;
    case 'set_description':
      parts.description = action.text;
      break;
    case 'append_note':
      parts.notes = parts.notes ? `${parts.notes}\n\n${action.text}` : action.text;
      break;
    case 'add_subtask':
      parts.subtasks = [...parts.subtasks, { completed: false, text: action.text }];
      break;
    case 'toggle_subtask':
      if (action.index < 0 || action.index >= parts.subtasks.length) {
        throw new ActionError(`subtask index out of range: ${action.index}`);
      }
      parts.subtasks[action.index] = { ...parts.subtasks[action.index], completed: !parts.subtasks[action.index].completed };
      break;
    case 'link':
      if (!EDGE_FIELDS.includes(action.edge)) throw new ActionError(`invalid edge type: ${action.edge}`);
      {
        const target = action.edge === 'related' ? `[[${action.to}]]` : action.to;
        data[action.edge] = [...new Set([...(data[action.edge] || []), target])];
      }
      break;
    default:
      throw new ActionError(`unknown action tool: ${action.tool}`);
  }

  return { data, body: buildBody(parts) };
}

function nextId(corpus, type) {
  const prefix = `${type}-`;
  const nums = [...corpus.keys()]
    .filter((id) => id.startsWith(prefix))
    .map((id) => parseInt(id.slice(prefix.length), 10))
    .filter((n) => !Number.isNaN(n));
  const next = (nums.length ? Math.max(...nums) : 0) + 1;
  return `${type}-${String(next).padStart(3, '0')}`;
}

function makeNewStory({ type, slug, title, priority, category, epic, description }, corpus, today) {
  const id = `${nextId(corpus, type)}-${slug}`;
  const data = {
    id, title, status: 'todo', priority: priority || 'medium', category: category || '',
    assignees: [], epic: epic || null, created: today, started: null, due: null, finished: null,
    tags: [], estimate: null, depends_on: [], blocks: [], related: [],
  };
  const body = buildBody({ description: description || '', acceptanceCriteriaRaw: '', subtasks: [], notes: '' });
  return { file: `${id}.md`, data, body };
}

// applyAction(corpus, action) -> array of {file, data, body} changes.
// `corpus` is a Map<id, {file, data, body}> of the FULL current corpus (an
// action may need to reference other stories — e.g. link's target, or
// generating the next free id) but this function itself never touches disk;
// callers are responsible for reading/writing the actual files.
export function applyAction(corpus, action, { today = new Date().toISOString().slice(0, 10) } = {}) {
  if (action.tool === 'create_story') {
    const story = makeNewStory(action, corpus, today);
    return [story];
  }

  if (action.tool === 'split_story') {
    const original = corpus.get(action.id);
    if (!original) throw new ActionError(`unknown story id: ${action.id}`);
    const originalParts = parseStoryBody(original.body);
    const newStories = action.into.map((piece) =>
      makeNewStory(
        { type: original.data.id.startsWith('EPIC-') ? 'EPIC' : 'TASK', slug: piece.slug, title: piece.title,
          priority: original.data.priority, category: original.data.category, epic: original.data.epic,
          description: piece.description },
        corpus, today
      )
    );
    // Narrow the original in place and cross-link both directions via `related`.
    const updatedOriginalData = { ...original.data };
    if (action.keepTitle) updatedOriginalData.title = action.keepTitle;
    const newRelated = newStories.map((s) => `[[${s.data.id}]]`);
    updatedOriginalData.related = [...new Set([...(updatedOriginalData.related || []), ...newRelated])];
    const updatedOriginal = {
      file: original.file,
      data: updatedOriginalData,
      body: buildBody({ ...originalParts, description: action.keepDescription ?? originalParts.description }),
    };
    newStories.forEach((s) => {
      s.data.related = [...new Set([...(s.data.related || []), `[[${updatedOriginalData.id}]]`])];
    });
    return [updatedOriginal, ...newStories];
  }

  // All other tools mutate exactly one existing story.
  const story = corpus.get(action.id) || corpus.get(action.from);
  const id = action.id || action.from;
  if (!story) throw new ActionError(`unknown story id: ${id}`);
  if (action.tool === 'link' && !corpus.has(action.to)) {
    throw new ActionError(`link target does not exist: ${action.to}`);
  }
  const updated = applySingleStoryAction(story, action);
  return [{ file: story.file, data: updated.data, body: updated.body }];
}

export function renderStoryFile({ data, body }) {
  return `${serializeFrontmatter(data)}\n\n${body}`;
}

// Applies a whole instruction's action list *sequentially*, folding each
// result back into a working copy of the corpus before the next action runs.
// This matters: two create_story actions in the same instruction must not
// both compute the same "next free id" against a stale snapshot, and a
// later action referencing an earlier one's new story (e.g. link after
// create_story) needs to see it already in the corpus. Returns the
// combined, deduped list of {file, data, body} changes across all actions.
export function applyActions(corpus, actions, opts) {
  const working = new Map(corpus);
  const changesByFile = new Map();
  for (const action of actions) {
    const results = applyAction(working, action, opts);
    for (const change of results) {
      changesByFile.set(change.file, change);
      working.set(change.data.id, change);
    }
  }
  return [...changesByFile.values()];
}
