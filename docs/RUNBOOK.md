# Runbook — self-hosting agile-board on Oracle Cloud (Always Free)

Step-by-step provisioning for the Gitea + Caddy stack in [`infra/`](../infra/), on
Oracle Cloud Infrastructure's Always Free tier. See [PRD §8](./PRD.md#8-infrastructure--operations)
for the architecture this implements.

## Prerequisites

- An OCI account (Always Free tier is enough).
- A free DNS name, e.g. from [DuckDNS](https://www.duckdns.org/) — Caddy needs a real
  domain to issue a TLS certificate; a bare IP address won't work.
- `docker` and the `docker compose` plugin will be installed on the VM (steps below);
  you don't need them locally unless you want to test the stack elsewhere first.

## 1. Provision the VM

1. OCI Console → **Compute → Instances → Create Instance**.
2. Image: **Ubuntu** (latest LTS). Preferred shape: **VM.Standard.A1.Flex** (Ampere
   ARM, Always Free-eligible) — 2-4 OCPUs / 12-24 GB RAM is comfortably within the
   Always Free ARM allowance. In practice you may instead end up on
   **VM.Standard.E2.1.Micro** (the x86 Always Free shape, 1 OCPU / 1GB RAM, no swap)
   — either OCI capacity or how you clicked through "let Oracle choose" can land you
   there. Both are $0 on Always Free; if you get the small one, add swap (§1a below)
   before deploying the stack.
3. **Add SSH keys**: either paste a public key you already have (recommended — you
   already hold the matching private key), or use "Generate a key pair for me", in
   which case OCI has your *browser* download the private key file (something like
   `ssh-key-<date>.key`) — it lands wherever your browser saves downloads (e.g.
   `~/Downloads`) on whatever machine you clicked "Create" from. You'll need that
   file (not just the `.pub`) to SSH in; `chmod 600` it first.
4. Create/reuse a VCN with a public subnet, and assign a public IPv4 address.
5. **Known gotcha:** Always Free Ampere capacity is sometimes exhausted in a given
   Availability Domain. If creation fails with an out-of-capacity error, retry in
   another AD, or try again later — this is common and not a configuration problem.
6. Once running, note the public IP and confirm SSH access:
   ```
   ssh -i /path/to/your.key ubuntu@<public-ip>
   ```

### 1a. If you ended up on the small (1GB RAM) shape

No swap is configured by default, and Gitea + Caddy in Docker is tight in 1GB.
Add a 2GB swapfile once, before deploying the stack:
```
sudo fallocate -l 2G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile
echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab
```

## 2. Networking (the two-firewall gotcha)

OCI requires ports to be open in **both** places — missing either one leaves the
port closed:

1. **Cloud-level**: this is a Security List (or NSG), not the instance's own
   "Security" tab — that tab is about Shielded Instance settings (Secure Boot, TPM)
   and has nothing to do with network ports; it's an easy wrong turn. From the
   instance's detail page: click the **"Network"** tab instead → click through to
   the attached VNIC → the subnet → the VCN → **Security Lists** in the VCN's left
   menu → the default list → **Add Ingress Rules**. Add TCP 22, 80, and 443, each
   with Source CIDR `0.0.0.0/0`. (Equivalent path: ☰ menu → Networking → Virtual
   Cloud Networks → your VCN → Security Lists.)
2. **OS-level**: Oracle's Ubuntu images ship a default `iptables` ruleset that
   REJECTs everything except SSH. Insert ACCEPT rules for 80/443 *before* that
   final REJECT rule — find its line number rather than assuming one, since it
   varies by image:
   ```
   sudo iptables -L INPUT -n --line-numbers   # note the line number of the trailing REJECT rule, call it N
   sudo iptables -I INPUT N   -m state --state NEW -p tcp --dport 80  -j ACCEPT
   sudo iptables -I INPUT N+1 -m state --state NEW -p tcp --dport 443 -j ACCEPT   # literally N+1, e.g. if N=5 use 6
   sudo netfilter-persistent save   # persist across reboots (package: iptables-persistent)
   ```
3. Verify from your own machine (not from inside an SSH session into the VM):
   `curl -I http://<public-ip>` should connect once both firewalls are open. A
   **timeout** usually means the cloud-level Security List rule (step 1) hasn't
   taken effect; **connection refused** usually points at the OS-level rule
   (step 2) still being the blocker.

## 3. DNS

Point your DuckDNS (or other free dynamic-DNS) subdomain at the VM's public IP,
e.g. `board-demo.duckdns.org → <public-ip>`. Confirm with `dig +short <your-domain>`
before continuing — Caddy's automatic HTTPS will fail until this resolves correctly.

## 4. Install Docker

On the VM:
```
curl -fsSL https://get.docker.com | sh
sudo usermod -aG docker $USER
newgrp docker
docker compose version   # confirm the compose plugin is present
```

## 5. Deploy the stack

1. Get `infra/` onto the VM — either clone this repo there, or `scp -r infra/ ubuntu@<ip>:~/agile-board-infra`.
2. `cd` into that directory and set the domain:
   ```
   cp .env.example .env
   # edit .env: DOMAIN=board-demo.duckdns.org
   ```
3. Build and start:
   ```
   docker compose up -d --build
   ```
4. **One-time volume ownership fix** (the `board-site` volume starts root-owned;
   Gitea's post-receive hook writes to it as UID 1000):
   ```
   docker compose run --rm --user root gitea sh -c "mkdir -p /srv/board && chown -R 1000:1000 /srv/board"
   docker compose restart gitea
   ```
5. Visit `https://<your-domain>/git/` — Caddy should present a valid Let's Encrypt
   certificate. If it doesn't yet (a TLS error, or `docker compose logs caddy`
   shows `"Timeout during connect (likely firewall problem)"`), §2 isn't fully
   open yet — fix that first. **Note:** after several failed attempts Caddy
   automatically falls back to Let's Encrypt's *staging* CA (to avoid burning
   the production rate limit) — a staging cert isn't trusted by browsers. Once
   §2 is genuinely fixed, `docker compose restart caddy` to force a clean
   attempt against production rather than waiting for the next backoff/retry.

## 6. Gitea first-run setup

`docker-compose.yml` sets `GITEA__security__INSTALL_LOCK=true`, so Gitea boots
straight into a ready SQLite instance — **the web install wizard never
appears**. Create the admin account and the repo without touching a browser:

1. Create the admin user:
   ```
   docker compose exec -u git gitea gitea admin user create \
     --username <you> --email <you@example.com> --admin --must-change-password=false \
     --password '<a-strong-password>'
   ```
   Don't let this password linger in your shell history/logs any more than
   necessary — change it via Gitea's UI afterward if you'd rather not have it
   in a terminal scrollback.
2. Create the repo via the API (avoids the UI entirely):
   ```
   curl -u '<you>:<that-password>' -X POST "https://<your-domain>/git/api/v1/user/repos" \
     -H 'Content-Type: application/json' \
     -d '{"name":"agile-board","description":"agile-board","private":false}'
   ```
   The response's `clone_url` is what you push to next.
3. Push this repo to it:
   ```
   git remote add gitea https://<your-domain>/git/<owner>/agile-board.git
   git push gitea main
   ```
   (Or over SSH: `git remote add gitea ssh://git@<your-domain>:2222/<owner>/agile-board.git`
   — but that needs your key added to the Gitea *user* account separately from
   the VM's own SSH, since Gitea runs its own internal SSH server on the 2222
   mapping; the HTTPS route above is simpler for a first push.)

   For repeated/scripted pushes without typing the password each time, create
   a scoped access token instead of reusing the password:
   ```
   curl -u '<you>:<that-password>' -X POST "https://<your-domain>/git/api/v1/users/<you>/tokens" \
     -H 'Content-Type: application/json' -d '{"name":"push","scopes":["write:repository"]}'
   git -c http.extraHeader="Authorization: token <sha1-from-response>" push https://<your-domain>/git/<owner>/agile-board.git main
   ```

## 7. Install the publish hook

The hook in [`infra/hooks/post-receive`](../infra/hooks/post-receive) checks a push
out directly into `/srv/board` and rebuilds `stories/index.json`. Confirm the bare
repository's real path first rather than assuming it — it's usually
`/data/git/repositories/<owner>/agile-board.git` (Gitea's default
`repository.ROOT`), but don't guess:
```
docker compose exec -T gitea find /data -maxdepth 4 -iname '*.git' -type d
```
Then install the hook — going through a `docker compose cp` of a *local* copy of
the file is more reliable than a relative path from wherever your shell happens to
be `cd`'d into on the VM:
```
scp infra/hooks/post-receive ubuntu@<public-ip>:/tmp/post-receive
docker compose cp /tmp/post-receive gitea:<path-from-above>/hooks/post-receive
docker compose exec -u root gitea sh -c 'chmod +x <path-from-above>/hooks/post-receive && chown git:git <path-from-above>/hooks/post-receive'
```

Push again (or `git push gitea main` if step 6 was the only push so far) and check:
```
docker compose logs gitea | grep agile-board
```
You should see `agile-board: published <sha> to /srv/board`. Visit
`https://<your-domain>/board/` — the live board should now render. If instead you
see a Node `ERR_MODULE_NOT_FOUND` for `scripts/lib/frontmatter.mjs`, check your
`.gitignore` doesn't have a stray generic `lib/` rule silently excluding it from
what actually got pushed (this happened once — a leftover from an unrelated
project template).

## 8. Mirror to GitHub

In the Gitea repo → **Settings → Repository → Push Mirror**, add
`https://github.com/<you>/agile-board.git` with a
[GitHub personal access token](https://github.com/settings/tokens) (repo scope) as
the credential. **Both** the username and the token fields need to actually be
filled in and saved — if the mirror is created without them, it fails *silently*
on every sync attempt with `could not read Username for 'https://github.com':
terminal prompts disabled`, and simply re-saving the settings doesn't always
pick the credentials back up. If you hit that error, delete the push mirror and
re-add it from scratch with both fields filled in.

Verify it's actually working (don't just trust that it's configured):
```
curl -H "Authorization: token <your-gitea-token>" \
  "https://<your-domain>/git/api/v1/repos/<owner>/agile-board/push_mirrors"
```
`last_error` should be empty. **`sync_on_commit: true` in that response doesn't
mean "syncs within seconds of a push"** — in practice it can sit until the next
scheduled interval (which defaults to roughly a day) unless nudged. To force an
immediate sync, either click **"Synchronize Now"** next to the mirror in the
settings page, or call the same thing from a script (the token scope this
runbook already uses, `write:repository`, is enough — no admin scope needed):
```
curl -X POST -H "Authorization: token <your-gitea-token>" \
  "https://<your-domain>/git/api/v1/repos/<owner>/agile-board/push_mirrors-sync"
```

(Alternative, no mirror feature needed: add GitHub as a second `git remote`
locally and `git push` to both — more manual, but zero extra config on the
server.)

## 9. Optional: lock the board down

The board is public read-only by design for the MVP1 demo (PRD §8). To restrict it
instead, add HTTP basic auth in the Caddyfile's board `handle` block:
```
handle {
    basicauth {
        <username> <bcrypt-hash>
    }
    root * /srv/board
    file_server
}
```
Generate the hash with `docker compose exec caddy caddy hash-password`. This only
gates the static board — Gitea's own auth is unaffected.

## 10. Enable write access from the board (login, drag-and-drop, editing)

`board/scripts/21-write.js` lets a logged-in user drag cards between columns
and edit a story through the same modal upstream already ships, persisting
through Gitea's Contents API (see [PRD](./PRD.md) for the design). Two
one-time steps on the Gitea side, no new infrastructure:

1. **Confirm self-registration is open** — visit
   `https://<your-domain>/git/user/sign_up`; if it shows a normal registration
   form (not redirected to login / a "registration disabled" notice),
   anyone can already create their own Gitea account with no approval from
   you. If it's disabled and you want it open, set
   `GITEA__service__DISABLE_REGISTRATION=false` in `infra/docker-compose.yml`'s
   `gitea` service and `docker compose up -d`.
2. **Register a public (PKCE) OAuth2 application** — log into Gitea and go to
   **Settings → Applications** (a personal application is enough; an admin
   isn't required), then "Create a new OAuth2 Application":
   - Name: `agile-board`.
   - Redirect URI: `https://<your-domain>/board/` — must be the *exact*
     string the board is served at (confirm with
     `curl -sS -o /dev/null -w '%{url_effective}\n' -L https://<your-domain>/board`;
     Gitea does exact-string matching, no wildcards).
   - Leave it as a **public client** (no client secret) — PKCE covers the
     security a confidential client would otherwise need, and there's nowhere
     safe to keep a secret in a static SPA anyway.
3. Copy the resulting **Client ID** (not secret — safe to commit) into
   `board/scripts/21-write.js`'s `GITEA_CLIENT_ID` constant, and deploy that
   change (push to `main` as usual — the publish hook picks it up like any
   other file).

Verify: open the board, click "Log in with Gitea" (self-register if you
don't have an account), confirm the button changes to "logged in as
@you", then drag a card to a different column. Check
`https://<your-domain>/git/<owner>/agile-board/commits/main` — a new commit
authored by that Gitea user should appear, and a local `git pull` should see
it too. This should be indistinguishable from a manual git push: it's the
same commit → `post-receive` hook → `stories/index.json` rebuild pipeline
either way.

## 11. Deploy the MVP2 assistant backend (Gemini + write actions)

Code is written and locally verified (`assistant/server.mjs`, `assistant/lib/*.mjs`,
`scripts/lib/context.mjs`) — this section is the remaining live-deployment steps, held back
for your explicit go-ahead since it changes shared production infra (new container, new
Caddy route). Nothing below is destructive to the existing Gitea/Caddy setup: the new
service has no host port (only reachable via Caddy) and the new Caddy block is additive.

### 11.1 Get a Gemini API key (D7)

1. Go to [Google AI Studio](https://ai.google.dev/) and create an API key (a Google account,
   separate from everything else this project uses — this is the one external cloud-account
   credential MVP2 needs).
2. Do **not** paste the key into chat/commands where it could be echoed. Add it directly to
   `infra/.env` on the VM (create it from `infra/.env.example` if it doesn't exist yet):
   ```
   GEMINI_API_KEY=<your key>
   ```
   `infra/.env` is gitignored — never commit it.

### 11.2 Get the new code onto the VM

The deployed `agile-board-infra/` directory on the VM mirrors this repo's `infra/` only
(not the whole repo) — `scripts/lib/` and `assistant/` need to land alongside it, as
siblings, matching this repo's own root layout (`assistant.Dockerfile`'s build context is
`..` relative to `docker-compose.yml`, i.e. one level up from `agile-board-infra/`):

```
# from your local clone:
tar czf /tmp/assistant-deploy.tar.gz scripts/lib assistant infra/docker-compose.yml infra/Caddyfile infra/assistant.Dockerfile
scp /tmp/assistant-deploy.tar.gz ubuntu@<vm-ip>:/tmp/
ssh ubuntu@<vm-ip>
  tar xzf /tmp/assistant-deploy.tar.gz -C /home/ubuntu scripts assistant
  tar xzf /tmp/assistant-deploy.tar.gz -C /home/ubuntu/agile-board-infra --strip-components=1 infra
  rm /tmp/assistant-deploy.tar.gz
```

(A future improvement worth considering once this is stable: publish this code from the
same Gitea repo the board already lives in, so a push updates it the same way `stories/`
updates the board — today it's a manual step, same as the original `infra/` deploy was.)

### 11.3 Build and start the new service

From `/home/ubuntu/agile-board-infra/` on the VM:
```
docker compose build assistant-api
docker compose up -d assistant-api
docker compose up -d caddy   # picks up the new /api/* block in Caddyfile
```

### 11.4 Verify

```
curl -s https://<your-domain>/api/health
# {"ok":true}

curl -s -X POST https://<your-domain>/api/ask \
  -H "Authorization: token <a real Gitea token with read:user scope>" \
  -H "Content-Type: application/json" \
  -d '{"question":"what blocks TASK-092?"}'
# {"answer": "...", "askedBy": "..."}
```

Without `GEMINI_API_KEY` set, the second call correctly returns
`503 {"error":"assistant not configured (missing GEMINI_API_KEY)"}` instead of a crash —
that's expected until 11.1 is done. Without a valid token, both auth-guarded calls return
`401`. More than 10 requests/minute from one account returns `429` (basic abuse guard).

## Verifying the whole loop

1. Open `https://<your-domain>/board/` in a browser you haven't used for this
   project — it should show the live board, read-only.
2. Locally: edit a story's `status` in `stories/*.md`, run
   `node scripts/validate-stories.mjs`, commit, and `git push gitea main`.
3. Reload `https://<your-domain>/board/` — the card should have moved columns.

If step 3 doesn't reflect the change within a few seconds, check
`docker compose logs gitea` for hook errors first (most common causes: hook not
executable, wrong repository path, or the `board-site` volume ownership step in
§5 was skipped).
