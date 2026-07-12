/*
 * agile-board remote read-only loader (original code, MIT — see ../../NOTICE).
 *
 * Layers a read-only "remote board" mode on top of the unmodified upstream
 * MarkdownTaskManager scripts (00-*.js .. 12-*.js): instead of the File System
 * Access folder picker, it fetches a pre-built stories/index.json manifest plus
 * per-story Markdown files over HTTP, maps them into the same in-memory `tasks`/
 * `config` shape the upstream renderer already understands, and calls the
 * existing renderKanban()/showTaskDetail() to display them.
 *
 * This script only reads/writes the shared globals (`tasks`, `config`) and
 * wraps two existing function bindings (`renderKanban`, `showTaskDetail`) —
 * safe in classic (non-module) scripts, where every <script> tag shares one
 * top-level scope and a later assignment to a `function`-declared name is
 * visible to earlier-defined closures that reference it by name at call time.
 *
 * This fork is web-only — the upstream local-folder/File System Access mode
 * has been removed entirely (see NOTICE), so a failure to load
 * stories/index.json is always a real error, shown via showRemoteError().
 */
(function () {
    // No emoji in the UI. Priority "faróis" get their color from the raw value
    // (critical/high/medium/low) via a CSS [data-filter-value] rule in
    // styles/99-theme.css — the color no longer rides on a leading emoji.
    const PRIORITY_DISPLAY = {
        critical: 'Critical',
        high: 'High',
        medium: 'Medium',
        low: 'Low',
    };

    const STATUS_COLUMNS = [
        { name: 'To Do', id: 'todo' },
        { name: 'In Progress', id: 'in-progress' },
        { name: 'In Review', id: 'in-review' },
        { name: 'Done', id: 'done' },
    ];

    let readOnlyMode = false;
    // board/ and stories/ are siblings in the repo, and the whole repo is what gets
    // checked out and served — so from board/index.html the story data is one
    // level up, at ../stories/, not ./stories/. Override with ?board= when
    // serving the viewer from a different location.
    let remoteBaseUrl = '../stories/';

    function capitalize(word) {
        return word ? word.charAt(0).toUpperCase() + word.slice(1) : word;
    }

    function getRemoteBaseUrl() {
        const params = new URLSearchParams(location.search);
        const fromQuery = params.get('board');
        const base = fromQuery || '../stories/';
        const normalized = base.endsWith('/') ? base : base + '/';
        // new URL(x, base) requires `base` itself to be absolute — resolve our
        // relative default against the document's own URL once, up front.
        return new URL(normalized, document.baseURI).toString();
    }

    // Strip the YAML frontmatter block, keeping only the Markdown body. Story
    // metadata is already authoritative in the manifest — this exists only to
    // fetch a story's Description/Acceptance Criteria/Subtasks/Notes sections.
    function stripFrontmatter(raw) {
        const m = /^---\r?\n[\s\S]*?\r?\n---\r?\n?([\s\S]*)$/.exec(raw);
        return (m ? m[1] : raw).trim();
    }

    // Split a story body into its "## Heading" sections, keyed by lowercased heading text.
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

    // "- [ ] text" / "- [x] text" -> {completed, text}[]
    function parseChecklist(text) {
        if (!text) return [];
        return [...text.matchAll(/^-\s*\[( |x|X)\]\s*(.+)$/gm)].map((m) => ({
            completed: m[1].toLowerCase() === 'x',
            text: m[2].trim(),
        }));
    }

    // Map one manifest entry (parsed frontmatter) to the task shape upstream's
    // renderKanban()/createTaskElement()/showTaskDetail() already know how to draw.
    function storyToTask(meta) {
        const priorityKey = (meta.priority || 'medium').toLowerCase();
        return {
            id: meta.id,
            title: meta.title,
            status: meta.status,
            priority: capitalize(priorityKey),
            category: meta.category || '',
            assignees: meta.assignees || [],
            tags: meta.tags || [],
            created: meta.created || '',
            started: meta.started || '',
            due: meta.due || '',
            completed: meta.finished || '',
            description: '',
            subtasks: [],
            notes: '',
            _file: meta.file,
            _bodyLoaded: false,
        };
    }

    // Fetch and parse a story's Markdown body on first view (lazy — the manifest
    // alone is enough to render the board; bodies are fetched one at a time on click).
    async function loadStoryBody(task) {
        if (task._bodyLoaded || !task._file) return;
        const res = await fetch(new URL(task._file, remoteBaseUrl), { cache: 'no-store' });
        if (!res.ok) return;
        const body = stripFrontmatter(await res.text());
        const sections = splitSections(body);
        task.description = sections['description'] || '';
        task.subtasks = [
            ...parseChecklist(sections['acceptance criteria']),
            ...parseChecklist(sections['subtasks']),
        ];
        task.notes = sections['notes'] || '';
        task._bodyLoaded = true;
    }

    // Strip write affordances that upstream's templates render unconditionally
    // (edit/drag on cards; edit/archive/delete + subtask editing in the modal).
    // Gated on window.__agileBoardWriteMode (set by the optional 21-write.js):
    // creating new stories (column-add-btn) and archiving/deleting a story stay
    // out of scope even when logged in — everything else un-gates for a
    // logged-in, write-capable session.
    function sanitizeBoardDom() {
        if (!window.__agileBoardWriteMode) {
            document.querySelectorAll('.task-card').forEach((el) => el.removeAttribute('draggable'));
            document.querySelectorAll('.task-list').forEach((el) => {
                el.removeAttribute('ondrop');
                el.removeAttribute('ondragover');
            });
            document.querySelectorAll('.task-edit-btn').forEach((el) => el.remove());
        }
        document.querySelectorAll('.column-add-btn').forEach((el) => el.remove());
    }

    function sanitizeModalDom() {
        if (window.__agileBoardWriteMode) {
            // Archiving/deleting a whole story stays out of scope regardless of
            // login; everything else (Edit button, subtask editing) is left as
            // upstream rendered it.
            document.querySelectorAll('#taskModalActions [onclick^="archiveCurrentTask"]').forEach((el) => el.remove());
            document.querySelectorAll('#taskModalActions [onclick^="deleteCurrentTask"]').forEach((el) => el.remove());
            return;
        }
        const actions = document.getElementById('taskModalActions');
        if (actions) {
            const closeLabel = typeof t === 'function' ? t('taskDetail.close') : 'Close';
            actions.innerHTML = '';
            const btn = document.createElement('button');
            btn.className = 'btn btn-secondary';
            btn.textContent = closeLabel;
            btn.addEventListener('click', closeModal);
            actions.appendChild(btn);
        }
        document.querySelectorAll('#subtasksList input[type="checkbox"]').forEach((cb) => (cb.disabled = true));
        document.querySelectorAll('#subtasksList button').forEach((el) => el.remove());
        document.querySelectorAll('#subtasksList span[ondblclick]').forEach((el) => el.removeAttribute('ondblclick'));
        const addRow = document.getElementById('newSubtaskInput');
        if (addRow && addRow.closest('div')) addRow.closest('div').remove();
    }

    function showRemoteError(message) {
        const welcome = document.getElementById('welcomeScreen');
        if (!welcome) return;
        welcome.innerHTML = '';
        const h2 = document.createElement('h2');
        h2.textContent = 'Unable to load the board';
        const p = document.createElement('p');
        p.textContent = message;
        welcome.append(h2, p);
    }

    function activateReadOnlyMode() {
        readOnlyMode = true;

        const originalRenderKanban = renderKanban;
        renderKanban = function () {
            originalRenderKanban();
            sanitizeBoardDom();
        };

        const originalShowTaskDetail = showTaskDetail;
        showTaskDetail = function (task) {
            originalShowTaskDetail(task);
            sanitizeModalDom();
            if (!task._bodyLoaded) {
                loadStoryBody(task).then(() => {
                    if (currentDetailTask === task) {
                        originalShowTaskDetail(task);
                        sanitizeModalDom();
                    }
                });
            }
        };
    }

    function renderRemoteBoard(manifest) {
        activateReadOnlyMode();

        config = {
            lastTaskId: 0,
            columns: STATUS_COLUMNS,
            categories: [],
            users: [],
            priorities: Object.values(PRIORITY_DISPLAY),
            tags: [],
            boardTitle: manifest.title || 'agile-board',
        };
        tasks = (manifest.stories || []).map(storyToTask);

        document.getElementById('welcomeScreen').style.display = 'none';
        document.getElementById('kanbanView').style.display = 'block';
        document.getElementById('filterBar').style.display = 'block';
        // The folder picker is upstream's entry point into local write mode — out of
        // place on a public read-only board, so hide it once remote mode is active.
        document.getElementById('selectFolderBtn').style.display = 'none';
        // The header shows a static brand wordmark (see index.html), not this
        // title — just keep the document/tab title in sync.
        document.title = config.boardTitle;

        updateAutocomplete();
        renderKanban();
    }

    async function initRemoteBoard() {
        remoteBaseUrl = getRemoteBaseUrl();
        let res;
        try {
            res = await fetch(new URL('index.json', remoteBaseUrl), { cache: 'no-store' });
        } catch (networkErr) {
            console.warn('agile-board: could not reach remote manifest', networkErr);
            showRemoteError('Could not reach the board data. Check your connection and reload.');
            return;
        }
        if (res.status === 404) {
            showRemoteError('Board data not found (stories/index.json is missing).');
            return;
        }
        if (!res.ok) {
            showRemoteError(`Board data returned an error (HTTP ${res.status}).`);
            return;
        }
        let manifest;
        try {
            manifest = await res.json();
        } catch (parseErr) {
            console.error('agile-board: malformed manifest', parseErr);
            showRemoteError('Board data is malformed and could not be read.');
            return;
        }
        renderRemoteBoard(manifest);
    }

    window.addEventListener('DOMContentLoaded', initRemoteBoard);
})();
