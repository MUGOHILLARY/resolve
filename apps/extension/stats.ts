/**
 * Resolve Recovery Statistics
 *
 * Responsibilities:
 * - Store blocking statistics
 * - Track blocked attempts today
 * - Track money saved
 * - Track recovery streak
 * - Provide statistics to the blocked recovery page
 */

export interface ResolveStats {
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

/* -------------------------------------------------------------------------- */
/* Get Statistics                                                             */
/* -------------------------------------------------------------------------- */

export async function getStats(): Promise<ResolveStats> {
  const result =
    await chrome.storage.local.get("resolveStats");

  const storedStats =
    result.resolveStats;

  if (!storedStats) {
    return {
      ...DEFAULT_STATS,
    };
  }

  return {
    ...DEFAULT_STATS,
    ...storedStats,
  };
}

/* -------------------------------------------------------------------------- */
/* Load Statistics Into UI                                                    */
/* -------------------------------------------------------------------------- */

/**
 * This function is intended for pages that contain:
 *
 * #streak
 * #money
 * #blocks
 *
 * It is not required by the background service worker.
 */
export async function loadStats(): Promise<void> {
  const stats = await getStats();

  const streakElement =
    document.getElementById("streak");

  const moneyElement =
    document.getElementById("money");

  const blocksElement =
    document.getElementById("blocks");

  if (streakElement) {
    streakElement.textContent =
      stats.streak.toString();
  }

  if (moneyElement) {
    moneyElement.textContent =
      `KES ${stats.moneySaved.toLocaleString()}`;
  }

  if (blocksElement) {
    blocksElement.textContent =
      stats.blockedToday.toString();
  }
}

/* -------------------------------------------------------------------------- */
/* Record Blocked Attempt                                                     */
/* -------------------------------------------------------------------------- */

export async function recordBlockedAttempt(): Promise<ResolveStats> {
  const today =
    new Date().toDateString();

  const stats =
    await getStats();

  /* ------------------------------------------------------------------------ */
  /* Reset daily counter when a new day begins                               */
  /* ------------------------------------------------------------------------ */

  if (
    stats.lastBlockedDate !== today
  ) {
    stats.blockedToday = 0;
    stats.lastBlockedDate = today;
  }

  /* ------------------------------------------------------------------------ */
  /* Record blocked attempt                                                   */
  /* ------------------------------------------------------------------------ */

  stats.blockedToday++;

  /* ------------------------------------------------------------------------ */
  /* Money saved                                                              */
  /* ------------------------------------------------------------------------ */

  /**
   * Approximate amount saved per avoided
   * gambling attempt.
   *
   * This can later be replaced with a
   * user-configurable amount.
   */
  stats.moneySaved += 250;

  /* ------------------------------------------------------------------------ */
  /* Save                                                                     */
  /* ------------------------------------------------------------------------ */

  await chrome.storage.local.set({
    resolveStats: stats,
  });

  console.log(
    "📊 Resolve statistics updated:",
    stats
  );

  return stats;
}