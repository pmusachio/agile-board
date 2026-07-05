// TASK-122: pre-PR validation gate. Before ANY branch/PR is created for a
// proposed set of file changes, simulate applying them to the full corpus
// and run the exact same schema + referential-integrity checks
// scripts/validate-stories.mjs runs on every commit — reused, not
// reimplemented, so client, CLI, and the AI writer never disagree about
// what "valid" means. An invalid action set is refused here; no PR opens.
import { validateCorpus } from '../../scripts/lib/validate.mjs';

// corpus: Map<id, {file, data, body}> — the full current corpus.
// changes: array of {file, data, body} — the proposed new/updated files
// (from actions.mjs's applyAction/applyActions).
export function validateProposedChanges(corpus, changes, schema) {
  const changesByFile = new Map(changes.map((c) => [c.file, c]));
  const proposedParsed = [];
  const existingFiles = new Set();

  for (const entry of corpus.values()) {
    existingFiles.add(entry.file);
    const override = changesByFile.get(entry.file);
    proposedParsed.push({ file: entry.file, data: override ? override.data : entry.data });
  }
  for (const change of changes) {
    if (!existingFiles.has(change.file)) proposedParsed.push({ file: change.file, data: change.data });
  }

  const perFileErrors = validateCorpus(proposedParsed, schema);
  const changedFiles = new Set(changes.map((c) => c.file));
  const problems = [];
  for (const file of changedFiles) {
    const errors = perFileErrors.get(file) || [];
    if (errors.length) problems.push({ file, errors });
  }
  return { valid: problems.length === 0, problems };
}
