/**
 * Resolve Declarative Net Request Blocking Engine
 *
 * Responsibilities:
 * - Normalize blocked domains
 * - Remove old Resolve rules
 * - Install current Resolve BLOCK rules
 * - Support up to 30,000 dynamic rules
 * - Match domains and their subdomains
 */

const MAX_DYNAMIC_RULES = 30_000;

/**
 * Resolve owns this ID range:
 *
 * 100000 → 129999
 */
const RESOLVE_RULE_ID_START = 100_000;

/**
 * --------------------------------------------------------------------------
 * Get Current Rules
 * --------------------------------------------------------------------------
 */

export async function getBlockingRules(): Promise<
  chrome.declarativeNetRequest.Rule[]
> {
  if (!chrome.declarativeNetRequest) {
    throw new Error(
      "Declarative Net Request API is unavailable."
    );
  }

  try {
    return await chrome.declarativeNetRequest.getDynamicRules();
  } catch (error) {
    console.error(
      "❌ Failed to get Resolve blocking rules:",
      error
    );

    return [];
  }
}

/**
 * --------------------------------------------------------------------------
 * Determine Whether a Rule Belongs to Resolve
 * --------------------------------------------------------------------------
 *
 * We recognize:
 *
 * 1. Current Resolve rules
 *    IDs 100000 → 129999
 *
 * 2. Old Resolve redirect rules
 *    redirecting to /blocked.html
 *
 * This is important because older versions of Resolve used:
 *
 * action.type = "redirect"
 *
 * while the current version uses:
 *
 * action.type = "block"
 */

function isResolveRule(
  rule: chrome.declarativeNetRequest.Rule
): boolean {
  /**
   * Current Resolve rule ID range.
   */
  const hasResolveId =
    rule.id >= RESOLVE_RULE_ID_START &&
    rule.id <
      RESOLVE_RULE_ID_START + MAX_DYNAMIC_RULES;

  /**
   * Old Resolve rules redirected to blocked.html.
   */
  const isOldResolveRedirect =
    rule.action?.type === "redirect" &&
    rule.action.redirect?.extensionPath ===
      "/blocked.html";

  return (
    hasResolveId ||
    isOldResolveRedirect
  );
}

/**
 * --------------------------------------------------------------------------
 * Clear Resolve Rules
 * --------------------------------------------------------------------------
 *
 * Removes:
 *
 * - Current Resolve BLOCK rules
 * - Old Resolve REDIRECT rules
 *
 * Does NOT remove unrelated extension rules.
 */

export async function clearBlockingRules(): Promise<void> {
  if (!chrome.declarativeNetRequest) {
    throw new Error(
      "Declarative Net Request API is unavailable."
    );
  }

  try {
    const existingRules =
      await chrome.declarativeNetRequest.getDynamicRules();

    const resolveRules =
      existingRules.filter(isResolveRule);

    if (resolveRules.length === 0) {
      console.log(
        "🧹 No Resolve blocking rules to remove."
      );

      return;
    }

    const removeRuleIds =
      resolveRules.map(
        (rule) => rule.id
      );

    await chrome.declarativeNetRequest.updateDynamicRules({
      removeRuleIds,
    });

    console.log(
      `🧹 Resolve removed ${removeRuleIds.length} old rules.`
    );
  } catch (error) {
    console.error(
      "❌ Failed to clear Resolve blocking rules:",
      error
    );

    throw error;
  }
}

/**
 * --------------------------------------------------------------------------
 * Normalize Domain
 * --------------------------------------------------------------------------
 */

function normalizeDomain(
  value: string
): string {
  if (!value) {
    return "";
  }

  let domain =
    value
      .trim()
      .toLowerCase();

  if (!domain) {
    return "";
  }

  /**
   * Remove protocol.
   *
   * https://bet365.com
   * http://bet365.com
   */
  domain =
    domain.replace(
      /^https?:\/\//,
      ""
    );

  /**
   * Remove leading www.
   */
  domain =
    domain.replace(
      /^www\./,
      ""
    );

  /**
   * Remove everything after the hostname.
   *
   * example.com/path
   * becomes:
   *
   * example.com
   */
  domain =
    domain.split("/")[0];

  /**
   * Remove port.
   *
   * example.com:443
   * becomes:
   *
   * example.com
   */
  domain =
    domain.split(":")[0];

  return domain.trim();
}

/**
 * --------------------------------------------------------------------------
 * Apply Blocking Rules
 * --------------------------------------------------------------------------
 *
 * Given:
 *
 * [
 *   "bet365.com",
 *   "betway.com",
 *   "stake.com"
 * ]
 *
 * Resolve installs:
 *
 * ||bet365.com^
 * ||betway.com^
 * ||stake.com^
 *
 * with:
 *
 * action.type = "block"
 *
 * and:
 *
 * resourceTypes = ["main_frame"]
 */

export async function applyBlockingRules(
  sites: string[]
): Promise<void> {
  if (!chrome.declarativeNetRequest) {
    throw new Error(
      "Declarative Net Request API is unavailable."
    );
  }

  try {
    /**
     * ----------------------------------------------------------------------
     * Normalize + deduplicate
     * ----------------------------------------------------------------------
     */

    const uniqueSites = [
      ...new Set(
        (sites ?? [])
          .map(normalizeDomain)
          .filter(Boolean)
      ),
    ];

    /**
     * ----------------------------------------------------------------------
     * Respect Chrome dynamic rule limit
     * ----------------------------------------------------------------------
     */

    const limitedSites =
      uniqueSites.slice(
        0,
        MAX_DYNAMIC_RULES
      );

    console.log(
      `🔎 Resolve received ${uniqueSites.length} unique domains.`
    );

    console.log(
      `🔎 Resolve will install ${limitedSites.length} domains.`
    );

    /**
     * ----------------------------------------------------------------------
     * Find existing Resolve rules
     * ----------------------------------------------------------------------
     *
     * This includes the old redirect rules.
     */

    const existingRules =
      await chrome.declarativeNetRequest.getDynamicRules();

    const resolveRules =
      existingRules.filter(isResolveRule);

    const removeRuleIds =
      resolveRules.map(
        (rule) => rule.id
      );

    console.log(
      `🧹 Resolve found ${removeRuleIds.length} existing Resolve rules.`
    );

    /**
     * ----------------------------------------------------------------------
     * Empty blocking list
     * ----------------------------------------------------------------------
     */

    if (limitedSites.length === 0) {
      if (removeRuleIds.length > 0) {
        await chrome.declarativeNetRequest.updateDynamicRules({
          removeRuleIds,
        });

        console.log(
          `🧹 Resolve removed ${removeRuleIds.length} rules.`
        );
      }

      console.log(
        "🛡️ Resolve blocking list is empty."
      );

      return;
    }

    /**
     * ----------------------------------------------------------------------
     * Build BLOCK rules
     * ----------------------------------------------------------------------
     */

    const rules:
      chrome.declarativeNetRequest.Rule[] =
      limitedSites.map(
        (domain, index) => ({
          /**
           * Dedicated Resolve ID.
           */
          id:
            RESOLVE_RULE_ID_START +
            index,

          /**
           * Normal blocking priority.
           */
          priority: 1,

          /**
           * IMPORTANT:
           *
           * Current Resolve uses BLOCK.
           *
           * It does NOT redirect to blocked.html.
           */
          action: {
            type: "block",
          },

          condition: {
            /**
             * Domain + subdomain matching.
             *
             * ||bet365.com^
             *
             * matches:
             *
             * bet365.com
             * www.bet365.com
             * live.bet365.com
             * casino.bet365.com
             */
            urlFilter:
              `||${domain}^`,

            /**
             * Only block actual top-level
             * website navigation.
             */
            resourceTypes: [
              "main_frame",
            ],
          },
        })
      );

    /**
     * ----------------------------------------------------------------------
     * Install rules atomically
     * ----------------------------------------------------------------------
     *
     * Old Resolve rules are removed at the same time
     * new rules are added.
     *
     * This is important when switching from:
     *
     * REDIRECT → BLOCK
     */

    await chrome.declarativeNetRequest.updateDynamicRules({
      removeRuleIds,
      addRules: rules,
    });

    console.log(
      `🛡️ Resolve installed ${rules.length} BLOCK rules.`
    );

    console.log(
      "🌐 Resolve blocked domains:",
      limitedSites
    );
  } catch (error) {
    console.error(
      "❌ Resolve blocking rule installation failed:",
      error
    );

    throw error;
  }
}