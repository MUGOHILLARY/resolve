interface ResolveStats {
  streak: number;
  blockedToday: number;
  moneySaved: number;
  lastBlockedDate: string;
}

const DEFAULT_STATS: ResolveStats = {
  streak: 0,
  blockedToday: 0,
  moneySaved: 0,
  lastBlockedDate: "",
};

export async function loadStats() {
  const result = await chrome.storage.local.get("resolveStats");

  const stats: ResolveStats =
    result.resolveStats ?? DEFAULT_STATS;

  (
    document.getElementById("streak") as HTMLElement
  ).textContent = stats.streak.toString();

  (
    document.getElementById("money") as HTMLElement
  ).textContent = `KES ${stats.moneySaved.toLocaleString()}`;

  (
    document.getElementById("blocks") as HTMLElement
  ).textContent = stats.blockedToday.toString();
}

export async function recordBlockedAttempt() {
  const today = new Date().toDateString();

  const result = await chrome.storage.local.get("resolveStats");

  const stats: ResolveStats =
    result.resolveStats ?? DEFAULT_STATS;

  if (stats.lastBlockedDate !== today) {
    stats.blockedToday = 0;
    stats.lastBlockedDate = today;
  }

  stats.blockedToday++;

  // Approximate money saved per avoided gambling attempt
  stats.moneySaved += 250;

  await chrome.storage.local.set({
    resolveStats: stats,
  });
}