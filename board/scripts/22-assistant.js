/*
 * agile-board AI assistant panel (original code, MIT — see ../../NOTICE).
 *
 * Layers a chat panel on top of the board the same non-invasive way
 * 20-remote.js/21-write.js do: no vendored file touched, gated on
 * `window.__agileBoardWriteMode` (the flag 21-write.js already sets), and
 * reading the same Gitea token 21-write.js stores in localStorage under
 * `agile-board.gitea-token` (duplicated here rather than imported — plain
 * <script> tags share one global scope but this project's convention keeps
 * each additive file loosely coupled via shared globals/localStorage, not
 * private cross-file function calls).
 *
 * Two capabilities, one panel: **Ask** (question in, grounded answer out)
 * and **Propose** (instruction in, a Gitea PR out — nothing touches the
 * live board until a human merges it). See docs/PRD.md #14.
 */
(function () {
    const TOKEN_KEY = 'agile-board.gitea-token';
    // assistant-api is proxied by the same Caddy instance under /api/*.
    const API_BASE = new URL('../api/', document.baseURI);

    function getStoredToken() {
        try {
            const raw = localStorage.getItem(TOKEN_KEY);
            if (!raw) return null;
            const obj = JSON.parse(raw);
            if (!obj || !obj.access_token) return null;
            if (obj.expires_at && Date.now() > obj.expires_at) return null;
            return obj.access_token;
        } catch {
            return null;
        }
    }

    function buildPanel() {
        const panel = document.createElement('div');
        panel.id = 'assistantPanel';
        panel.style.cssText =
            'display:none; position:fixed; bottom:1.5rem; right:1.5rem; width:360px; ' +
            'max-height:70vh; background:white; border:1px solid var(--border-color); ' +
            'border-radius:10px; box-shadow:0 4px 20px rgba(0,0,0,0.15); ' +
            'display:flex; flex-direction:column; z-index:1000; overflow:hidden;';
        panel.innerHTML = `
            <div style="padding:0.75rem 1rem; border-bottom:1px solid var(--border-color); display:flex; justify-content:space-between; align-items:center;">
                <strong>🤖 Assistant</strong>
                <button id="assistantCloseBtn" class="btn btn-secondary" style="padding:0.25rem 0.6rem;">✕</button>
            </div>
            <div style="padding:0.5rem 1rem; display:flex; gap:0.5rem;">
                <label style="font-size:0.85rem;"><input type="radio" name="assistantMode" value="ask" checked> Ask</label>
                <label style="font-size:0.85rem;"><input type="radio" name="assistantMode" value="propose"> Propose a change</label>
            </div>
            <div id="assistantResult" style="flex:1; overflow-y:auto; padding:0 1rem; font-size:0.9rem; white-space:pre-wrap;"></div>
            <div style="padding:0.75rem 1rem; border-top:1px solid var(--border-color); display:flex; gap:0.5rem;">
                <input id="assistantInput" type="text" placeholder="Ask a question, or describe a change..."
                       style="flex:1; padding:0.5rem; border:1px solid var(--border-color); border-radius:6px;">
                <button id="assistantSendBtn" class="btn btn-primary">Send</button>
            </div>
        `;
        document.body.appendChild(panel);
        return panel;
    }

    function setResult(panel, html) {
        panel.querySelector('#assistantResult').innerHTML = html;
    }

    // textContent-based rendering (matching this project's escapeHtml-by-
    // construction convention elsewhere) — never innerHTML with server text.
    function renderText(panel, text) {
        const el = panel.querySelector('#assistantResult');
        el.textContent = text;
    }

    async function send(panel) {
        const token = getStoredToken();
        if (!token) {
            renderText(panel, 'Log in with Gitea first to use the assistant.');
            return;
        }
        const input = panel.querySelector('#assistantInput');
        const text = input.value.trim();
        if (!text) return;
        const mode = panel.querySelector('input[name="assistantMode"]:checked').value;
        const sendBtn = panel.querySelector('#assistantSendBtn');

        sendBtn.disabled = true;
        renderText(panel, mode === 'ask' ? 'Thinking…' : 'Working on it — this can take a bit longer, it may open a PR…');

        try {
            const endpoint = mode === 'ask' ? 'ask' : 'propose';
            const payload = mode === 'ask' ? { question: text } : { instruction: text };
            const res = await fetch(new URL(endpoint, API_BASE), {
                method: 'POST',
                headers: { Authorization: `token ${token}`, 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });
            const body = await res.json().catch(() => ({}));

            if (res.status === 401) {
                renderText(panel, 'Your session looks expired — log out and back in with Gitea.');
            } else if (res.status === 429) {
                renderText(panel, "You're asking a lot right now — try again in a minute.");
            } else if (res.status === 503) {
                renderText(panel, 'The assistant is not configured yet on this deployment.');
            } else if (res.status === 422) {
                const detail = body.problems
                    ? body.problems.map((p) => `${p.file}: ${p.errors.join('; ')}`).join('\n')
                    : '';
                renderText(panel, `${body.error || 'That instruction could not be applied.'}${detail ? '\n' + detail : ''}`);
            } else if (!res.ok) {
                renderText(panel, body.error || 'Something went wrong — try again shortly.');
            } else if (mode === 'ask') {
                renderText(panel, body.answer);
            } else {
                const el = panel.querySelector('#assistantResult');
                el.textContent = '';
                const p = document.createElement('p');
                p.textContent = `Done — proposed: ${(body.summary || []).join(', ')}`;
                const a = document.createElement('a');
                a.href = body.prUrl;
                a.target = '_blank';
                a.rel = 'noopener';
                a.textContent = 'View the pull request';
                el.append(p, a);
            }
        } catch {
            renderText(panel, 'Could not reach the assistant — check your connection.');
        } finally {
            sendBtn.disabled = false;
            input.value = '';
        }
    }

    function wire(panel, toggleBtn) {
        panel.querySelector('#assistantCloseBtn').addEventListener('click', () => {
            panel.style.display = 'none';
        });
        panel.querySelector('#assistantSendBtn').addEventListener('click', () => send(panel));
        panel.querySelector('#assistantInput').addEventListener('keydown', (e) => {
            if (e.key === 'Enter') send(panel);
        });
        toggleBtn.addEventListener('click', () => {
            panel.style.display = panel.style.display === 'none' ? 'flex' : 'none';
        });
    }

    function init() {
        // Visibility gated on write-mode, same as drag/edit affordances — a
        // logged-out visitor sees no assistant button at all.
        const btn = document.createElement('button');
        btn.id = 'assistantToggleBtn';
        btn.className = 'btn btn-secondary';
        btn.textContent = '🤖 Assistant';
        btn.style.display = 'none';
        const header = document.querySelector('.header-content > div');
        if (header) header.appendChild(btn);

        const panel = buildPanel();
        wire(panel, btn);

        function refreshVisibility() {
            btn.style.display = window.__agileBoardWriteMode ? 'inline-flex' : 'none';
            if (!window.__agileBoardWriteMode) panel.style.display = 'none';
        }
        refreshVisibility();
        // 21-write.js sets __agileBoardWriteMode synchronously at top-level
        // and again after OAuth callback; poll for the rest of the page's
        // life to catch that flip without a second cross-file dependency.
        // A boolean check every second is negligible cost for as long as
        // the tab stays open, and avoids a fixed timeout silently missing
        // a slow OAuth round-trip.
        setInterval(refreshVisibility, 1000);
    }

    window.addEventListener('DOMContentLoaded', init);
})();
