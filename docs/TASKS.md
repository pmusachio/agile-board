# TASKS — agile-board (MVP1)

Engineering breakdown for MVP1, derived from [PRD.md](./PRD.md). Organized by epic.
Each task has an id, acceptance criteria (AC), and dependencies (deps). Once the board
exists, these become the seed stories under `stories/` (dogfooding), so the project's
history *is* the board.

**Legend:** `[ ]` todo · `[~]` in progress · `[x]` done · `(opt)` optional for MVP1

---

## Milestone sequence (critical path)

```
EPIC-0 setup ─► EPIC-1 data model ─► EPIC-2 viewer ─┐
                          └► EPIC-3 infra ───────────┼─► EPIC-5 launch (E2E + README + tag)
                                        EPIC-4 git ──┘
```

EPIC-2 (viewer) and EPIC-3 (infra) can proceed in parallel once EPIC-1's schema is fixed.

---

## EPIC-0 — Project setup & foundations

- [ ] **TASK-001 — Repo scaffolding**
  - Create dirs: `board/`, `stories/`, `docs/`, `infra/`, `scripts/`.
  - Add `.gitignore` (secrets, local env, OS cruft), placeholder `README.md`.
  - AC: `tree -L 2` shows the structure; nothing secret is tracked.
- [ ] **TASK-002 — Licensing**
  - Confirm MPL-2.0 obligations for the MarkdownTaskManager fork; add `NOTICE` +
    preserve upstream headers; add `LICENSE` (MIT for original code) and a short
    licensing note in README.
  - AC: adapted upstream file keeps MPL-2.0 header; original files marked MIT; §12/PRD honored.
- [ ] **TASK-003 — Frontmatter schema**
  - Write `docs/story.schema.json` (JSON Schema) + a human doc of every field
    (see PRD §6). Define enums for `status`/`priority`.
  - AC: schema validates the PRD example; invalid enum fails.
  - deps: —
- [ ] **TASK-004 — Story template + contributing guide**
  - `stories/_TEMPLATE.md` and `docs/CONTRIBUTING.md` (how to add/update a story, naming
    `TASK-<id>-<slug>.md`, commit convention `TASK-nnn: ...`).
  - AC: a new person can create a valid story by copying the template.
  - deps: TASK-003

## EPIC-1 — Data & content pipeline

- [ ] **TASK-010 — Seed stories**
  - Convert this backlog into real `stories/*.md` files with valid frontmatter.
  - AC: ≥ 8 stories spanning all four `status` columns; some with `depends_on`/`related`.
  - deps: TASK-003, TASK-004
- [ ] **TASK-011 — Manifest generator**
  - `scripts/build-manifest` scans `stories/*.md`, extracts frontmatter, emits
    `stories/index.json` (cards) — no runtime dependency the viewer can't fetch.
  - AC: running it produces `index.json` listing all stories with cached metadata.
  - deps: TASK-010
- [ ] **TASK-012 — Validation check**
  - Script/CI step validating every story against `story.schema.json` and rebuilding the
    manifest; fail on invalid or stale manifest.
  - AC: a bad enum or missing required field fails the check.
  - deps: TASK-011

## EPIC-2 — Board viewer (fork & adapt MarkdownTaskManager)

- [ ] **TASK-020 — Fork upstream into `board/`**
  - Import MarkdownTaskManager single HTML; keep MPL header; confirm it renders.
  - AC: `board/index.html` opens and shows an empty/default board.
  - deps: TASK-002
- [ ] **TASK-021 — Remote read-only load mode**
  - Config/URL param for a base URL; fetch `index.json`; render columns by `status`.
  - AC: pointing at a served `index.json` renders the correct cards in the right columns.
  - deps: TASK-011, TASK-020
- [ ] **TASK-022 — Frontmatter parsing**
  - Vanilla YAML-frontmatter parser (no new deps) → card model, replacing the native
    `### TASK-nnn | Title` parser.
  - AC: all schema fields surface on the card model.
  - deps: TASK-020
- [ ] **TASK-023 — Card + read-only detail view**
  - Card shows id/title/assignees/priority/tags/due; click lazy-loads and renders the
    story body (description, acceptance, subtasks, notes) read-only.
  - AC: clicking a card shows its rendered Markdown body; no write controls in remote mode.
  - deps: TASK-021, TASK-022
- [ ] **TASK-024 — Robust states & cross-browser**
  - Empty-board and fetch-error states; verify read mode on Chromium, Firefox, Safari.
  - AC: works in all three; graceful message on network error.
  - deps: TASK-023
- [ ] **(opt) TASK-025 — Retain local edit mode**
  - Adapt the File System Access edit path to per-file stories, or explicitly defer to
    MVP1.5 and document git-only editing.
  - AC: decision recorded; if kept, editing writes valid per-file Markdown.
  - deps: TASK-022

## EPIC-3 — Infrastructure (OCI + Gitea + Caddy)

- [ ] **TASK-030 — Provision OCI VM**
  - Always Free Ampere A1 (ARM), Ubuntu LTS; SSH key auth; basic hardening.
  - AC: reachable over SSH; non-root sudo user.
- [ ] **TASK-031 — Networking**
  - Open 22/80/443 in OCI security list/NSG **and** OS firewall (iptables gotcha).
  - AC: `curl` to 80/443 from outside reaches the VM.
  - deps: TASK-030
- [ ] **TASK-032 — Domain + DNS**
  - Free subdomain (DuckDNS) pointing at the VM public IP.
  - AC: subdomain resolves to the VM.
  - deps: TASK-030
- [ ] **TASK-033 — Compose stack: Gitea + Caddy**
  - `infra/docker-compose.yml` for Gitea + Caddy (auto-TLS); persistent volumes.
  - AC: Gitea UI reachable at `https://<subdomain>/` with a valid certificate.
  - deps: TASK-031, TASK-032
- [ ] **TASK-034 — Gitea init**
  - Admin user; org/repo for the project.
  - AC: can push to the repo over HTTPS/SSH.
  - deps: TASK-033
- [ ] **TASK-035 — Publish pipeline**
  - `post-receive` hook (or Gitea Actions): checkout `main` → `/srv/board`, run
    `build-manifest`; Caddy serves `/srv/board` static.
  - AC: a push updates the served board within seconds.
  - deps: TASK-011, TASK-034
- [ ] **(opt) TASK-036 — Access control docs**
  - Document optional Caddy basic-auth; keep public read-only for the demo.
  - AC: instructions to lock down the board without breaking Gitea auth.
  - deps: TASK-033

## EPIC-4 — Git workflow & portfolio mirror

- [ ] **TASK-040 — Remotes + mirror**
  - Configure Gitea push-mirror → GitHub (token), or documented manual dual remotes.
  - AC: a push to Gitea appears on GitHub with full history.
  - deps: TASK-034
- [ ] **TASK-041 — Conventions**
  - Commit/branch conventions; map commits ↔ story ids.
  - AC: documented in CONTRIBUTING; used by seed commits.
  - deps: TASK-004
- [ ] **TASK-042 — Verify history on GitHub**
  - AC: GitHub repo shows complete, readable history (portfolio-ready).
  - deps: TASK-040

## EPIC-5 — Docs & launch

- [ ] **TASK-050 — README (English, minimal + complete)**
  - Problem → solution & rationale → architecture → data model → self-host runbook →
    how to add a story → roadmap (MVP2/3). No unanswered questions for a copier.
  - AC: a stranger can reproduce the setup from the README alone.
  - deps: most of EPIC-2/3/4
- [ ] **TASK-051 — Diagrams**
  - Mermaid architecture + data-flow (reuse/refine PRD §5).
  - AC: renders on GitHub.
- [ ] **TASK-052 — End-to-end acceptance**
  - Fresh person opens link → sees board; editor adds a story → push → board updates.
  - AC: DoD (PRD §10) fully checked.
  - deps: EPIC-2, EPIC-3, EPIC-4
- [ ] **TASK-053 — Release**
  - Tag `v0.1.0`; short `CHANGELOG.md`.
  - AC: tag on GitHub + Gitea.
  - deps: TASK-052

---

# TASKS — MVP2 (AI control layer: understand + act)

Engineering breakdown for MVP2, derived from [PRD.md §14](./PRD.md#14-mvp2--ai-control-layer-understand-and-act-on-the-board).
Same conventions as MVP1 above. Seeded as `todo` stories under `stories/` (EPIC-007..012)
so this backlog is visible on the live board itself, dogfooding-style, same as MVP1 was.

The AI has two capabilities: **understand** (ask a question, get a graph-grounded answer)
and **act** (give an instruction, get a Gitea PR that a human reviews and merges — D11).
The graph (EPIC-007), context assembly (EPIC-008), and backend + auth (EPIC-009) are shared
foundations; the *ask* path finishes in EPIC-009, the *act* path is EPIC-012.

---

## Milestone sequence

```
EPIC-7 graph ─► EPIC-8 context ─► EPIC-9 backend + ask ─┬─► EPIC-12 act (propose via PR) ─┐
                                                        └────────────► EPIC-10 chat UI ────┴─► EPIC-11 launch
```

EPIC-9 (backend) needs EPIC-8 (context) to have something to send the model; EPIC-12 (act)
adds the write path on top of the same backend; EPIC-10 (chat UI) needs both EPIC-9 (ask)
and EPIC-12 (act) so it can render an answer *or* a "PR opened" result; EPIC-11 (launch)
needs all of them.

## EPIC-7 — Knowledge graph builder

- [ ] **TASK-070 — Graph schema & builder script**
  - Define `stories/graph.json`'s shape: one node per story (id/title/status/type) plus
    edges for `depends_on`/`blocks` (and their reverse: "blocked by"/"blocks" both
    queryable without an O(n) scan) and `epic` (reversed into per-epic child lists).
    `scripts/build-graph.mjs`, analogous to `build-manifest.mjs`.
  - AC: running it over the current `stories/` produces a valid graph with correct
    bidirectional edges for every relationship in the corpus.
  - deps: — (edges already exist in the schema, D3/G2)
- [ ] **TASK-071 — Wiki-link body resolution**
  - Parse `[[TASK-x]]`/`[[EPIC-x]]` references found **inside story bodies** (not just the
    frontmatter `related` array) into additional graph edges — the PRD always described
    wiki-links as graph edges (§6); MVP1 only ever parsed the frontmatter array.
  - AC: a `[[TASK-xxx]]` mention anywhere in a story's Markdown body shows up as an edge.
  - deps: TASK-070
- [ ] **TASK-072 — Wire into the publish pipeline**
  - Extend the existing `post-receive` hook / `validate-stories.mjs` to (re)build
    `graph.json` on every push, same as `index.json` today.
  - AC: pushing a story with a new `depends_on` edge updates `graph.json` on the live
    server with no manual step.
  - deps: TASK-070, TASK-035 (existing publish pipeline)

## EPIC-8 — Context assembly for the assistant

- [ ] **TASK-080 — Whole-corpus context assembler**
  - Given the current corpus size, start with the simplest correct approach (D9): one
    function that assembles **all** stories' frontmatter + body + the graph into one
    bounded text block — no embeddings, no vector DB, no ranking/selection.
  - AC: produces one context blob, under a defined token budget, from the full live
    corpus.
  - deps: TASK-070
  - Notes: explicitly *not* building retrieval/ranking yet (see PRD §14.4) — revisit only
    if story count grows enough to threaten the budget.
- [ ] **TASK-081 — Defensive size guard**
  - If the assembled context ever exceeds the model's budget, truncate/prioritize
    (drop story bodies before graph structure) rather than failing opaquely.
  - AC: an artificially oversized fixture triggers the truncation path predictably.
  - deps: TASK-080

## EPIC-9 — Assistant backend service (+ the ask path)

The shared backend for both capabilities: the service, the auth gate, the Gemini client,
and the read-only *ask* endpoint. The *act* endpoint is built on top of this in EPIC-12.

- [ ] **TASK-090 — Minimal API service scaffold**
  - Small Node.js HTTP service (matches existing `scripts/*.mjs` tooling — no new
    language, per D10), endpoints `POST /api/ask` (this epic) and `POST /api/propose`
    (EPIC-12); new Docker Compose service alongside `gitea`/`caddy`, mounting the
    `board-site` volume read-only to read the corpus; new Caddy `/api/*` route mirroring
    the existing `/git/*` block.
  - AC: a request through Caddy reaches the service end-to-end.
  - deps: — (infra already exists, EPIC-3)
- [ ] **TASK-091 — Gitea-token auth guard**
  - Verify the caller's bearer token against Gitea's `/api/v1/user` (same call
    `21-write.js`'s `fetchUsername()` already makes client-side) before doing anything
    else; reject missing/invalid tokens. No new auth system.
  - AC: no/bad token → rejected; a real logged-in user's token → accepted.
  - deps: TASK-090
- [ ] **TASK-092 — Gemini call**
  - Wire the assembled context (EPIC-8) + the user's question into a Gemini API call
    using a server-side-only API key (env var, never committed — same discipline as the
    Gitea admin/mirror secrets, §8); return the answer.
  - AC: a real question against the live corpus returns a real, relevant answer.
  - deps: TASK-091, TASK-080
- [ ] **TASK-093 — Basic abuse guard**
  - Simple per-user rate limit (e.g. N requests/minute) — cheap now that every request
    carries a real identity (TASK-091).
  - AC: rapid-fire requests from one account are throttled with a clear error, not
    silently billed forever.
  - deps: TASK-092

## EPIC-12 — AI write actions (propose via Gitea PR)

The "control everything" core (D11/D12): turn a natural-language instruction into an
auditable pull request. Built on the EPIC-9 backend; the model chooses bounded actions,
the backend validates + applies them and opens the PR.

- [ ] **TASK-120 — Action toolset definition**
  - Define the fixed set of tools the model may call (PRD §14.4): `set_status`,
    `set_field`, `add_tag`/`remove_tag`, `set_description`/`append_note`,
    `add_subtask`/`toggle_subtask`, `link`, `create_story`, `split_story`. Each maps 1:1 to
    a schema-safe mutation. The model chooses actions; it never emits file bytes.
  - AC: the toolset is expressed as a function-calling schema Gemini can target, and every
    tool corresponds to a documented, bounded file change.
  - deps: TASK-092 (shares the backend + Gemini client)
- [ ] **TASK-121 — Deterministic mutation applier**
  - Given one action + the story's current file content, produce the new content via
    fetch-merge-write: overlay only the named fields, preserve everything else
    byte-for-byte. This is the MVP1.5 data-loss lesson encoded as a rule
    (`board/scripts/21-write.js`'s `saveTask` is the reference for the fetch-merge shape).
  - AC: applying an action changes only what it names; a round-trip of a no-op action is
    byte-identical to the original file.
  - deps: TASK-120
- [ ] **TASK-122 — Pre-PR validation gate**
  - Before opening any PR, run the same schema + referential-integrity checks
    `validate-stories.mjs` runs over the proposed tree; refuse (clear message, no PR) on an
    invalid enum, malformed frontmatter, or a dangling `depends_on`/`blocks`/`related`/`epic`.
  - AC: an instruction that would create an invalid or dangling story is rejected with a
    reason and opens no PR.
  - deps: TASK-121
- [ ] **TASK-123 — Branch + PR creation via Gitea API**
  - Create a branch, PUT each changed file to it (Contents API — same endpoints
    `21-write.js` uses), and open a PR whose body records the verbatim instruction + a
    bulleted change summary. Authored with the logged-in user's token (D13); no new scope
    (`write:repository` already covers branches, contents, PRs).
  - AC: a valid instruction yields a real Gitea PR containing exactly the intended changes;
    `main` is untouched until it's merged; merging fires the existing hook and updates the
    board.
  - deps: TASK-122
- [ ] **TASK-124 — Guardrail + audit review**
  - Confirm the backend has no path that writes to `main`; confirm the PR body's audit
    trail; note the prompt-injection posture (bounded actions + human merge — PRD §14.6).
  - AC: a code path audit shows the only route to `main` is a human merge.
  - deps: TASK-123

## EPIC-10 — Chat UI in the board

- [ ] **TASK-100 — Chat panel (logged-in only)**
  - New additive script `board/scripts/22-assistant.js` (next number after
    `21-write.js`, same non-invasive layering — no vendored file touched). Panel/button
    gated on `window.__agileBoardWriteMode` (the same flag write-mode already sets);
    calls the new backend with the already-stored Gitea token.
  - AC: logged in, a typed question returns a rendered answer; logged out, no chat
    affordance renders at all.
  - deps: TASK-092
- [ ] **TASK-102 — Act result: proposed-change summary + PR link**
  - When the instruction was an *act* (not a question), render the plain-language change
    summary and a link to the opened PR (matching the interaction the user approved:
    "Done — opened PR #14: …"); render the validation-refusal message when the backend
    declined to open one.
  - AC: an act instruction shows the change summary + a working PR link; a refused
    instruction shows the reason and no PR link.
  - deps: TASK-100, TASK-123
- [ ] **TASK-101 — Loading/error states**
  - Pending indicator while waiting on the model (answers can take a few seconds; opening
    a PR longer); clear error on failure/throttling, reusing the existing
    `showNotification()` convention from write-mode.
  - AC: a slow or failed request always shows a clear state, never a silently stuck UI.
  - deps: TASK-100

## EPIC-11 — MVP2 docs & launch

- [ ] **TASK-110 — RUNBOOK: deploy the assistant backend**
  - New section: Gemini API key provisioning, the new Compose service, the Caddy route —
    same operational detail level as the existing OCI/Gitea sections.
  - AC: someone could stand up the backend from the runbook alone.
  - deps: TASK-090
- [ ] **TASK-111 — README + PRD sync**
  - Update README's architecture/roadmap to describe the shipped MVP2 feature — both
    *ask* and *act* (propose via PR) — mirroring how D6/write-mode was folded back in
    after MVP1.5 shipped.
  - deps: TASK-100, TASK-102, TASK-092
- [ ] **TASK-112 — End-to-end verification**
  - *Ask:* a logged-in user asks a real question spanning multiple related stories and
    gets a correct, graph-grounded answer. *Act:* an instruction like "mark TASK-092 done
    and split TASK-100 into a UI and an API story" opens a single Gitea PR with exactly
    those changes; `main` is unchanged until merge; merging updates the live board via the
    existing hook. An invalid instruction is refused with no PR. A logged-out visitor sees
    no AI affordance.
  - AC: PRD §14.7 Definition of Done fully checked.
  - deps: EPIC-7, EPIC-8, EPIC-9, EPIC-12, EPIC-10

---

## Roadmap tasks (tracked, not scheduled yet)

- **MVP3 — Auto-ingest:** transcript → extractor → proposed Gitea branch/PR →
  human approval → merge → board updates.
