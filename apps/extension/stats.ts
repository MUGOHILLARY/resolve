/**
 * Resolve Premium Recovery Statistics
 *
 * Responsibilities:
 * - Track current recovery streak
 * - Track best recovery streak
 * - Track blocked attempts today
 * - Track lifetime blocked attempts
 * - Track money saved today
 * - Track lifetime money saved
 * - Track last blocked/recovery dates
 * - Maintain daily history
 */

export interface DailyStats {
  date: string;
  blocked: number;
  moneySaved: number;
}

export interface ResolveStats {
  streak: number;
  bestStreak: number;

  blockedToday: number;
  moneySavedToday: number;

  totalBlocked: number;
  moneySaved: number;

  lastBlockedDate: string;
  lastRecoveryDate: string;

  dailyHistory: DailyStats[];
}

export const DEFAULT_STATS: ResolveStats = {
  streak: 0,
  bestStreak: 0,

  blockedToday: 0,
  moneySavedToday: 0,

  totalBlocked: 0,
  moneySaved: 0,

  lastBlockedDate: "",
  lastRecoveryDate: "",

  dailyHistory: [],
};

const STORAGE_KEY = "resolveStats";

/**
 * Approximate amount saved for each successfully
 * blocked gambling attempt.
 */
const MONEY_SAVED_PER_BLOCK = 250;

/* -------------------------------------------------------------------------- */
/* Date Helpers                                                               */
/* -------------------------------------------------------------------------- */

function getToday(): string {
  return new Date().toDateString();
}

function getYesterday(): string {
  const date = new Date();

  date.setDate(
    date.getDate() - 1
  );

  return date.toDateString();
}

/* -------------------------------------------------------------------------- */
/* Get Statistics                                                             */
/* -------------------------------------------------------------------------- */

export async function getStats(): Promise<ResolveStats> {
  const result =
    await chrome.storage.local.get(
      STORAGE_KEY
    );

  const stored =
    result[STORAGE_KEY] as
      | Partial<ResolveStats>
      | undefined;

  return {
    ...DEFAULT_STATS,
    ...stored,

    dailyHistory:
      Array.isArray(
        stored?.dailyHistory
      )
        ? stored.dailyHistory
        : [],
  };
}

/* -------------------------------------------------------------------------- */
/* Save Statistics                                                            */
/* -------------------------------------------------------------------------- */

async function saveStats(
  stats: ResolveStats
): Promise<void> {
  await chrome.storage.local.set({
    [STORAGE_KEY]: stats,
  });
}

/* -------------------------------------------------------------------------- */
/* Ensure Daily Record                                                        */
/* -------------------------------------------------------------------------- */

function ensureTodayRecord(
  stats: ResolveStats,
  today: string
): DailyStats {
  let record =
    stats.dailyHistory.find(
      (item) =>
        item.date === today
    );

  if (!record) {
    record = {
      date: today,
      blocked: 0,
      moneySaved: 0,
    };

    stats.dailyHistory.push(
      record
    );
  }

  return record;
}

/* -------------------------------------------------------------------------- */
/* Record Blocked Attempt                                                     */
/* -------------------------------------------------------------------------- */

export async function recordBlockedAttempt(): Promise<ResolveStats> {
  const today =
    getToday();

  const yesterday =
    getYesterday();

  const stats =
    await getStats();

  /* ------------------------------------------------------------------------ */
  /* Daily rollover                                                           */
  /* ------------------------------------------------------------------------ */

  if (
    stats.lastBlockedDate !==
    today
  ) {
    stats.blockedToday = 0;
    stats.moneySavedToday = 0;
  }

  /* ------------------------------------------------------------------------ */
  /* Block attempt                                                            */
  /* ------------------------------------------------------------------------ */

  stats.blockedToday += 1;

  stats.totalBlocked += 1;

  stats.moneySavedToday +=
    MONEY_SAVED_PER_BLOCK;

  stats.moneySaved +=
    MONEY_SAVED_PER_BLOCK;

  stats.lastBlockedDate =
    today;

  /* ------------------------------------------------------------------------ */
  /* Daily history                                                            */
  /* ------------------------------------------------------------------------ */

  const todayRecord =
    ensureTodayRecord(
      stats,
      today
    );

  todayRecord.blocked += 1;

  todayRecord.moneySaved +=
    MONEY_SAVED_PER_BLOCK;

  /* ------------------------------------------------------------------------ */
  /* Recovery streak                                                          */
  /* ------------------------------------------------------------------------ */

  /**
   * A blocked attempt demonstrates that Resolve
   * successfully interrupted the behavior.
   *
   * We only advance the streak once per day.
   */
  if (
    stats.lastRecoveryDate !==
    today
  ) {
    if (
      stats.lastRecoveryDate ===
      yesterday
    ) {
      stats.streak += 1;
    } else {
      stats.streak = 1;
    }

    stats.bestStreak =
      Math.max(
        stats.bestStreak,
        stats.streak
      );

    stats.lastRecoveryDate =
      today;
  }

  /* ------------------------------------------------------------------------ */
  /* Keep history bounded                                                     */
  /* ------------------------------------------------------------------------ */

  stats.dailyHistory =
    stats.dailyHistory
      .sort(
        (a, b) =>
          new Date(b.date).getTime() -
          new Date(a.date).getTime()
      )
      .slice(0, 90);

  /* ------------------------------------------------------------------------ */
  /* Save                                                                     */
  /* ------------------------------------------------------------------------ */

  await saveStats(stats);

  console.log(
    "📊 Resolve premium statistics updated:",
    stats
  );

  return stats;
}

/* -------------------------------------------------------------------------- */
/* Premium Statistics Snapshot                                                */
/* -------------------------------------------------------------------------- */

export async function getStatsSnapshot(): Promise<ResolveStats> {
  const stats =
    await getStats();

  const today =
    getToday();

  /*
   * Present a clean daily view even when
   * no attempt has happened today.
   */
  if (
    stats.lastBlockedDate !==
    today
  ) {
    return {
      ...stats,

      blockedToday: 0,
      moneySavedToday: 0,
    };
  }

  return stats;
}

/* -------------------------------------------------------------------------- */
/* Load Statistics Into UI                                                    */
/* -------------------------------------------------------------------------- */

export async function loadStats(): Promise<void> {
  const stats =
    await getStatsSnapshot();

  const streakElement =
    document.getElementById(
      "streak"
    );

  const moneyElement =
    document.getElementById(
      "money"
    );

  const blocksElement =
    document.getElementById(
      "blocks"
    );

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
/* Reset Statistics — Development/Test Only                                   */
/* -------------------------------------------------------------------------- */

/**
 * Development helper.
 *
 * Do not expose this through the production UI.
 */
export async function resetStats(): Promise<void> {
  await chrome.storage.local.set({
    [STORAGE_KEY]: {
      ...DEFAULT_STATS,
      dailyHistory: [],
    },
  });

  console.log(
    "🧹 Resolve statistics reset."
  );
}