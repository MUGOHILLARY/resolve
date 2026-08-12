const MAX_DYNAMIC_RULES = 30_000;

/**
 * Resolve owns this ID range.
 *
 * 100000 - 129999
 *
 * This prevents collisions with old rules using IDs 1, 2, 3...
 */
const RESOLVE_RULE_ID_START = 100_000;

/**
 * Get all currently installed dynamic rules.
 */
export async function getBlockingRules(): Promise<
  chrome.declarativeNetRequest.Rule[]
> {
  try {
    if (!chrome.declarativeNetRequest) {
      throw new Error(
        "Declarative Net Request API is unavailable."
      );
    }

    const rules =
      await chrome.declarativeNetRequest.getDynamicRules();

    return rules;
  } catch (error) {
    console.error(
      "❌ Failed to get Resolve blocking rules:",
      error
    );

    return [];
  }
}

/**
 * Determine whether a dynamic rule belongs to Resolve.
 *
 * We identify Resolve rules by:
 * - our dedicated ID range
 * OR
 * - the old Resolve blocked.html redirect format.
 *
 * The second condition allows us to clean up rules created by
 * previous versions of the extension.
 */
function isResolveRule(
  rule: chrome.declarativeNetRequest.Rule
): boolean {
  const hasResolveId =
    rule.id >= RESOLVE_RULE_ID_START &&
    rule.id <
      RESOLVE_RULE_ID_START +
        MAX_DYNAMIC_RULES;

  const isBlockedPageRedirect =
    rule.action?.type === "redirect" &&
    rule.action.redirect?.extensionPath ===
      "/blocked.html";

  return (
    hasResolveId ||
    isBlockedPageRedirect
  );
}

/**
 * Remove all Resolve-owned dynamic rules.
 *
 * This does NOT blindly delete unrelated dynamic rules.
 */
export async function clearBlockingRules(): Promise<void> {
  try {
    if (!chrome.declarativeNetRequest) {
      throw new Error(
        "Declarative Net Request API is unavailable."
      );
    }

    const existingRules =
      await chrome.declarativeNetRequest.getDynamicRules();

    const resolveRules =
      existingRules.filter(
        isResolveRule
      );

    if (resolveRules.length === 0) {
      console.log(
        "🧹 No existing Resolve blocking rules to remove."
      );

      return;
    }

    const removeRuleIds =
      resolveRules.map(
        (rule) => rule.id
      );

    await chrome.declarativeNetRequest.updateDynamicRules(
      {
        removeRuleIds,
      }
    );

    console.log(
      `🧹 Resolve removed ${removeRuleIds.length} old blocking rules.`
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
 * Normalize a website/domain.
 */
function normalizeDomain(
  site: string
): string {
  return site
    .trim()
    .toLowerCase()
    .replace(
      /^https?:\/\//,
      ""
    )
    .replace(
      /^www\./,
      ""
    )
    .replace(
      /\/.*$/,
      ""
    )
    .trim();
}

/**
 * Build and install Resolve dynamic blocking rules.
 */
export async function applyBlockingRules(
  sites: string[]
): Promise<void> {
  try {
    if (!chrome.declarativeNetRequest) {
      throw new Error(
        "Declarative Net Request API is unavailable."
      );
    }

    /**
     * Normalize and deduplicate domains.
     */
    const uniqueSites = [
      ...new Set(
        sites
          .map(normalizeDomain)
          .filter(Boolean)
      ),
    ];

    /**
     * Protect against excessive rule generation.
     */
    const limitedSites =
      uniqueSites.slice(
        0,
        MAX_DYNAMIC_RULES
      );

    /**
     * Get currently installed rules.
     *
     * We remove only Resolve-owned rules.
     */
    const existingRules =
      await chrome.declarativeNetRequest.getDynamicRules();

    const resolveRules =
      existingRules.filter(
        isResolveRule
      );

    const removeRuleIds =
      resolveRules.map(
        (rule) => rule.id
      );

    /**
     * No websites to block.
     *
     * Still remove the old Resolve rules.
     */
    if (limitedSites.length === 0) {
      if (removeRuleIds.length > 0) {
        await chrome.declarativeNetRequest.updateDynamicRules(
          {
            removeRuleIds,
          }
        );

        console.log(
          `🧹 Resolve removed ${removeRuleIds.length} old blocking rules.`
        );
      }

      console.log(
        "🛡️ Resolve blocking list is empty."
      );

      return;
    }

    /**
     * Build new rules using Resolve's dedicated
     * ID range.
     */
    const rules: chrome.declarativeNetRequest.Rule[] =
      limitedSites.map(
        (domain, index) => ({
          id:
            RESOLVE_RULE_ID_START +
            index,

          priority: 1,

          action: {
            type: "redirect",

            redirect: {
              extensionPath:
                "/blocked.html",
            },
          },

          condition: {
            urlFilter:
              `||${domain}^`,

            resourceTypes: [
              "main_frame",
            ],
          },
        })
      );

    /**
     * Remove old Resolve rules and install the
     * new rules in ONE operation.
     *
     * This prevents the duplicate-ID race/problem
     * we encountered previously.
     */
    await chrome.declarativeNetRequest.updateDynamicRules(
      {
        removeRuleIds,
        addRules: rules,
      }
    );

    console.log(
      `🛡️ Resolve installed ${rules.length} redirect rules.`
    );

    console.log(
      "🌐 Resolve blocked websites:",
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