// storage/settings.ts
var DEFAULT_SETTINGS = {
  gambling: true,
  adult: true,
  social: false,
  gaming: false,
  customSites: []
};
async function getSettings() {
  const data = await chrome.storage.sync.get(
    "settings"
  );
  const settings = data.settings;
  return {
    gambling: settings?.gambling ?? DEFAULT_SETTINGS.gambling,
    adult: settings?.adult ?? DEFAULT_SETTINGS.adult,
    social: settings?.social ?? DEFAULT_SETTINGS.social,
    gaming: settings?.gaming ?? DEFAULT_SETTINGS.gaming,
    customSites: Array.isArray(
      settings?.customSites
    ) ? settings.customSites : []
  };
}

// rules/buildRules.ts
var gamblingSites = [
  // ------------------------------------------------------------------------
  // International sportsbooks / betting
  // ------------------------------------------------------------------------
  "bet365.com",
  "betway.com",
  "1xbet.com",
  "22bet.com",
  "williamhill.com",
  "ladbrokes.com",
  "coral.co.uk",
  "betfair.com",
  "paddypower.com",
  "unibet.com",
  "bwin.com",
  "888sport.com",
  "888casino.com",
  "betfred.com",
  "skybet.com",
  "boylesports.com",
  "10bet.com",
  "betvictor.com",
  "betsson.com",
  "leovegas.com",
  "mrgreen.com",
  "sportingbet.com",
  "parimatch.com",
  "melbet.com",
  "megapari.com",
  "mostbet.com",
  "stake.com",
  "1win.com",
  "bc.game",
  "22bet.com",
  "betwinner.com",
  "betmaster.com",
  "fonbet.com",
  "pin-up.bet",
  "pinup.com",
  // ------------------------------------------------------------------------
  // Kenya / East Africa focused betting domains
  // ------------------------------------------------------------------------
  "sportpesa.com",
  "sportpesa.co.ke",
  "betika.com",
  "betika.co.ke",
  "odibets.com",
  "odibets.co.ke",
  "betway.co.ke",
  "1xbet.co.ke",
  "betafriq.com",
  "mozzartbet.com",
  "bangbet.com",
  "betgr8.com",
  "betlion.com",
  "betin.com",
  "betpawa.com",
  "betpawa.co.ke",
  "mcheza.com",
  "supabet.com",
  "elitebet.com",
  "playabet.com",
  "kwikbet.com",
  "luckysports.co.ke",
  // ------------------------------------------------------------------------
  // Casino / online gambling
  // ------------------------------------------------------------------------
  "casino.com",
  "casino.org",
  "casumo.com",
  "jackpotjoy.com",
  "grosvenorcasinos.com",
  "betwaycasino.com",
  "partypoker.com",
  "partycasino.com",
  "pokerstars.com",
  "pokerstarscasino.com",
  "888casino.com",
  "unibetcasino.com",
  "betssoncasino.com",
  "royalpanda.com",
  "videoslots.com",
  "rizk.com",
  "mansioncasino.com",
  "spinpalace.com",
  "spinwin.com",
  // ------------------------------------------------------------------------
  // Poker
  // ------------------------------------------------------------------------
  "pokerstars.com",
  "partypoker.com",
  "888poker.com",
  "ggpoker.com",
  "americascardroom.eu",
  "acr.bet",
  "natural8.com",
  // ------------------------------------------------------------------------
  // Lottery / lottery-style gambling
  // ------------------------------------------------------------------------
  "lotto.com",
  "lottoland.com",
  "thelotter.com"
];
var adultSites = [
  "pornhub.com",
  "xvideos.com",
  "xnxx.com",
  "xhamster.com",
  "redtube.com",
  "youporn.com",
  "tube8.com",
  "spankbang.com",
  "porn.com",
  "hqporner.com",
  "eporner.com",
  "beeg.com",
  "pornone.com",
  "drtuber.com",
  "tnaflix.com"
];
var socialSites = [
  "facebook.com",
  "instagram.com",
  "tiktok.com",
  "twitter.com",
  "x.com",
  "snapchat.com",
  "reddit.com",
  "pinterest.com",
  "threads.net",
  "linkedin.com",
  "tumblr.com",
  "discord.com"
];
var gamingSites = [
  "roblox.com",
  "steam.com",
  "steampowered.com",
  "epicgames.com",
  "store.epicgames.com",
  "playstation.com",
  "xbox.com",
  "nintendo.com",
  "ea.com",
  "battle.net",
  "blizzard.com",
  "minecraft.net",
  "leagueoflegends.com",
  "riotgames.com",
  "fortnite.com",
  "twitch.tv"
];
function normalizeDomain(site) {
  if (typeof site !== "string" || !site.trim()) {
    return "";
  }
  let normalized = site.trim().toLowerCase();
  normalized = normalized.replace(
    /^https?:\/\//,
    ""
  );
  normalized = normalized.replace(
    /^www\./,
    ""
  );
  normalized = normalized.split("/")[0];
  normalized = normalized.replace(
    /\.$/,
    ""
  );
  normalized = normalized.trim();
  return normalized;
}
function buildWebsiteList(settings) {
  if (!settings) {
    return [];
  }
  const websites = /* @__PURE__ */ new Set();
  if (settings.gambling) {
    for (const site of gamblingSites) {
      const normalized = normalizeDomain(site);
      if (normalized) {
        websites.add(normalized);
      }
    }
  }
  if (settings.adult) {
    for (const site of adultSites) {
      const normalized = normalizeDomain(site);
      if (normalized) {
        websites.add(normalized);
      }
    }
  }
  if (settings.social) {
    for (const site of socialSites) {
      const normalized = normalizeDomain(site);
      if (normalized) {
        websites.add(normalized);
      }
    }
  }
  if (settings.gaming) {
    for (const site of gamingSites) {
      const normalized = normalizeDomain(site);
      if (normalized) {
        websites.add(normalized);
      }
    }
  }
  if (Array.isArray(settings.customSites)) {
    for (const site of settings.customSites) {
      const normalized = normalizeDomain(site);
      if (normalized) {
        websites.add(normalized);
      }
    }
  }
  return [...websites];
}

// background/blockerEngine.ts
var MAX_DYNAMIC_RULES = 3e4;
var RESOLVE_RULE_ID_START = 1e5;
function isResolveRule(rule) {
  const hasResolveId = rule.id >= RESOLVE_RULE_ID_START && rule.id < RESOLVE_RULE_ID_START + MAX_DYNAMIC_RULES;
  const isOldResolveRedirect = rule.action?.type === "redirect" && rule.action.redirect?.extensionPath === "/blocked.html";
  return hasResolveId || isOldResolveRedirect;
}
function normalizeDomain2(value) {
  if (!value) {
    return "";
  }
  let domain = value.trim().toLowerCase();
  if (!domain) {
    return "";
  }
  domain = domain.replace(
    /^https?:\/\//,
    ""
  );
  domain = domain.replace(
    /^www\./,
    ""
  );
  domain = domain.split("/")[0];
  domain = domain.split(":")[0];
  return domain.trim();
}
async function applyBlockingRules(sites) {
  if (!chrome.declarativeNetRequest) {
    throw new Error(
      "Declarative Net Request API is unavailable."
    );
  }
  try {
    const uniqueSites = [
      ...new Set(
        (sites ?? []).map(normalizeDomain2).filter(Boolean)
      )
    ];
    const limitedSites = uniqueSites.slice(
      0,
      MAX_DYNAMIC_RULES
    );
    console.log(
      `\u{1F50E} Resolve received ${uniqueSites.length} unique domains.`
    );
    console.log(
      `\u{1F50E} Resolve will install ${limitedSites.length} domains.`
    );
    const existingRules = await chrome.declarativeNetRequest.getDynamicRules();
    const resolveRules = existingRules.filter(isResolveRule);
    const removeRuleIds = resolveRules.map(
      (rule) => rule.id
    );
    console.log(
      `\u{1F9F9} Resolve found ${removeRuleIds.length} existing Resolve rules.`
    );
    if (limitedSites.length === 0) {
      if (removeRuleIds.length > 0) {
        await chrome.declarativeNetRequest.updateDynamicRules({
          removeRuleIds
        });
        console.log(
          `\u{1F9F9} Resolve removed ${removeRuleIds.length} rules.`
        );
      }
      console.log(
        "\u{1F6E1}\uFE0F Resolve blocking list is empty."
      );
      return;
    }
    const rules = limitedSites.map(
      (domain, index) => ({
        /**
         * Dedicated Resolve ID.
         */
        id: RESOLVE_RULE_ID_START + index,
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
          type: "block"
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
          urlFilter: `||${domain}^`,
          /**
           * Only block actual top-level
           * website navigation.
           */
          resourceTypes: [
            "main_frame"
          ]
        }
      })
    );
    await chrome.declarativeNetRequest.updateDynamicRules({
      removeRuleIds,
      addRules: rules
    });
    console.log(
      `\u{1F6E1}\uFE0F Resolve installed ${rules.length} BLOCK rules.`
    );
    console.log(
      "\u{1F310} Resolve blocked domains:",
      limitedSites
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
var API_BASE_URL = "https://resolve-api-ty79.onrender.com";
var SESSION_STORAGE_KEY = "resolveSession";
var SETTINGS_STORAGE_KEY = "settings";
async function saveResolveSession(session) {
  if (!session?.access_token) {
    throw new Error(
      "Cannot save Resolve session: access token is missing."
    );
  }
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
async function saveSettings(settings) {
  await chrome.storage.sync.set({
    [SETTINGS_STORAGE_KEY]: settings
  });
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
    console.log(
      "\u{1F504} Syncing Resolve settings from API..."
    );
    console.log(
      "\u{1F310} API URL:",
      `${API_BASE_URL}/api/blocker`
    );
    const response = await fetch(
      `${API_BASE_URL}/api/blocker`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${session.access_token}`,
          Accept: "application/json"
        }
      }
    );
    console.log(
      "\u{1F4E1} Blocker API status:",
      response.status
    );
    if (!response.ok) {
      let errorBody = "";
      try {
        errorBody = await response.text();
      } catch {
        errorBody = "";
      }
      console.error(
        "\u274C Resolve blocker API returned:",
        response.status,
        errorBody
      );
      if (response.status === 401 || response.status === 403) {
        console.warn(
          "\u{1F512} Resolve session is no longer valid."
        );
        await clearResolveSession();
      }
      return null;
    }
    const result = await response.json();
    console.log(
      "\u{1F4E5} Resolve blocker API response:",
      result
    );
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
    await saveSettings(
      normalizedSettings
    );
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
      console.log(
        "\u{1F504} Resolve initialization started."
      );
      const syncedSettings = await syncSettingsFromResolve();
      const settings = syncedSettings ?? await getSettings();
      console.log(
        "\u2699\uFE0F Resolve settings:",
        settings
      );
      blockedSites = buildWebsiteList(
        settings
      );
      console.log(
        `\u{1F6E1}\uFE0F Resolve blocking ${blockedSites.length} domains.`
      );
      await applyBlockingRules(
        blockedSites
      );
      console.log(
        `\u2705 Resolve initialized with ${blockedSites.length} blocked domains.`
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
  async (details) => {
    console.log(
      "\u{1F680} Resolve extension installed:",
      details.reason
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
    const sessionChanged = areaName === "local" && Boolean(
      changes.resolveSession
    );
    const settingsChanged = areaName === "sync" && Boolean(
      changes.settings
    );
    if (!sessionChanged && !settingsChanged) {
      return;
    }
    console.log(
      "\u{1F504} Resolve storage changed."
    );
    await initialize();
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
      if (url.protocol !== "http:" && url.protocol !== "https:") {
        return;
      }
      const hostname = url.hostname.toLowerCase().replace(
        /^www\./,
        ""
      );
      const blocked = blockedSites.some(
        (site) => {
          const normalizedSite = site.trim().toLowerCase().replace(
            /^www\./,
            ""
          );
          return hostname === normalizedSite || hostname.endsWith(
            "." + normalizedSite
          );
        }
      );
      if (!blocked) {
        return;
      }
      console.log(
        `\u{1F6E1}\uFE0F Resolve blocked: ${hostname}`
      );
      try {
        await recordBlockedAttempt();
      } catch (statsError) {
        console.error(
          "\u26A0\uFE0F Failed to record blocked attempt:",
          statsError
        );
      }
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
    const senderOrigin = sender.origin;
    if (!senderOrigin || !allowedOrigins.includes(
      senderOrigin
    )) {
      console.warn(
        "\u{1F6AB} Rejected external message from:",
        senderOrigin
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
          const session = message.session;
          if (!session?.access_token) {
            throw new Error(
              "No Resolve access token provided."
            );
          }
          console.log(
            "\u{1F510} Connecting Resolve account..."
          );
          await saveResolveSession(
            session
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
            message: error instanceof Error ? error.message : "Failed to connect account."
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
          await applyBlockingRules(
            []
          );
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
            message: error instanceof Error ? error.message : "Failed to disconnect account."
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
            message: error instanceof Error ? error.message : "Failed to get connection status."
          });
        }
      })();
      return true;
    }
    console.warn(
      "\u26A0\uFE0F Unknown Resolve external message:",
      message?.type
    );
    sendResponse({
      success: false,
      message: "Unknown Resolve message type."
    });
    return false;
  }
);
void initialize();
