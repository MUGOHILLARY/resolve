export async function applyBlockingRules(websites: string[]) {
  try {
    const existing =
      await chrome.declarativeNetRequest.getDynamicRules();

    if (existing.length > 0) {
      await chrome.declarativeNetRequest.updateDynamicRules({
        removeRuleIds: existing.map(rule => rule.id),
      });
    }

    const blockedPage = chrome.runtime.getURL("blocked.html");

    const rules = websites.map((site, index) => ({
      id: index + 1,

      priority: 1,

      action: {
        type: chrome.declarativeNetRequest.RuleActionType.REDIRECT,
        redirect: {
          url: blockedPage,
        },
      },

      condition: {
        requestDomains: [site],
        resourceTypes: [
          chrome.declarativeNetRequest.ResourceType.MAIN_FRAME,
        ],
      },
    }));

    await chrome.declarativeNetRequest.updateDynamicRules({
      addRules: rules,
    });

    console.log(`✅ Resolve installed ${rules.length} redirect rules.`);
  } catch (err) {
    console.error(err);
  }
}