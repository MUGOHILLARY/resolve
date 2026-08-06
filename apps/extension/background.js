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
  try {
    const existing = await chrome.declarativeNetRequest.getDynamicRules();
    if (existing.length > 0) {
      await chrome.declarativeNetRequest.updateDynamicRules({
        removeRuleIds: existing.map((rule) => rule.id)
      });
    }
    const blockedPage = chrome.runtime.getURL("blocked.html");
    const rules = websites.map((site, index) => ({
      id: index + 1,
      priority: 1,
      action: {
        type: chrome.declarativeNetRequest.RuleActionType.REDIRECT,
        redirect: {
          url: blockedPage
        }
      },
      condition: {
        requestDomains: [site],
        resourceTypes: [
          chrome.declarativeNetRequest.ResourceType.MAIN_FRAME
        ]
      }
    }));
    await chrome.declarativeNetRequest.updateDynamicRules({
      addRules: rules
    });
    console.log(`\u2705 Resolve installed ${rules.length} redirect rules.`);
  } catch (err) {
    console.error(err);
  }
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

// stats.ts
var DEFAULT_STATS = {
  streak: 0,
  blockedToday: 0,
  moneySaved: 0,
  lastBlockedDate: ""
};
async function recordBlockedAttempt() {
  const today = (/* @__PURE__ */ new Date()).toDateString();
  const result = await chrome.storage.local.get("resolveStats");
  const stats = result.resolveStats ?? DEFAULT_STATS;
  if (stats.lastBlockedDate !== today) {
    stats.blockedToday = 0;
    stats.lastBlockedDate = today;
  }
  stats.blockedToday++;
  stats.moneySaved += 250;
  await chrome.storage.local.set({
    resolveStats: stats
  });
}

// background.ts
var blockedSites = [];
async function initialize() {
  try {
    const settings = await getSettings();
    blockedSites = buildWebsiteList(settings);
    await applyBlockingRules(blockedSites);
    console.log(
      `\u2705 Resolve initialized with ${blockedSites.length} blocked websites.`
    );
  } catch (err) {
    console.error("Resolve initialization failed:", err);
  }
}
chrome.runtime.onInstalled.addListener(async () => {
  await initialize();
});
chrome.runtime.onStartup.addListener(async () => {
  await initialize();
});
chrome.storage.onChanged.addListener(async () => {
  await initialize();
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
      await recordBlockedAttempt();
      await emitEvent({
        type: "site_blocked",
        payload: {
          domain: hostname,
          timestamp: Date.now()
        }
      });
    } catch (err) {
      console.error("Blocking logger error:", err);
    }
  }
);
initialize();
