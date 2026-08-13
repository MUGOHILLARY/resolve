import { getSettings } from "./storage/settings";
import { buildWebsiteList } from "./rules/buildRules";
import { applyBlockingRules } from "./background/blockerEngine";
import { emitEvent } from "./events/eventBus";
import { recordBlockedAttempt } from "./stats";

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

/**
 * Prevent multiple initialization processes
 * from running simultaneously.
 */
let initializationPromise: Promise<void> | null = null;

/* -------------------------------------------------------------------------- */
/* Resolve Initialization                                                     */
/* -------------------------------------------------------------------------- */

async function initialize(): Promise<void> {
  if (initializationPromise) {
    return initializationPromise;
  }

  initializationPromise = (async () => {
    try {
      console.log("🔄 Resolve initialization started.");

      /* -------------------------------------------------------------------- */
      /* Synchronize Resolve settings                                         */
      /* -------------------------------------------------------------------- */

      let syncedSettings = null;

      try {
        syncedSettings =
          await syncSettingsFromResolve();
      } catch (error) {
        console.warn(
          "⚠️ Resolve settings synchronization failed. Using local settings.",
          error
        );
      }

      /* -------------------------------------------------------------------- */
      /* Get settings                                                         */
      /* -------------------------------------------------------------------- */

      const settings =
        syncedSettings ?? (await getSettings());

      console.log(
        "⚙️ Resolve settings:",
        settings
      );

      /* -------------------------------------------------------------------- */
      /* Build website list                                                   */
      /* -------------------------------------------------------------------- */

      blockedSites =
        buildWebsiteList(settings);

      console.log(
        `🛡️ Resolve blocking ${blockedSites.length} domains.`
      );

      console.log(
        "🌐 Resolve blocked domains:",
        blockedSites
      );

      /* -------------------------------------------------------------------- */
      /* Install DNR rules                                                    */
      /* -------------------------------------------------------------------- */

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
      initializationPromise = null;
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

/**
 * Resolve settings may live in chrome.storage.sync.
 *
 * Resolve authentication session lives in chrome.storage.local.
 *
 * Therefore listen to both storage areas.
 */
chrome.storage.onChanged.addListener(
  async (changes, areaName) => {
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
      "🔄 Resolve storage changed. Reinitializing..."
    );

    await initialize();
  }
);

/* -------------------------------------------------------------------------- */
/* Website Blocking Logger                                                    */
/* -------------------------------------------------------------------------- */

/**
 * DNR performs the actual redirect.
 *
 * This listener records blocked navigation
 * attempts and emits analytics.
 */
chrome.webNavigation.onBeforeNavigate.addListener(
  async (details) => {
    /* ---------------------------------------------------------------------- */
    /* Only process top-level navigation                                     */
    /* ---------------------------------------------------------------------- */

    if (details.frameId !== 0) {
      return;
    }

    try {
      const url =
        new URL(details.url);

      /* -------------------------------------------------------------------- */
      /* Ignore browser/internal URLs                                        */
      /* -------------------------------------------------------------------- */

      if (
        url.protocol !== "http:" &&
        url.protocol !== "https:"
      ) {
        return;
      }

      /* -------------------------------------------------------------------- */
      /* Normalize hostname                                                   */
      /* -------------------------------------------------------------------- */

      const hostname =
        url.hostname
          .toLowerCase()
          .replace(/^www\./, "");

      /* -------------------------------------------------------------------- */
      /* Check whether hostname is blocked                                   */
      /* -------------------------------------------------------------------- */

      const blocked =
        blockedSites.some(
          (site) => {
            const normalizedSite =
              site
                .trim()
                .toLowerCase()
                .replace(/^www\./, "");

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

      /* -------------------------------------------------------------------- */
      /* Record blocked attempt                                              */
      /* -------------------------------------------------------------------- */

      try {
        await recordBlockedAttempt();

        console.log(
          "📊 Resolve blocked attempt recorded."
        );
      } catch (statsError) {
        console.error(
          "⚠️ Failed to record blocked attempt:",
          statsError
        );
      }

      /* -------------------------------------------------------------------- */
      /* Send analytics event                                                */
      /* -------------------------------------------------------------------- */

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
/* Blocked Recovery Page Events                                               */
/* -------------------------------------------------------------------------- */

/**
 * blocked.html sends this message after it loads:
 *
 * RESOLVE_BLOCKED_PAGE_OPENED
 *
 * We use this to:
 *
 * 1. Confirm the Resolve recovery page opened.
 * 2. Read the current blocking statistics.
 * 3. Return statistics to blocked.ts.
 *
 * IMPORTANT:
 *
 * We DO NOT call recordBlockedAttempt() here.
 *
 * webNavigation.onBeforeNavigate already records
 * the blocked attempt.
 */
chrome.runtime.onMessage.addListener(
  (
    message,
    sender,
    sendResponse
  ) => {
    if (
      message?.type !==
      "RESOLVE_BLOCKED_PAGE_OPENED"
    ) {
      return false;
    }

    (async () => {
      try {
        /* ------------------------------------------------------------------ */
        /* Normalize domain                                                   */
        /* ------------------------------------------------------------------ */

        const domain =
          typeof message.domain ===
          "string"
            ? message.domain
                .trim()
                .toLowerCase()
            : "unknown";

        console.log(
          "🛡️ Resolve recovery page opened for:",
          domain
        );

        /* ------------------------------------------------------------------ */
        /* Read Resolve statistics                                            */
        /* ------------------------------------------------------------------ */

        /**
         * IMPORTANT:
         *
         * stats.ts stores statistics under:
         *
         * resolveStats
         *
         * Therefore the blocked page must read
         * the SAME storage object.
         */
        const storage =
          await chrome.storage.local.get(
            "resolveStats"
          );

        const stats =
          storage.resolveStats ?? {};

        /* ------------------------------------------------------------------ */
        /* Extract statistics                                                 */
        /* ------------------------------------------------------------------ */

        const blockedToday =
          Number(
            stats.blockedToday ?? 0
          );

        const recoveryDays =
          Number(
            stats.streak ?? 0
          );

        const moneySaved =
          Number(
            stats.moneySaved ?? 0
          );

        console.log(
          "📊 Resolve blocked-page statistics:",
          {
            success: true,
            domain,
            blockedToday,
            recoveryDays,
            moneySaved,
          }
        );

        /* ------------------------------------------------------------------ */
        /* Return statistics to blocked.ts                                    */
        /* ------------------------------------------------------------------ */

        sendResponse({
          success: true,

          domain,

          blockedToday,

          recoveryDays,

          moneySaved,
        });
      } catch (error) {
        console.error(
          "❌ Blocked-page event error:",
          error
        );

        sendResponse({
          success: false,

          domain:
            typeof message.domain ===
            "string"
              ? message.domain
              : "unknown",

          blockedToday: 0,

          recoveryDays: 0,

          moneySaved: 0,
        });
      }
    })();

    /*
     * Keep the message channel open for the
     * asynchronous response.
     */
    return true;
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
    /* ---------------------------------------------------------------------- */
    /* Allowed Resolve application origins                                   */
    /* ---------------------------------------------------------------------- */

    const allowedOrigins = [
      "https://resolve-web-two.vercel.app",
      "https://resolve-web-git-main-mugohillarys-projects.vercel.app",
      "http://localhost:5173",
      "http://localhost:3000",
    ];

    const senderOrigin =
      sender.origin;

    /* ---------------------------------------------------------------------- */
    /* Validate sender                                                       */
    /* ---------------------------------------------------------------------- */

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

    /* ====================================================================== */
    /* Connect Resolve Account                                                */
    /* ====================================================================== */

    if (
      message?.type ===
      "RESOLVE_CONNECT_ACCOUNT"
    ) {
      (async () => {
        try {
          const session =
            message.session;

          /* ---------------------------------------------------------------- */
          /* Validate session                                                 */
          /* ---------------------------------------------------------------- */

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

          /* ---------------------------------------------------------------- */
          /* Save session                                                     */
          /* ---------------------------------------------------------------- */

          await saveResolveSession(
            session
          );

          /* ---------------------------------------------------------------- */
          /* Immediately synchronize and rebuild rules                       */
          /* ---------------------------------------------------------------- */

          await initialize();

          console.log(
            "✅ Resolve account connected successfully."
          );

          sendResponse({
            success: true,
          });
        } catch (error) {
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

    /* ====================================================================== */
    /* Disconnect Resolve Account                                             */
    /* ====================================================================== */

    if (
      message?.type ===
      "RESOLVE_DISCONNECT_ACCOUNT"
    ) {
      (async () => {
        try {
          console.log(
            "🔓 Disconnecting Resolve account..."
          );

          /* ---------------------------------------------------------------- */
          /* Remove session                                                   */
          /* ---------------------------------------------------------------- */

          await clearResolveSession();

          /* ---------------------------------------------------------------- */
          /* Clear memory                                                     */
          /* ---------------------------------------------------------------- */

          blockedSites = [];

          /* ---------------------------------------------------------------- */
          /* Remove DNR rules                                                 */
          /* ---------------------------------------------------------------- */

          await applyBlockingRules([]);

          console.log(
            "✅ Resolve account disconnected."
          );

          sendResponse({
            success: true,
          });
        } catch (error) {
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

    /* ====================================================================== */
    /* Get Connection Status                                                  */
    /* ====================================================================== */

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
        } catch (error) {
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
              error instanceof Error
                ? error.message
                : "Failed to get connection status.",
          });
        }
      })();

      return true;
    }

    /* ====================================================================== */
    /* Unknown Message                                                        */
    /* ====================================================================== */

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
/* Initial Service Worker Startup                                            */
/* -------------------------------------------------------------------------- */

/**
 * The service worker can start without onInstalled/onStartup
 * firing for the current event.
 *
 * Therefore initialize once when this file is evaluated.
 */
void initialize();