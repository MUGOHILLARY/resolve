const MAX_DYNAMIC_RULES = 30000;

/**
 * Get all currently installed Resolve dynamic blocking rules.
 */
export async function getBlockingRules(): Promise<
  chrome.declarativeNetRequest.Rule[]
> {
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
 * Remove all currently installed Resolve dynamic rules.
 */
export async function clearBlockingRules(): Promise<void> {
  try {
    const existingRules =
      await chrome.declarativeNetRequest.getDynamicRules();

    if (existingRules.length === 0) {
      return;
    }

    const removeRuleIds =
      existingRules.map(
        (rule) => rule.id
      );

    await chrome.declarativeNetRequest.updateDynamicRules({
      removeRuleIds,
    });

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
 * Build and install Resolve dynamic blocking rules.
 */
export async function applyBlockingRules(
  sites: string[]
): Promise<void> {
  try {
    /*
     * Remove duplicates and normalize domains.
     */
    const uniqueSites = [
      ...new Set(
        sites
          .map((site) =>
            site
              .trim()
              .toLowerCase()
              .replace(/^https?:\/\//, "")
              .replace(/^www\./, "")
              .replace(/\/.*$/, "")
          )
          .filter(Boolean)
      ),
    ];

    /*
     * Protect against excessive rule generation.
     */
    const limitedSites =
      uniqueSites.slice(
        0,
        MAX_DYNAMIC_RULES
      );

    /*
     * Clear existing Resolve rules first.
     */
    await clearBlockingRules();

    if (limitedSites.length === 0) {
      console.log(
        "🛡️ Resolve blocking list is empty."
      );

      return;
    }

    /*
     * Create deterministic unique IDs.
     *
     * ID 1, 2, 3... are safe because we
     * clear the old rules before adding them.
     */
    const rules: chrome.declarativeNetRequest.Rule[] =
      limitedSites.map(
        (domain, index) => ({
          id: index + 1,

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

    await chrome.declarativeNetRequest.updateDynamicRules({
      addRules: rules,
    });

    console.log(
      `✅ Resolve installed ${rules.length} redirect rules.`
    );
  } catch (error) {
    console.error(
      "❌ Resolve blocking rule installation failed:",
      error
    );

    throw error;
  }
}