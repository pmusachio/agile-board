// Simple in-memory per-user sliding-window rate limit (TASK-093). Cheap
// insurance now that every request carries a real Gitea identity (TASK-091)
// — not meant to survive a process restart or scale across replicas, just
// to stop one account from silently running up the Gemini quota.
const WINDOW_MS = 60_000;
const MAX_PER_WINDOW = 10;

const hits = new Map(); // username -> timestamps[]

export function checkRateLimit(username, now = Date.now()) {
  const timestamps = (hits.get(username) || []).filter((t) => now - t < WINDOW_MS);
  if (timestamps.length >= MAX_PER_WINDOW) {
    hits.set(username, timestamps);
    return { allowed: false, retryAfterMs: WINDOW_MS - (now - timestamps[0]) };
  }
  timestamps.push(now);
  hits.set(username, timestamps);
  return { allowed: true };
}
