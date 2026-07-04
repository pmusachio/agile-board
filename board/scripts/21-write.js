/*
 * agile-board write mode (original code, MIT — see ../../NOTICE).
 *
 * Layers real write-back on top of 20-remote.js's read-only mode: a
 * "Log in with Gitea" button (OAuth2 + PKCE — no client secret, safe for a
 * pure static SPA), and a real autoSave() that persists drag-and-drop status
 * changes and edit-modal saves as real commits via Gitea's Contents API,
 * instead of upstream's local-file autoSave() (a no-op in remote mode).
 *
 * Depends on 20-remote.js having already run: reuses its `remoteBaseUrl`,
 * the task shape `storyToTask()` produces, and `activateReadOnlyMode()`'s
 * sanitize calls (which this file does not touch directly — see the small
 * guard added to those calls in 20-remote.js instead, gated on
 * `window.__agileBoardWriteMode`).
 *
 * No vendored upstream file (00-*.js .. 12-*.js) is modified. This file only
 * reads/writes the shared globals (`tasks`, `config`, `currentDetailTask`)
 * and wraps existing function bindings (`renderKanban`, `showTaskDetail`,
 * `autoSave`) — same pattern 20-remote.js already established.
 */
(function () {
    // ---- Config — specific to this deployment, not meant to be generic ----
    const REPO_OWNER = 'paulo';
    const REPO_NAME = 'agile-board';
    // Filled in after registering the OAuth2 app in Gitea (see docs/RUNBOOK.md).
    // A public-client OAuth2 client_id is not a secret — safe to hardcode here.
    const GITEA_CLIENT_ID = 'd6ed8e80-70b1-4c16-926f-5bcbd3785e7f';
    const TOKEN_KEY = 'agile-board.gitea-token';
    const PKCE_KEY = 'agile-board.pkce';
    const OAUTH_SCOPE = 'write:repository read:user';

    // board/ and git/ are siblings behind the same Caddy site (see docs/PRD.md #8).
    const GITEA_BASE = new URL('../git/', document.baseURI).toString();
    // Normalizes to the board's own directory regardless of whether this page
    // was reached via /board/ or /board/index.html — must exactly match what's
    // registered as the OAuth2 app's redirect_uri (Gitea does exact matching).
    const REDIRECT_URI = new URL('.', document.baseURI).toString();

    let cachedUsername = null;
    // taskId -> { meta: string, body: string } — JSON snapshots used to detect
    // which task(s) actually changed when autoSave() fires with no arguments.
    const baseline = new Map();

    // ================= PKCE + token storage =================

    function base64urlFromBytes(bytes) {
        let binary = '';
        bytes.forEach((b) => (binary += String.fromCharCode(b)));
        return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
    }

    function randomPkceString(len) {
        const bytes = new Uint8Array(len);
        crypto.getRandomValues(bytes);
        return base64urlFromBytes(bytes);
    }

    async function pkceChallenge(verifier) {
        const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(verifier));
        return base64urlFromBytes(new Uint8Array(digest));
    }

    function getStoredToken() {
        try {
            const raw = localStorage.getItem(TOKEN_KEY);
            if (!raw) return null;
            const obj = JSON.parse(raw);
            if (!obj || !obj.access_token) return null;
            if (obj.expires_at && Date.now() > obj.expires_at) return null;
            return obj;
        } catch {
            return null;
        }
    }

    function setStoredToken(obj) {
        localStorage.setItem(TOKEN_KEY, JSON.stringify(obj));
    }

    function clearStoredToken() {
        localStorage.removeItem(TOKEN_KEY);
    }

    function isLoggedIn() {
        return !!getStoredToken();
    }

    async function startLogin() {
        const verifier = randomPkceString(64);
        const state = randomPkceString(24);
        sessionStorage.setItem(PKCE_KEY, JSON.stringify({ verifier, state }));
        const challenge = await pkceChallenge(verifier);
        const url = new URL('login/oauth/authorize', GITEA_BASE);
        url.searchParams.set('client_id', GITEA_CLIENT_ID);
        url.searchParams.set('redirect_uri', REDIRECT_URI);
        url.searchParams.set('response_type', 'code');
        url.searchParams.set('code_challenge', challenge);
        url.searchParams.set('code_challenge_method', 'S256');
        url.searchParams.set('state', state);
        url.searchParams.set('scope', OAUTH_SCOPE);
        location.href = url.toString();
    }

    async function handleOAuthCallback() {
        const params = new URLSearchParams(location.search);
        const code = params.get('code');
        const returnedState = params.get('state');
        if (!code) return false;

        // Scrub the query string regardless of outcome — the code is single-use
        // and must not linger in the address bar / browser history.
        const cleanup = () => history.replaceState(null, '', location.pathname + location.hash);

        let stored = null;
        try {
            stored = JSON.parse(sessionStorage.getItem(PKCE_KEY) || 'null');
        } catch {
            /* ignore */
        }
        sessionStorage.removeItem(PKCE_KEY);

        if (!stored || returnedState !== stored.state) {
            cleanup();
            console.error('agile-board: OAuth state mismatch, aborting login');
            return false;
        }

        try {
            const res = await fetch(new URL('login/oauth/access_token', GITEA_BASE), {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    client_id: GITEA_CLIENT_ID,
                    grant_type: 'authorization_code',
                    redirect_uri: REDIRECT_URI,
                    code,
                    code_verifier: stored.verifier,
                }),
            });
            cleanup();
            if (!res.ok) throw new Error(`token exchange failed: HTTP ${res.status}`);
            const body = await res.json();
            setStoredToken({
                access_token: body.access_token,
                refresh_token: body.refresh_token,
                expires_at: body.expires_in ? Date.now() + body.expires_in * 1000 : null,
            });
            return true;
        } catch (err) {
            cleanup();
            console.error('agile-board: OAuth token exchange failed', err);
            return false;
        }
    }

    function logout() {
        clearStoredToken();
        cachedUsername = null;
        location.reload();
    }

    // ================= Frontmatter parsing (client-side port) =================
    // Mirrors scripts/lib/frontmatter.mjs exactly (same YAML subset, same
    // scalar rules) so client and server never disagree about what's valid.

    function parseFrontmatter(raw) {
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
            return inner ? inner.split(',').map((s) => parseScalar(s.trim())) : [];
        }
        if (/^"(.*)"$/.test(v)) return v.slice(1, -1).replace(/\\"/g, '"');
        if (/^'(.*)'$/.test(v)) return v.slice(1, -1).replace(/''/g, "'");
        if (/^-?\d+(\.\d+)?$/.test(v)) return Number(v);
        return v;
    }

    function splitSections(body) {
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

    function parseChecklist(text) {
        if (!text) return [];
        return [...text.matchAll(/^-\s*\[( |x|X)\]\s*(.+)$/gm)].map((m) => ({
            completed: m[1].toLowerCase() === 'x',
            text: m[2].trim(),
        }));
    }

    // ================= Serialization (the write-side inverse) =================

    const FRONTMATTER_KEY_ORDER = [
        'id', 'title', 'status', 'priority', 'category', 'assignees', 'epic',
        'created', 'started', 'due', 'finished', 'tags', 'estimate',
        'depends_on', 'blocks', 'related',
    ];
    // These never leave server truth — the edit form has no field for them.
    const PRESERVE_VERBATIM = ['id', 'epic', 'estimate', 'depends_on', 'blocks', 'related'];
    const QUOTABLE_STRING_FIELDS = ['title', 'category'];

    // Every existing seed file leaves title/category unquoted unless quoting
    // is actually required to round-trip correctly — matching that convention
    // avoids a no-op save (e.g. a pure drag-and-drop status change) producing
    // a spurious quoting-only diff on fields the user never touched. Quoting
    // *is* required for: an empty string (bare `key:` parses back as null, not
    // ''), and anything parseScalar would otherwise misinterpret (null/~,
    // something bracket- or number-shaped).
    function needsQuoting(v) {
        if (v === '') return true;
        if (v === 'null' || v === '~') return true;
        if (/^\[.*\]$/.test(v)) return true;
        if (/^-?\d+(\.\d+)?$/.test(v)) return true;
        return false;
    }

    // String array ITEMS are always quoted (matching every existing seed
    // file's convention, e.g. assignees: ["@paulo"]) even though top-level
    // fields decide their own quoting in serializeFrontmatter — parseScalar
    // accepts both forms, but matching the established convention keeps a
    // no-op save from producing a noisy quoting-only diff on every array field.
    function serializeScalar(value) {
        if (value === null || value === undefined) return 'null';
        if (Array.isArray(value)) {
            return `[${value.map((v) => (typeof v === 'string' ? `"${v.replace(/"/g, '\\"')}"` : serializeScalar(v))).join(', ')}]`;
        }
        if (typeof value === 'number') return String(value);
        return String(value);
    }

    function serializeFrontmatter(data) {
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

    // One line per item, not a single joined string — matters when the list is
    // empty: pushing nothing (vs. pushing one empty-string line) is what keeps
    // exactly one blank line before the next heading, matching every existing
    // seed file's spacing (see serializeStory's body builder below).
    function pushChecklist(lines, items) {
        (items || []).forEach((it) => lines.push(`- [${it.completed ? 'x' : ' '}] ${it.text}`));
    }

    // Builds the full file content for a save. `serverFrontmatter` and
    // `serverAcceptanceCriteria` come from a FRESH GET (never from the
    // in-memory task, which never carries the preserve-verbatim fields or the
    // AC section at all) — this is what guarantees a lossless round-trip.
    function serializeStory(task, serverFrontmatter, serverAcceptanceCriteria) {
        const merged = { ...serverFrontmatter };
        for (const key of FRONTMATTER_KEY_ORDER) {
            if (PRESERVE_VERBATIM.includes(key)) continue; // keep server's value untouched
            switch (key) {
                case 'title': merged.title = task.title; break;
                case 'status': merged.status = task.status; break;
                case 'priority': merged.priority = (task.priority || '').toLowerCase(); break;
                case 'category': merged.category = task.category || ''; break;
                case 'assignees': merged.assignees = task.assignees || []; break;
                case 'created': merged.created = task.created || null; break;
                case 'started': merged.started = task.started || null; break;
                case 'due': merged.due = task.due || null; break;
                case 'finished': merged.finished = task.completed || null; break;
                case 'tags': merged.tags = task.tags || []; break;
                default: break; // id/epic/estimate/depends_on/blocks/related already preserved above
            }
        }

        // task.subtasks is the READ path's merge of AC-then-Subtasks into one
        // flat array (see loadStoryBody in 20-remote.js) — the UI has no way to
        // tell which item came from which heading. Since AC items are always
        // placed first at load time and new items are only ever appended (never
        // inserted mid-array — see addSubtask/addFormSubtask), the first
        // acCount entries are still the AC items in the common case (toggle,
        // edit text, add new); only deleting one of those *original* AC items
        // via the merged UI breaks this assumption. That narrow edge case is
        // accepted over the alternative (always collapsing AC into Subtasks on
        // every save) — see docs/PRD.md's MVP1.5 plan for the tradeoff.
        const acCount = parseChecklist(serverAcceptanceCriteria).length;
        const subtasksOnly = (task.subtasks || []).slice(acCount);

        // Matches the original story generator's exact per-section shape:
        // Description/Notes are singular string fields, always pushed as a
        // line even when empty (so a story with no notes still ends in one
        // blank line before EOF, not zero); Acceptance Criteria/Subtasks are
        // array-derived, so pushing nothing when empty (via the `if` guard /
        // pushChecklist) is what's needed to keep exactly one blank line
        // *between* sections instead of two.
        const bodyLines = [
            '## Description', task.description || '', '',
            '## Acceptance Criteria',
        ];
        if (serverAcceptanceCriteria) bodyLines.push(serverAcceptanceCriteria);
        bodyLines.push('', '## Subtasks');
        pushChecklist(bodyLines, subtasksOnly);
        bodyLines.push('', '## Notes', task.notes || '', '');

        return `${serializeFrontmatter(merged)}\n\n${bodyLines.join('\n')}`;
    }

    // ================= UTF-8-safe base64 (Gitea Contents API uses base64) =================

    function utf8ToBase64(str) {
        const bytes = new TextEncoder().encode(str);
        let binary = '';
        bytes.forEach((b) => (binary += String.fromCharCode(b)));
        return btoa(binary);
    }

    function base64ToUtf8(b64) {
        const binary = atob(b64.replace(/\s/g, ''));
        const bytes = new Uint8Array(binary.length);
        for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
        return new TextDecoder().decode(bytes);
    }

    // ================= Gitea Contents API client =================

    function apiHeaders() {
        const token = getStoredToken();
        return token ? { Authorization: `token ${token.access_token}` } : {};
    }

    async function getFileContents(path) {
        const url = `${GITEA_BASE}api/v1/repos/${REPO_OWNER}/${REPO_NAME}/contents/${path}`;
        const res = await fetch(url, { headers: apiHeaders(), cache: 'no-store' });
        if (!res.ok) throw new Error(`GET ${path} failed: HTTP ${res.status}`);
        const body = await res.json();
        return { sha: body.sha, raw: base64ToUtf8(body.content) };
    }

    async function putFileContents(path, sha, newRaw, message) {
        const url = `${GITEA_BASE}api/v1/repos/${REPO_OWNER}/${REPO_NAME}/contents/${path}`;
        const res = await fetch(url, {
            method: 'PUT',
            headers: { ...apiHeaders(), 'Content-Type': 'application/json' },
            body: JSON.stringify({
                sha,
                content: utf8ToBase64(newRaw),
                message,
                branch: 'main',
            }),
        });
        if (res.status === 409) {
            const err = new Error('conflict');
            err.conflict = true;
            throw err;
        }
        if (!res.ok) throw new Error(`PUT ${path} failed: HTTP ${res.status}`);
        return res.json();
    }

    // Fetch-overlay-write for one task. Never creates new files (this pass has
    // no UI path to create a story — the "+" / new-task controls stay removed
    // regardless of login, see 20-remote.js's sanitizeBoardDom).
    async function saveTask(task) {
        // task._file is just the bare filename (see storyToTask() in
        // 20-remote.js / build-manifest.mjs's manifest shape) — stories live
        // under stories/ in the repo, so the Contents API path needs that
        // directory prefix even though the manifest/task object doesn't carry it.
        const repoPath = `stories/${task._file}`;
        const { sha, raw } = await getFileContents(repoPath);
        const { data: serverFrontmatter, body: serverBody } = parseFrontmatter(raw);
        const serverSections = splitSections(serverBody);
        const newRaw = serializeStory(task, serverFrontmatter, serverSections['acceptance criteria'] || '');
        const message = `${task.id}: update via board`;
        await putFileContents(repoPath, sha, newRaw, message);
    }

    // ================= Dirty tracking (see the design note in the plan: a
    // structural "was empty, now loaded" check absorbs the lazy-body-load
    // transition without ever mistaking it for a real edit) =================

    function metaSnapshot(task) {
        return JSON.stringify({
            title: task.title, status: task.status, priority: task.priority,
            category: task.category, assignees: task.assignees, tags: task.tags,
            created: task.created, started: task.started, due: task.due,
            completed: task.completed,
        });
    }

    function bodySnapshot(task) {
        return JSON.stringify({ description: task.description, subtasks: task.subtasks, notes: task.notes });
    }

    function isEmptyBody(snap) {
        try {
            const o = JSON.parse(snap);
            return !o.description && (!o.subtasks || o.subtasks.length === 0) && !o.notes;
        } catch {
            return true;
        }
    }

    function initBaseline() {
        baseline.clear();
        for (const task of tasks || []) {
            baseline.set(task.id, { meta: metaSnapshot(task), body: bodySnapshot(task) });
        }
    }

    function findDirtyTasks() {
        const dirty = [];
        for (const task of tasks || []) {
            let entry = baseline.get(task.id);
            if (!entry) {
                entry = { meta: metaSnapshot(task), body: bodySnapshot(task) };
                baseline.set(task.id, entry);
                continue; // new to us this pass — nothing to compare against yet
            }
            const curMeta = metaSnapshot(task);
            const curBody = bodySnapshot(task);
            const metaDirty = curMeta !== entry.meta;
            let bodyDirty = curBody !== entry.body;
            if (bodyDirty && isEmptyBody(entry.body) && !isEmptyBody(curBody)) {
                // A lazy loadStoryBody() just populated this task — absorb it
                // into the baseline, it is not a user edit.
                entry.body = curBody;
                bodyDirty = false;
            }
            if (metaDirty || bodyDirty) dirty.push(task);
        }
        return dirty;
    }

    function commitBaseline(task) {
        baseline.set(task.id, { meta: metaSnapshot(task), body: bodySnapshot(task) });
    }

    // ================= autoSave() override =================

    function activateWriteMode() {
        window.__agileBoardWriteMode = true;

        const originalAutoSave = autoSave;
        autoSave = async function () {
            if (!isLoggedIn()) return originalAutoSave();

            const dirty = findDirtyTasks();
            if (dirty.length === 0) return true;

            let ok = true;
            for (const task of dirty) {
                try {
                    await saveTask(task);
                    commitBaseline(task);
                } catch (err) {
                    ok = false;
                    if (err && err.conflict) {
                        showNotification(
                            'This story was changed by someone else. Reload the page to see the latest version before editing again.',
                            'error'
                        );
                    } else {
                        console.error('agile-board: save failed', err);
                        showNotification('Could not save — check your connection and try again.', 'error');
                    }
                }
            }
            return ok;
        };
    }

    // ================= Auth UI =================

    async function fetchUsername(token) {
        const res = await fetch(new URL('api/v1/user', GITEA_BASE), { headers: { Authorization: `token ${token}` } });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const body = await res.json();
        return body.login;
    }

    async function refreshAuthUI() {
        const btn = document.getElementById('giteaAuthBtn');
        if (!btn) return;
        const token = getStoredToken();
        if (!token) {
            window.__agileBoardWriteMode = false;
            btn.textContent = '🔑 Log in with Gitea';
            return;
        }
        try {
            cachedUsername = cachedUsername || (await fetchUsername(token.access_token));
            window.__agileBoardWriteMode = true;
            btn.textContent = `👤 ${cachedUsername} (log out)`;
        } catch (err) {
            console.warn('agile-board: stored token looks invalid, falling back to read-only', err);
            clearStoredToken();
            window.__agileBoardWriteMode = false;
            btn.textContent = '🔑 Log in with Gitea';
        }
    }

    function wireAuthButton() {
        const btn = document.getElementById('giteaAuthBtn');
        if (!btn) return;
        btn.addEventListener('click', () => {
            if (isLoggedIn()) logout();
            else startLogin();
        });
    }

    // ================= Init =================

    // Set synchronously (not inside the async init below) so that by the time
    // 20-remote.js's own DOMContentLoaded handler calls renderKanban() for the
    // first time, the flag it checks already reflects a *pre-existing* login
    // from an earlier visit. A same-page fresh OAuth redirect-back is handled
    // separately below (there's no token yet at this point in that case).
    window.__agileBoardWriteMode = isLoggedIn();

    // Wrap renderKanban once more (stacking on top of 20-remote.js's own wrap,
    // same pattern) purely to establish the diff baseline the first time the
    // board actually has real data to render — deterministic, no polling.
    let baselineInitialized = false;
    const previousRenderKanbanForBaseline = renderKanban;
    renderKanban = function () {
        previousRenderKanbanForBaseline();
        if (!baselineInitialized && Array.isArray(window.tasks)) {
            initBaseline();
            baselineInitialized = true;
        }
    };

    window.addEventListener('DOMContentLoaded', async () => {
        wireAuthButton();

        const justLoggedIn = await handleOAuthCallback();
        await refreshAuthUI();

        if (justLoggedIn) {
            activateWriteMode();
            // 20-remote.js's manifest fetch may or may not have populated
            // tasks[] yet — only re-render if it already has; otherwise its
            // own eventual renderKanban() call already sees the flag set above.
            if (Array.isArray(window.tasks) && typeof renderKanban === 'function') {
                renderKanban();
            }
        } else if (isLoggedIn()) {
            activateWriteMode();
        }
    });
})();
