import { getSettings } from "./storage/settings";
import { buildWebsiteList } from "./rules/buildRules";
import { applyBlockingRules } from "./background/blockerEngine";
import { emitEvent } from "./events/eventBus";
import { recordBlockedAttempt } from "./stats";

let blockedSites: string[] = [];

async function initialize() {
  try {
    const settings = await getSettings();

    blockedSites = buildWebsiteList(settings);

    await applyBlockingRules(blockedSites);

    console.log(
      `✅ Resolve initialized with ${blockedSites.length} blocked websites.`
    );
  } catch (err) {
    console.error("Resolve initialization failed:", err);
  }
}

/*
|--------------------------------------------------------------------------
| Extension Lifecycle
|--------------------------------------------------------------------------
*/

chrome.runtime.onInstalled.addListener(async () => {
  await initialize();
});

chrome.runtime.onStartup.addListener(async () => {
  await initialize();
});

chrome.storage.onChanged.addListener(async () => {
  await initialize();
});

/*
|--------------------------------------------------------------------------
| Website Blocking Logger
|--------------------------------------------------------------------------
|
| The actual blocking is handled by Declarative Net Request.
| This listener records statistics and sends analytics events.
|
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

      // Update recovery statistics
      await recordBlockedAttempt();

      // Notify Resolve backend
      await emitEvent({
        type: "site_blocked",
        payload: {
          domain: hostname,
          timestamp: Date.now(),
        },
      });

    } catch (err) {
      console.error("Blocking logger error:", err);
    }
  }
);

/*
|--------------------------------------------------------------------------
| Initial Startup
|--------------------------------------------------------------------------
*/

initialize();