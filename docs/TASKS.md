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

## Roadmap tasks (tracked, not scheduled for MVP1)

- **MVP2 — Ask & relate:** graph builder from frontmatter edges + `[[wiki-links]]`;
  retrieval over bodies; chat panel in the board; model selection (Gemini/Claude).
- **MVP3 — Auto-ingest:** transcript → extractor → proposed Gitea branch/PR →
  human approval → merge → board updates.
