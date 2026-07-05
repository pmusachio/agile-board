// Verifies a caller's Gitea bearer token the same way board/scripts/21-write.js's
// fetchUsername() already does client-side (GET /api/v1/user) — no new auth
// system, no new scope. See docs/PRD.md #14.3.
export async function verifyGiteaToken(giteaBaseUrl, token) {
  if (!token) return null;
  let res;
  try {
    res = await fetch(new URL('api/v1/user', giteaBaseUrl), {
      headers: { Authorization: `token ${token}` },
    });
  } catch {
    return null; // network error talking to Gitea — treat as unauthenticated, not a crash
  }
  if (!res.ok) return null;
  const body = await res.json();
  return body.login || null;
}
