// TASK-123: creates a branch, writes the proposed file changes to it via
// Gitea's Contents API (same endpoints board/scripts/21-write.js already
// uses for direct commits), and opens a PR — never touches `main` directly.
// Authored with the asking user's own token (D13); no new OAuth scope
// needed (write:repository already covers branches/contents/pulls).
import { renderStoryFile } from './actions.mjs';

function utf8ToBase64(str) {
  return Buffer.from(str, 'utf8').toString('base64');
}

async function giteaApi(giteaBaseUrl, token, path, opts = {}) {
  const url = new URL(`api/v1/${path}`, giteaBaseUrl);
  const res = await fetch(url, {
    ...opts,
    headers: { Authorization: `token ${token}`, 'Content-Type': 'application/json', ...(opts.headers || {}) },
  });
  return res;
}

export async function createProposalPR({
  giteaBaseUrl, token, owner, repo, baseBranch = 'main', branchName, changes, instruction,
}) {
  const branchRes = await giteaApi(giteaBaseUrl, token, `repos/${owner}/${repo}/branches`, {
    method: 'POST',
    body: JSON.stringify({ new_branch_name: branchName, old_ref_name: baseBranch }),
  });
  if (!branchRes.ok) {
    throw new Error(`failed to create branch '${branchName}': HTTP ${branchRes.status}`);
  }

  const summary = [];
  for (const change of changes) {
    const repoPath = `stories/${change.file}`;
    const newRaw = renderStoryFile(change);

    const getRes = await giteaApi(giteaBaseUrl, token, `repos/${owner}/${repo}/contents/${repoPath}?ref=${branchName}`);
    const exists = getRes.ok;
    const sha = exists ? (await getRes.json()).sha : undefined;

    const writeRes = await giteaApi(giteaBaseUrl, token, `repos/${owner}/${repo}/contents/${repoPath}`, {
      method: exists ? 'PUT' : 'POST',
      body: JSON.stringify({
        content: utf8ToBase64(newRaw),
        message: `${change.data.id}: proposed via assistant`,
        branch: branchName,
        ...(sha ? { sha } : {}),
      }),
    });
    if (!writeRes.ok) {
      throw new Error(`failed to write ${repoPath} on branch '${branchName}': HTTP ${writeRes.status}`);
    }
    summary.push(`${exists ? 'update' : 'create'} ${change.data.id}`);
  }

  const prBody =
    `**Instruction:** ${instruction}\n\n**Proposed changes:**\n` +
    summary.map((s) => `- ${s}`).join('\n') +
    '\n\n_Opened by the agile-board assistant (MVP2, EPIC-012). Nothing here affects the live board until this PR is merged._';

  const prRes = await giteaApi(giteaBaseUrl, token, `repos/${owner}/${repo}/pulls`, {
    method: 'POST',
    body: JSON.stringify({
      head: branchName, base: baseBranch,
      title: `Assistant proposal: ${instruction.slice(0, 72)}`,
      body: prBody,
    }),
  });
  if (!prRes.ok) {
    throw new Error(`failed to open PR from '${branchName}': HTTP ${prRes.status}`);
  }
  const pr = await prRes.json();
  return { url: pr.html_url, number: pr.number };
}
