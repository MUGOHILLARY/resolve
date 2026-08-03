import { getSettings } from "./storage/settings";
import { buildWebsiteList } from "./rules/buildRules";
import { applyBlockingRules } from "./background/blockerEngine";
import { emitEvent } from "./events/eventBus";

let blockedSites: string[] = [];

async function initialize() {
  try {
    const settings = await getSettings();

    blockedSites = buildWebsiteList(settings);

    await applyBlockingRules(blockedSites);

    console.log("✅ Resolve initialized.");
  } catch (err) {
    console.error("Resolve initialization failed:", err);
  }
}

/*
|--------------------------------------------------------------------------
| Extension Lifecycle
|--------------------------------------------------------------------------
*/

chrome.runtime.onInstalled.addListener(() => {
  initialize();
});

chrome.runtime.onStartup.addListener(() => {
  initialize();
});

chrome.storage.onChanged.addListener(() => {
  initialize();
});

/*
|--------------------------------------------------------------------------
| Website Blocking
|--------------------------------------------------------------------------
*/

chrome.webNavigation.onBeforeNavigate.addListener(
  async (details) => {
    if (details.frameId !== 0) return;

    try {
      const url = new URL(details.url);

      const hostname = url.hostname.replace(/^www\./, "");

      const blocked = blockedSites.some(
        (site) =>
          hostname === site ||
          hostname.endsWith("." + site)
      );

      if (!blocked) return;

      console.log(`🛡 Blocked: ${hostname}`);

      /*
      |--------------------------------------------------------------------------
      | Notify Resolve API
      |--------------------------------------------------------------------------
      */

      await emitEvent({
        type: "site_blocked",
        payload: {
          domain: hostname,
          timestamp: Date.now(),
        },
      });

      /*
      |--------------------------------------------------------------------------
      | Redirect user to blocked page
      |--------------------------------------------------------------------------
      */

      chrome.tabs.update(details.tabId, {
        url: chrome.runtime.getURL("blocked.html"),
      });
    } catch (err) {
      console.error("Blocking error:", err);
    }
  }
);

/*
|--------------------------------------------------------------------------
| Initial Startup
|--------------------------------------------------------------------------
*/

initialize();