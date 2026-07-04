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
2. Image: **Ubuntu** (latest LTS). Shape: **VM.Standard.A1.Flex** (Ampere ARM,
   Always Free-eligible) — 2-4 OCPUs / 12-24 GB RAM is comfortably within the
   Always Free ARM allowance.
3. Add your SSH public key under "Add SSH keys".
4. Create/reuse a VCN with a public subnet, and assign a public IPv4 address.
5. **Known gotcha:** Always Free Ampere capacity is sometimes exhausted in a given
   Availability Domain. If creation fails with an out-of-capacity error, retry in
   another AD, or try again later — this is common and not a configuration problem.
6. Once running, note the public IP and confirm SSH access:
   ```
   ssh ubuntu@<public-ip>
   ```

## 2. Networking (the two-firewall gotcha)

OCI requires ports to be open in **both** places — missing either one leaves the
port closed:

1. **Cloud-level**: VCN → the instance's subnet → Security List (or a Network
   Security Group attached to the instance) → add ingress rules for TCP 22, 80, 443
   from `0.0.0.0/0`.
2. **OS-level**: Oracle's Ubuntu images ship a restrictive default `iptables`
   ruleset. On the VM:
   ```
   sudo iptables -I INPUT 6 -m state --state NEW -p tcp --dport 80 -j ACCEPT
   sudo iptables -I INPUT 6 -m state --state NEW -p tcp --dport 443 -j ACCEPT
   sudo netfilter-persistent save   # persist across reboots (package: iptables-persistent)
   ```
3. Verify from your own machine: `curl -I http://<public-ip>` should connect
   (connection refused/timeout means one of the two firewalls above is still closed).

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
   certificate and Gitea's first-run install screen.

## 6. Gitea first-run setup

1. Complete Gitea's install screen (it should already have sane defaults from the
   environment variables in `docker-compose.yml`) and create the **admin account**
   when prompted.
2. As the admin, create an organization (or just use your user) and a new,
   empty repository to hold this project, e.g. `agile-board`.
3. Push this repo to it:
   ```
   git remote add gitea https://<your-domain>/git/<owner>/agile-board.git
   git push gitea main
   ```
   (Or over SSH: `git remote add gitea ssh://git@<your-domain>:2222/<owner>/agile-board.git`.)

## 7. Install the publish hook

The hook in [`infra/hooks/post-receive`](../infra/hooks/post-receive) checks a push
out directly into `/srv/board` and rebuilds `stories/index.json`. Install it into
the bare repository Gitea created:
```
docker compose cp infra/hooks/post-receive gitea:/data/git/repositories/<owner>/agile-board.git/hooks/post-receive
docker compose exec --user root gitea chmod +x /data/git/repositories/<owner>/agile-board.git/hooks/post-receive
```
`/data/git/repositories` is Gitea's default `repository.ROOT` — if you changed
that setting, adjust the path accordingly.

Push again (or `git push gitea main` if step 6 was the only push so far) and check:
```
docker compose logs gitea | grep agile-board
```
You should see `agile-board: published <sha> to /srv/board`. Visit
`https://<your-domain>/board/` — the live board should now render.

## 8. Mirror to GitHub

In the Gitea repo → **Settings → Repository → Push Mirror**, add
`https://github.com/<you>/agile-board.git` with a
[GitHub personal access token](https://github.com/settings/tokens) (repo scope) as
the credential. Gitea will push every update to GitHub automatically, keeping full
history there for the portfolio. (Alternative, no mirror feature needed: add GitHub
as a second `git remote` locally and `git push` to both — more manual, but zero
extra config on the server.)

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
