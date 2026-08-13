/**
 * Resolve Recovery — Blocked Page
 *
 * Responsibilities:
 * - Read the blocked domain from ?site=
 * - Display the blocked domain
 * - Notify the background service worker
 * - Run the breathing exercise
 * - Display blocking statistics
 * - Handle recovery actions
 */

document.addEventListener("DOMContentLoaded", async () => {
  console.log("🛡️ Resolve blocked page loaded.");

  /* ---------------------------------------------------------------------- */
  /* Get blocked domain                                                     */
  /* ---------------------------------------------------------------------- */

  const params = new URLSearchParams(window.location.search);

  const site =
    params.get("site")?.trim() || "This website";

  console.log("🚫 Blocked site:", site);

  /* ---------------------------------------------------------------------- */
  /* Display blocked domain                                                 */
  /* ---------------------------------------------------------------------- */

  const blockedSiteElement =
    document.getElementById("blockedSite");

  if (blockedSiteElement) {
    blockedSiteElement.textContent =
      `${site} is blocked`;
  }

  /* ---------------------------------------------------------------------- */
  /* Notify background service worker                                       */
  /* ---------------------------------------------------------------------- */

  try {
    const response = await chrome.runtime.sendMessage({
      type: "RESOLVE_BLOCKED_PAGE_OPENED",
      domain: site,
      timestamp: Date.now(),
    });

    console.log(
      "📊 Resolve blocked-page event response:",
      response
    );

    /*
     * If the background service worker returns statistics,
     * display them immediately.
     */
    if (response?.success) {
      updateStatistics(response);
    }
  } catch (error) {
    console.warn(
      "⚠️ Could not notify Resolve background:",
      error
    );
  }

  /* ---------------------------------------------------------------------- */
  /* Breathing Exercise                                                     */
  /* ---------------------------------------------------------------------- */

  const breathingText =
    document.getElementById("breathingText");

  const circle =
    document.getElementById("circle");

  if (breathingText && circle) {
    let breathingIn = true;

    const updateBreathing = () => {
      if (breathingIn) {
        breathingText.textContent = "Breathe In";

        circle.classList.remove("breathe-out");
        circle.classList.add("breathe-in");
      } else {
        breathingText.textContent = "Breathe Out";

        circle.classList.remove("breathe-in");
        circle.classList.add("breathe-out");
      }

      breathingIn = !breathingIn;
    };

    updateBreathing();

    window.setInterval(
      updateBreathing,
      4000
    );
  }

  /* ---------------------------------------------------------------------- */
  /* Return To Safety                                                       */
  /* ---------------------------------------------------------------------- */

  const backButton =
    document.getElementById("back");

  backButton?.addEventListener("click", () => {
    /*
     * Never use history.back().
     *
     * The previous page may be the blocked website.
     */
    window.location.href = "about:blank";
  });

  /* ---------------------------------------------------------------------- */
  /* AI Coach                                                               */
  /* ---------------------------------------------------------------------- */

  const coachButton =
    document.getElementById("coach");

  coachButton?.addEventListener("click", () => {
    chrome.tabs.create({
      url:
        "https://resolve-web-two.vercel.app/",
    });
  });

  /* ---------------------------------------------------------------------- */
  /* Journal                                                                */
  /* ---------------------------------------------------------------------- */

  const journalButton =
    document.getElementById("journal");

  journalButton?.addEventListener("click", () => {
    chrome.tabs.create({
      url:
        "https://resolve-web-two.vercel.app/",
    });
  });
});

/* ==========================================================================
 * Statistics
 * ========================================================================== */

/**
 * Update statistics displayed on the blocked page.
 *
 * Supported response properties:
 *
 * {
 *   blockedToday: number,
 *   recoveryDays: number,
 *   moneySaved: number
 * }
 */
function updateStatistics(
  data: {
    blockedToday?: number;
    recoveryDays?: number;
    moneySaved?: number;
  }
): void {
  const blocksElement =
    document.getElementById("blocks");

  const streakElement =
    document.getElementById("streak");

  const moneyElement =
    document.getElementById("money");

  /* ---------------------------------------------------------------------- */
  /* Blocked Today                                                          */
  /* ---------------------------------------------------------------------- */

  if (blocksElement) {
    const blockedToday =
      Number(data.blockedToday ?? 0);

    blocksElement.textContent =
      String(blockedToday);
  }

  /* ---------------------------------------------------------------------- */
  /* Recovery Days                                                          */
  /* ---------------------------------------------------------------------- */

  if (streakElement) {
    const recoveryDays =
      Number(data.recoveryDays ?? 0);

    streakElement.textContent =
      String(recoveryDays);
  }

  /* ---------------------------------------------------------------------- */
  /* Money Saved                                                            */
  /* ---------------------------------------------------------------------- */

  if (moneyElement) {
    const moneySaved =
      Number(data.moneySaved ?? 0);

    moneyElement.textContent =
      `KES ${moneySaved.toLocaleString()}`;
  }
}