// storage/settings.ts
var DEFAULT_SETTINGS = {
  gambling: true,
  adult: true,
  social: false,
  gaming: false,
  customSites: []
};
async function getSettings() {
  const data = await chrome.storage.sync.get("settings");
  return data.settings ?? DEFAULT_SETTINGS;
}

// rules/defaultRules.ts
var gamblingSites = [
  "betika.com",
  "1xbet.com",
  "betway.com",
  "sportpesa.com"
];
var adultSites = [
  "pornhub.com",
  "xvideos.com",
  "xnxx.com",
  "redtube.com"
];
var socialSites = [
  "facebook.com",
  "instagram.com",
  "tiktok.com",
  "twitter.com",
  "x.com",
  "snapchat.com"
];
var gamingSites = [
  "store.steampowered.com",
  "epicgames.com",
  "roblox.com"
];

// rules/buildRules.ts
function buildWebsiteList(settings) {
  const websites = /* @__PURE__ */ new Set();
  if (settings.gambling) {
    gamblingSites.forEach((site) => websites.add(site));
  }
  if (settings.adult) {
    adultSites.forEach((site) => websites.add(site));
  }
  if (settings.social) {
    socialSites.forEach((site) => websites.add(site));
  }
  if (settings.gaming) {
    gamingSites.forEach((site) => websites.add(site));
  }
  settings.customSites.forEach(
    (site) => websites.add(site)
  );
  return [...websites];
}

// background/blockerEngine.ts
async function applyBlockingRules(websites) {
  const existing = await chrome.declarativeNetRequest.getDynamicRules();
  await chrome.declarativeNetRequest.updateDynamicRules({
    removeRuleIds: existing.map((rule) => rule.id),
    addRules: websites.map((site, index) => ({
      id: index + 1,
      priority: 1,
      action: {
        type: "block"
      },
      condition: {
        urlFilter: `||${site}`,
        resourceTypes: [
          "main_frame"
        ]
      }
    }))
  });
  console.log(
    `Resolve loaded ${websites.length} blocking rules`
  );
}

// events/eventBus.ts
var API_URL = "http://localhost:4000/api/events";
async function emitEvent(event) {
  try {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(event)
    });
    if (!response.ok) {
      console.error(
        "Resolve API returned:",
        response.status,
        response.statusText
      );
      return false;
    }
    console.log("Resolve event sent:", event.type);
    return true;
  } catch (error) {
    console.error(
      "Unable to send Resolve event:",
      error
    );
    return false;
  }
}

// background.ts
var blockedSites = [];
async function initialize() {
  try {
    const settings = await getSettings();
    blockedSites = buildWebsiteList(settings);
    await applyBlockingRules(blockedSites);
    console.log("\u2705 Resolve initialized.");
  } catch (err) {
    console.error("Resolve initialization failed:", err);
  }
}
chrome.runtime.onInstalled.addListener(() => {
  initialize();
});
chrome.runtime.onStartup.addListener(() => {
  initialize();
});
chrome.storage.onChanged.addListener(() => {
  initialize();
});
chrome.webNavigation.onBeforeNavigate.addListener(
  async (details) => {
    if (details.frameId !== 0) return;
    try {
      const url = new URL(details.url);
      const hostname = url.hostname.replace(/^www\./, "");
      const blocked = blockedSites.some(
        (site) => hostname === site || hostname.endsWith("." + site)
      );
      if (!blocked) return;
      console.log(`\u{1F6E1} Blocked: ${hostname}`);
      await emitEvent({
        type: "site_blocked",
        payload: {
          domain: hostname,
          timestamp: Date.now()
        }
      });
      chrome.tabs.update(details.tabId, {
        url: chrome.runtime.getURL("blocked.html")
      });
    } catch (err) {
      console.error("Blocking error:", err);
    }
  }
);
initialize();
