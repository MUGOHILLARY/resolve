import { getSettings } from "./storage/settings";

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

let initializationPromise:
  Promise<void> | null = null;

/* -------------------------------------------------------------------------- */
/* Resolve Initialization                                                     */
/* -------------------------------------------------------------------------- */

async function initialize(): Promise<void> {
  /*
   * Prevent simultaneous initialization.
   */
  if (initializationPromise) {
    return initializationPromise;
  }

  initializationPromise =
    (async () => {
      try {
        console.log(
          "🔄 Resolve initialization started."
        );

        /*
         * Attempt to synchronize settings
         * from the Resolve API.
         */
        const syncedSettings =
          await syncSettingsFromResolve();

        /*
         * If API synchronization is unavailable,
         * fall back to local settings.
         */
        const settings =
          syncedSettings ??
          await getSettings();

        console.log(
          "⚙️ Resolve settings:",
          settings
        );

        /*
         * Convert category settings into
         * actual domains.
         */
        blockedSites =
          buildWebsiteList(
            settings
          );

        console.log(
          `🛡️ Resolve blocking ${blockedSites.length} domains.`
        );

        /*
         * Install DNR rules.
         */
        await applyBlockingRules(
          blockedSites
        );

        console.log(
          `✅ Resolve initialized with ${blockedSites.length} blocked domains.`
        );
      } catch (error) {
        console.error(
          "❌ Resolve initialization failed:",
          error
        );
      } finally {
        initializationPromise =
          null;
      }
    })();

  return initializationPromise;
}

/* -------------------------------------------------------------------------- */
/* Extension Lifecycle                                                       */
/* -------------------------------------------------------------------------- */

chrome.runtime.onInstalled.addListener(
  async (details) => {
    console.log(
      "🚀 Resolve extension installed:",
      details.reason
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
  async (
    changes,
    areaName
  ) => {
    const sessionChanged =
      areaName === "local" &&
      Boolean(
        changes.resolveSession
      );

    const settingsChanged =
      areaName === "sync" &&
      Boolean(
        changes.settings
      );

    if (
      !sessionChanged &&
      !settingsChanged
    ) {
      return;
    }

    console.log(
      "🔄 Resolve storage changed."
    );

    await initialize();
  }
);

/* -------------------------------------------------------------------------- */
/* Blocked Navigation Logging                                                 */
/* -------------------------------------------------------------------------- */

chrome.webNavigation.onBeforeNavigate.addListener(
  async (details) => {
    /*
     * Only top-level navigation.
     */
    if (
      details.frameId !== 0
    ) {
      return;
    }

    try {
      const url =
        new URL(
          details.url
        );

      /*
       * Ignore internal browser URLs.
       */
      if (
        url.protocol !==
          "http:" &&
        url.protocol !==
          "https:"
      ) {
        return;
      }

      const hostname =
        url.hostname
          .toLowerCase()
          .replace(
            /^www\./,
            ""
          );

      /*
       * Check whether the navigation
       * belongs to a Resolve domain.
       */
      const blocked =
        blockedSites.some(
          (site) => {
            const normalizedSite =
              site
                .trim()
                .toLowerCase()
                .replace(
                  /^www\./,
                  ""
                );

            return (
              hostname ===
                normalizedSite ||
              hostname.endsWith(
                "." +
                  normalizedSite
              )
            );
          }
        );

      if (!blocked) {
        return;
      }

      console.log(
        `🛡️ Resolve blocked: ${hostname}`
      );

      /*
       * Statistics.
       */
      try {
        await recordBlockedAttempt();
      } catch (
        statsError
      ) {
        console.error(
          "⚠️ Failed to record blocked attempt:",
          statsError
        );
      }

      /*
       * Analytics.
       */
      try {
        await emitEvent({
          type: "site_blocked",

          payload: {
            domain:
              hostname,

            timestamp:
              Date.now(),
          },
        });
      } catch (
        eventError
      ) {
        console.error(
          "⚠️ Failed to send blocked-site event:",
          eventError
        );
      }
    } catch (
      error
    ) {
      console.error(
        "❌ Blocking logger error:",
        error
      );
    }
  }
);

/* -------------------------------------------------------------------------- */
/* External Website → Extension Messaging                                     */
/* -------------------------------------------------------------------------- */

chrome.runtime.onMessageExternal.addListener(
  (
    message,
    sender,
    sendResponse
  ) => {
    const allowedOrigins = [
      "https://resolve-web-two.vercel.app",

      "https://resolve-web-git-main-mugohillarys-projects.vercel.app",

      "http://localhost:5173",

      "http://localhost:3000",
    ];

    const senderOrigin =
      sender.origin;

    if (
      !senderOrigin ||
      !allowedOrigins.includes(
        senderOrigin
      )
    ) {
      console.warn(
        "🚫 Rejected external message from:",
        senderOrigin
      );

      sendResponse({
        success: false,

        message:
          "Unauthorized origin.",
      });

      return false;
    }

    /* ---------------------------------------------------------------------- */
    /* Connect Account                                                        */
    /* ---------------------------------------------------------------------- */

    if (
      message?.type ===
      "RESOLVE_CONNECT_ACCOUNT"
    ) {
      (async () => {
        try {
          const session =
            message.session;

          if (
            !session?.access_token
          ) {
            throw new Error(
              "No Resolve access token provided."
            );
          }

          console.log(
            "🔐 Connecting Resolve account..."
          );

          await saveResolveSession(
            session
          );

          await initialize();

          console.log(
            "✅ Resolve account connected successfully."
          );

          sendResponse({
            success: true,
          });
        } catch (
          error
        ) {
          console.error(
            "❌ Failed to connect Resolve account:",
            error
          );

          sendResponse({
            success: false,

            message:
              error instanceof Error
                ? error.message
                : "Failed to connect account.",
          });
        }
      })();

      return true;
    }

    /* ---------------------------------------------------------------------- */
    /* Disconnect Account                                                     */
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

          await clearResolveSession();

          blockedSites = [];

          await applyBlockingRules(
            []
          );

          console.log(
            "✅ Resolve account disconnected."
          );

          sendResponse({
            success: true,
          });
        } catch (
          error
        ) {
          console.error(
            "❌ Failed to disconnect Resolve account:",
            error
          );

          sendResponse({
            success: false,

            message:
              error instanceof Error
                ? error.message
                : "Failed to disconnect account.",
          });
        }
      })();

      return true;
    }

    /* ---------------------------------------------------------------------- */
    /* Connection Status                                                      */
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
        } catch (
          error
        ) {
          console.error(
            "❌ Failed to get Resolve connection status:",
            error
          );

          sendResponse({
            success: false,

            connected:
              false,

            userId:
              null,

            email:
              null,

            message:
              error instanceof Error
                ? error.message
                : "Failed to get connection status.",
          });
        }
      })();

      return true;
    }

    /* ---------------------------------------------------------------------- */
    /* Unknown Message                                                        */
    /* ---------------------------------------------------------------------- */

    console.warn(
      "⚠️ Unknown Resolve external message:",
      message?.type
    );

    sendResponse({
      success: false,

      message:
        "Unknown Resolve message type.",
    });

    return false;
  }
);

/* -------------------------------------------------------------------------- */
/* Service Worker Startup                                                     */
/* -------------------------------------------------------------------------- */

void initialize();