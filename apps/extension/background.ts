import {
  getSettings,
} from "./storage/settings";

import {
  buildWebsiteList,
} from "./rules/buildRules";

import {
  applyBlockingRules,
} from "./background/blockerEngine";

import {
  emitEvent,
} from "./events/eventBus";

import {
  recordBlockedAttempt,
} from "./stats";

import {
  syncSettingsFromResolve,
  saveResolveSession,
  getResolveSession,
  clearResolveSession,
} from "./services/syncService";

/* -------------------------------------------------------------------------- */
/* State                                                                      */
/* -------------------------------------------------------------------------- */

let blockedSites: string[] = [];

/*
 * Prevent multiple initialization processes from running at the same time.
 *
 * This is important because initialize() can be triggered by:
 * - extension installation
 * - browser startup
 * - storage changes
 * - account connection
 * - initial service-worker startup
 */
let initializationPromise: Promise<void> | null = null;

/* -------------------------------------------------------------------------- */
/* Resolve Initialization                                                     */
/* -------------------------------------------------------------------------- */

async function initialize(): Promise<void> {
  /*
   * If initialization is already running, wait for that same operation
   * instead of starting another DNR update.
   */
  if (initializationPromise) {
    return initializationPromise;
  }

  initializationPromise = (async () => {
    try {
      /*
       * First synchronize the logged-in Resolve user's settings.
       *
       * If there is no connected Resolve account, the sync service
       * should simply leave the existing local settings untouched.
       */
      await syncSettingsFromResolve();

      /*
       * Load the latest local settings.
       */
      const settings = await getSettings();

      /*
       * Convert settings into the actual list of websites
       * that Resolve should block.
       */
      blockedSites = buildWebsiteList(settings);

      /*
       * Replace the current Declarative Net Request rules.
       */
      await applyBlockingRules(blockedSites);

      console.log(
        `✅ Resolve initialized with ${blockedSites.length} blocked websites.`
      );
    } catch (error) {
      console.error(
        "❌ Resolve initialization failed:",
        error
      );
    } finally {
      /*
       * Allow future initialization requests after the
       * current initialization has completed.
       */
      initializationPromise = null;
    }
  })();

  return initializationPromise;
}

/* -------------------------------------------------------------------------- */
/* Extension Lifecycle                                                        */
/* -------------------------------------------------------------------------- */

chrome.runtime.onInstalled.addListener(
  async () => {
    console.log(
      "🚀 Resolve extension installed."
    );

    await initialize();
  }
);

chrome.runtime.onStartup.addListener(
  async () => {
    console.log(
      "🚀 Resolve extension started."
    );

    await initialize();
  }
);

/* -------------------------------------------------------------------------- */
/* Storage Changes                                                            */
/* -------------------------------------------------------------------------- */

chrome.storage.onChanged.addListener(
  async (changes, areaName) => {
    /*
     * Only respond to local storage changes.
     */
    if (areaName !== "local") {
      return;
    }

    /*
     * Reinitialize when Resolve account/session
     * or blocker settings change.
     */
    if (
      changes.resolveSession ||
      changes.settings
    ) {
      console.log(
        "🔄 Resolve settings/session changed. Reinitializing..."
      );

      await initialize();
    }
  }
);

/* -------------------------------------------------------------------------- */
/* Website Blocking Logger                                                    */
/* -------------------------------------------------------------------------- */

/*
 * The actual blocking is performed by Declarative Net Request.
 *
 * This listener is only responsible for:
 * - detecting a navigation to a blocked domain
 * - recording the blocked attempt
 * - sending an analytics event to the Resolve API
 */
chrome.webNavigation.onBeforeNavigate.addListener(
  async (details) => {
    /*
     * Only process the main page.
     *
     * Ignore iframes and subframes.
     */
    if (details.frameId !== 0) {
      return;
    }

    try {
      const url = new URL(
        details.url
      );

      /*
       * Normalize hostname.
       */
      const hostname =
        url.hostname.replace(
          /^www\./,
          ""
        );

      /*
       * Determine whether this hostname
       * belongs to one of Resolve's blocked domains.
       */
      const blocked =
        blockedSites.some(
          (site) =>
            hostname === site ||
            hostname.endsWith(
              "." + site
            )
        );

      if (!blocked) {
        return;
      }

      console.log(
        `🛡️ Resolve blocked: ${hostname}`
      );

      /*
       * Update local recovery statistics.
       */
      await recordBlockedAttempt();

      /*
       * Send blocked-site event to Resolve backend.
       *
       * Failure to send analytics must NOT prevent
       * the browser blocking mechanism from working.
       */
      try {
        await emitEvent({
          type: "site_blocked",

          payload: {
            domain: hostname,
            timestamp: Date.now(),
          },
        });
      } catch (eventError) {
        console.error(
          "⚠️ Failed to send blocked-site event:",
          eventError
        );
      }
    } catch (error) {
      console.error(
        "❌ Blocking logger error:",
        error
      );
    }
  }
);

/* -------------------------------------------------------------------------- */
/* Website → Extension Account Connection                                    */
/* -------------------------------------------------------------------------- */

chrome.runtime.onMessageExternal.addListener(
  (
    message,
    sender,
    sendResponse
  ) => {
    /*
     * These are the Resolve web applications
     * that are allowed to communicate with the extension.
     */
    const allowedOrigins = [
      "https://resolve-web-two.vercel.app",
      "https://resolve-web-git-main-mugohillarys-projects.vercel.app",
      "http://localhost:5173",
      "http://localhost:3000",
    ];

    /*
     * Reject messages from unknown origins.
     */
    if (
      sender.origin &&
      !allowedOrigins.includes(
        sender.origin
      )
    ) {
      console.warn(
        "🚫 Rejected external message from:",
        sender.origin
      );

      sendResponse({
        success: false,
        message:
          "Unauthorized origin.",
      });

      return false;
    }

    /* ---------------------------------------------------------------------- */
    /* Connect Resolve Account                                                */
    /* ---------------------------------------------------------------------- */

    if (
      message?.type ===
      "RESOLVE_CONNECT_ACCOUNT"
    ) {
      (async () => {
        try {
          /*
           * A Supabase session must contain an access token.
           */
          if (
            !message.session?.access_token
          ) {
            throw new Error(
              "No Resolve access token provided."
            );
          }

          console.log(
            "🔐 Connecting Resolve account..."
          );

          /*
           * Save the authenticated Resolve session
           * in extension local storage.
           */
          await saveResolveSession(
            message.session
          );

          /*
           * Immediately synchronize the user's
           * blocker settings and rebuild the DNR rules.
           */
          await initialize();

          console.log(
            "✅ Resolve account connected successfully."
          );

          sendResponse({
            success: true,
          });
        } catch (error: any) {
          console.error(
            "❌ Failed to connect Resolve account:",
            error
          );

          sendResponse({
            success: false,

            message:
              error?.message ||
              "Failed to connect account.",
          });
        }
      })();

      /*
       * Keep the message channel open for the
       * asynchronous response.
       */
      return true;
    }

    /* ---------------------------------------------------------------------- */
    /* Disconnect Resolve Account                                             */
    /* ---------------------------------------------------------------------- */

    if (
      message?.type ===
      "RESOLVE_DISCONNECT_ACCOUNT"
    ) {
      (async () => {
        try {
          console.log(
            "🔓 Disconnecting Resolve account..."
          );

          /*
           * Remove the stored Resolve session.
           */
          await clearResolveSession();

          /*
           * Clear the in-memory website list.
           */
          blockedSites = [];

          /*
           * Remove all active DNR blocking rules.
           */
          await applyBlockingRules([]);

          console.log(
            "✅ Resolve account disconnected."
          );

          sendResponse({
            success: true,
          });
        } catch (error: any) {
          console.error(
            "❌ Failed to disconnect Resolve account:",
            error
          );

          sendResponse({
            success: false,

            message:
              error?.message ||
              "Failed to disconnect account.",
          });
        }
      })();

      return true;
    }

    /* ---------------------------------------------------------------------- */
    /* Get Connection Status                                                  */
    /* ---------------------------------------------------------------------- */

    if (
      message?.type ===
      "RESOLVE_GET_CONNECTION_STATUS"
    ) {
      (async () => {
        try {
          const session =
            await getResolveSession();

          const connected =
            Boolean(
              session?.access_token
            );

          sendResponse({
            success: true,

            connected,

            userId:
              session?.user?.id ??
              null,

            email:
              session?.user?.email ??
              null,
          });
        } catch (error: any) {
          console.error(
            "❌ Failed to get Resolve connection status:",
            error
          );

          sendResponse({
            success: false,

            connected: false,

            userId: null,

            email: null,

            message:
              error?.message ||
              "Failed to get connection status.",
          });
        }
      })();

      return true;
    }

    /*
     * Unknown message type.
     */
    return false;
  }
);

/* -------------------------------------------------------------------------- */
/* Initial Startup                                                            */
/* -------------------------------------------------------------------------- */

initialize();