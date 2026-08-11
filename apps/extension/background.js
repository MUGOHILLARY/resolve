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
var MAX_DYNAMIC_RULES = 3e4;
async function clearBlockingRules() {
  try {
    const existingRules = await chrome.declarativeNetRequest.getDynamicRules();
    if (existingRules.length === 0) {
      return;
    }
    const removeRuleIds = existingRules.map(
      (rule) => rule.id
    );
    await chrome.declarativeNetRequest.updateDynamicRules({
      removeRuleIds
    });
    console.log(
      `\u{1F9F9} Resolve removed ${removeRuleIds.length} old blocking rules.`
    );
  } catch (error) {
    console.error(
      "\u274C Failed to clear Resolve blocking rules:",
      error
    );
    throw error;
  }
}
async function applyBlockingRules(sites) {
  try {
    const uniqueSites = [
      ...new Set(
        sites.map(
          (site) => site.trim().toLowerCase().replace(/^https?:\/\//, "").replace(/^www\./, "").replace(/\/.*$/, "")
        ).filter(Boolean)
      )
    ];
    const limitedSites = uniqueSites.slice(
      0,
      MAX_DYNAMIC_RULES
    );
    await clearBlockingRules();
    if (limitedSites.length === 0) {
      console.log(
        "\u{1F6E1}\uFE0F Resolve blocking list is empty."
      );
      return;
    }
    const rules = limitedSites.map(
      (domain, index) => ({
        id: index + 1,
        priority: 1,
        action: {
          type: "redirect",
          redirect: {
            extensionPath: "/blocked.html"
          }
        },
        condition: {
          urlFilter: `||${domain}^`,
          resourceTypes: [
            "main_frame"
          ]
        }
      })
    );
    await chrome.declarativeNetRequest.updateDynamicRules({
      addRules: rules
    });
    console.log(
      `\u2705 Resolve installed ${rules.length} redirect rules.`
    );
  } catch (error) {
    console.error(
      "\u274C Resolve blocking rule installation failed:",
      error
    );
    throw error;
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

// services/syncService.ts
var API_BASE_URL = "http://localhost:4000";
var SESSION_STORAGE_KEY = "resolveSession";
async function saveResolveSession(session) {
  await chrome.storage.local.set({
    [SESSION_STORAGE_KEY]: session
  });
  console.log("\u2705 Resolve session saved.");
}
async function getResolveSession() {
  const result = await chrome.storage.local.get(
    SESSION_STORAGE_KEY
  );
  const session = result[SESSION_STORAGE_KEY];
  return session ?? null;
}
async function clearResolveSession() {
  await chrome.storage.local.remove(
    SESSION_STORAGE_KEY
  );
  console.log("\u{1F513} Resolve session cleared.");
}
async function syncSettingsFromResolve() {
  try {
    const session = await getResolveSession();
    if (!session?.access_token) {
      console.warn(
        "\u26A0\uFE0F No Resolve session found. Cannot sync settings."
      );
      return null;
    }
    const response = await fetch(
      `${API_BASE_URL}/api/blocker`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${session.access_token}`,
          "Content-Type": "application/json"
        }
      }
    );
    if (!response.ok) {
      console.error(
        `\u274C Resolve blocker API returned ${response.status}`
      );
      if (response.status === 401 || response.status === 403) {
        console.warn(
          "\u{1F512} Resolve session is no longer valid."
        );
      }
      return null;
    }
    const result = await response.json();
    const settings = result?.settings ?? result?.data ?? result;
    if (!settings) {
      console.warn(
        "\u26A0\uFE0F Resolve returned no blocker settings."
      );
      return null;
    }
    const normalizedSettings = {
      gambling: Boolean(
        settings.gambling
      ),
      adult: Boolean(
        settings.adult ?? settings.adult_content
      ),
      social: Boolean(
        settings.social ?? settings.social_media
      ),
      gaming: Boolean(
        settings.gaming
      ),
      customSites: Array.isArray(
        settings.customSites
      ) ? settings.customSites : Array.isArray(
        settings.custom_sites
      ) ? settings.custom_sites : []
    };
    console.log(
      "\u2705 Resolve blocker settings synced:",
      normalizedSettings
    );
    return normalizedSettings;
  } catch (error) {
    console.error(
      "\u274C Failed to sync Resolve settings:",
      error
    );
    return null;
  }
}

// background.ts
var blockedSites = [];
var initializationPromise = null;
async function initialize() {
  if (initializationPromise) {
    return initializationPromise;
  }
  initializationPromise = (async () => {
    try {
      await syncSettingsFromResolve();
      const settings = await getSettings();
      blockedSites = buildWebsiteList(settings);
      await applyBlockingRules(blockedSites);
      console.log(
        `\u2705 Resolve initialized with ${blockedSites.length} blocked websites.`
      );
    } catch (error) {
      console.error(
        "\u274C Resolve initialization failed:",
        error
      );
    } finally {
      initializationPromise = null;
    }
  })();
  return initializationPromise;
}
chrome.runtime.onInstalled.addListener(
  async () => {
    console.log(
      "\u{1F680} Resolve extension installed."
    );
    await initialize();
  }
);
chrome.runtime.onStartup.addListener(
  async () => {
    console.log(
      "\u{1F680} Resolve extension started."
    );
    await initialize();
  }
);
chrome.storage.onChanged.addListener(
  async (changes, areaName) => {
    if (areaName !== "local") {
      return;
    }
    if (changes.resolveSession || changes.settings) {
      console.log(
        "\u{1F504} Resolve settings/session changed. Reinitializing..."
      );
      await initialize();
    }
  }
);
chrome.webNavigation.onBeforeNavigate.addListener(
  async (details) => {
    if (details.frameId !== 0) {
      return;
    }
    try {
      const url = new URL(
        details.url
      );
      const hostname = url.hostname.replace(
        /^www\./,
        ""
      );
      const blocked = blockedSites.some(
        (site) => hostname === site || hostname.endsWith(
          "." + site
        )
      );
      if (!blocked) {
        return;
      }
      console.log(
        `\u{1F6E1}\uFE0F Resolve blocked: ${hostname}`
      );
      await recordBlockedAttempt();
      try {
        await emitEvent({
          type: "site_blocked",
          payload: {
            domain: hostname,
            timestamp: Date.now()
          }
        });
      } catch (eventError) {
        console.error(
          "\u26A0\uFE0F Failed to send blocked-site event:",
          eventError
        );
      }
    } catch (error) {
      console.error(
        "\u274C Blocking logger error:",
        error
      );
    }
  }
);
chrome.runtime.onMessageExternal.addListener(
  (message, sender, sendResponse) => {
    const allowedOrigins = [
      "https://resolve-web-two.vercel.app",
      "https://resolve-web-git-main-mugohillarys-projects.vercel.app",
      "http://localhost:5173",
      "http://localhost:3000"
    ];
    if (sender.origin && !allowedOrigins.includes(
      sender.origin
    )) {
      console.warn(
        "\u{1F6AB} Rejected external message from:",
        sender.origin
      );
      sendResponse({
        success: false,
        message: "Unauthorized origin."
      });
      return false;
    }
    if (message?.type === "RESOLVE_CONNECT_ACCOUNT") {
      (async () => {
        try {
          if (!message.session?.access_token) {
            throw new Error(
              "No Resolve access token provided."
            );
          }
          console.log(
            "\u{1F510} Connecting Resolve account..."
          );
          await saveResolveSession(
            message.session
          );
          await initialize();
          console.log(
            "\u2705 Resolve account connected successfully."
          );
          sendResponse({
            success: true
          });
        } catch (error) {
          console.error(
            "\u274C Failed to connect Resolve account:",
            error
          );
          sendResponse({
            success: false,
            message: error?.message || "Failed to connect account."
          });
        }
      })();
      return true;
    }
    if (message?.type === "RESOLVE_DISCONNECT_ACCOUNT") {
      (async () => {
        try {
          console.log(
            "\u{1F513} Disconnecting Resolve account..."
          );
          await clearResolveSession();
          blockedSites = [];
          await applyBlockingRules([]);
          console.log(
            "\u2705 Resolve account disconnected."
          );
          sendResponse({
            success: true
          });
        } catch (error) {
          console.error(
            "\u274C Failed to disconnect Resolve account:",
            error
          );
          sendResponse({
            success: false,
            message: error?.message || "Failed to disconnect account."
          });
        }
      })();
      return true;
    }
    if (message?.type === "RESOLVE_GET_CONNECTION_STATUS") {
      (async () => {
        try {
          const session = await getResolveSession();
          const connected = Boolean(
            session?.access_token
          );
          sendResponse({
            success: true,
            connected,
            userId: session?.user?.id ?? null,
            email: session?.user?.email ?? null
          });
        } catch (error) {
          console.error(
            "\u274C Failed to get Resolve connection status:",
            error
          );
          sendResponse({
            success: false,
            connected: false,
            userId: null,
            email: null,
            message: error?.message || "Failed to get connection status."
          });
        }
      })();
      return true;
    }
    return false;
  }
);
initialize();
