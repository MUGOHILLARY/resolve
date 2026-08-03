export async function applyBlockingRules(
  websites: string[]
) {

  const existing =
    await chrome.declarativeNetRequest.getDynamicRules();

  await chrome.declarativeNetRequest.updateDynamicRules({

    removeRuleIds: existing.map(rule => rule.id),

    addRules: websites.map((site, index) => ({

      id: index + 1,

      priority: 1,

      action: {
        type: "block",
      },

      condition: {

        urlFilter: `||${site}`,

        resourceTypes: [
          "main_frame",
        ],

      },

    })),

  });

  console.log(
    `Resolve loaded ${websites.length} blocking rules`
  );

}