# Contributing

The board has no online editor in MVP1. All edits happen through git: clone, edit
Markdown, commit, push. The live board is a read-only rendering of whatever is on
`main`.

## Add a new story

1. Copy the template: `cp stories/_TEMPLATE.md stories/TASK-<id>-<slug>.md`
   (use `EPIC-<id>-<slug>.md` for an epic). Pick the next free numeric id.
2. Fill in the frontmatter — see the field reference below. Every field is documented
   inline in [`stories/_TEMPLATE.md`](../stories/_TEMPLATE.md).
3. Fill in the body: Description, Acceptance Criteria, Subtasks, Notes.
4. Validate locally: `node scripts/validate-stories.mjs`
5. Rebuild the manifest to preview the board locally (optional — the server does this
   on push): `node scripts/build-manifest.mjs`
6. Commit and push:
   ```
   git add stories/TASK-123-my-story.md
   git commit -m "TASK-123: add story for X"
   git push
   ```
   The board updates automatically after the push (see [PRD §8](./PRD.md#8-infrastructure--operations)).

## Update an existing story

Edit the file directly — e.g. change `status: todo` to `status: in-progress` to move
its card. Commit with a message referencing the id: `TASK-123: move to in-progress`.

## Field reference

| Field | Type | Required | Notes |
| --- | --- | --- | --- |
| `id` | string | yes | Must match the filename: `stories/<id>-<slug>.md`. |
| `title` | string | yes | Card title. |
| `status` | enum | yes | `todo` \| `in-progress` \| `in-review` \| `done`. Sets the board column. |
| `priority` | enum | yes | `low` \| `medium` \| `high` \| `critical`. |
| `category` | string | no | Freeform label (e.g. `infra`, `frontend`, `docs`). |
| `assignees` | string[] | no | Handles, e.g. `["@paulo"]`. |
| `epic` | string | no | Parent epic/project id. Also a future graph node. |
| `created` | date | yes | `YYYY-MM-DD`. |
| `started` / `due` / `finished` | date or null | no | `YYYY-MM-DD` or `null`. |
| `tags` | string[] | no | Free labels prefixed with `#`, e.g. `["#bug"]`. |
| `estimate` | number or null | no | Optional story points. |
| `depends_on` | id[] | no | This story needs those first. Graph edge (MVP2). |
| `blocks` | id[] | no | This story blocks those. Graph edge (MVP2). |
| `related` | `[[id]]`[] | no | Wiki-links to related stories/epics. Graph edge (MVP2). |

Full rationale for this schema: [PRD §6](./PRD.md#6-data-model--story-files).
The machine-readable version is [`story.schema.json`](./story.schema.json).

## Commit & branch conventions

- Reference the story id at the start of the commit message: `TASK-123: <what changed>`.
  For changes not tied to a story, use a short conventional prefix (`docs:`, `infra:`,
  `chore:`).
- Small, single-story edits can go straight to `main`.
- Larger or multi-file changes: use a short-lived branch (`task/123-short-name`) and
  open a PR on Gitea before merging to `main`.
- `main` is always the branch that gets published to the live board — see
  [PRD §9](./PRD.md#9-git-workflow--traceability).
