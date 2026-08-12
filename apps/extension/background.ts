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
 * Prevent multiple initialization processes from running simultaneously.
 *
 * Initialization can be triggered by:
 * - extension installation
 * - browser startup
 * - storage changes
 * - account connection
 * - service-worker startup
 */
let initializationPromise: Promise<void> | null = null;

/* -------------------------------------------------------------------------- */
/* Resolve Initialization                                                     */
/* -------------------------------------------------------------------------- */

async function initialize(): Promise<void> {
  /**
   * If initialization is already running, wait for it instead
   * of starting another DNR update.
   */
  if (initializationPromise) {
    return initializationPromise;
  }

  initializationPromise = (async () => {
    try {
      console.log("🔄 Resolve initialization started.");

      /**
       * Try to synchronize the logged-in Resolve user's settings.
       *
       * If there is no connected account, this returns null and
       * we continue using the locally stored settings.
       */
      const syncedSettings =
        await syncSettingsFromResolve();

      /**
       * Use the freshly synchronized settings when available.
       * Otherwise fall back to local extension settings.
       */
      const settings =
        syncedSettings ?? await getSettings();

      /**
       * Convert settings into the actual website list.
       */
      blockedSites =
        buildWebsiteList(settings);

      console.log(
        "🛡️ Resolve blocking sites:",
        blockedSites
      );

      /**
       * Replace the current DNR rules.
       */
      await applyBlockingRules(
        blockedSites
      );

      console.log(
        `✅ Resolve initialized with ${blockedSites.length} blocked websites.`
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
/* Extension Lifecycle                                                        */
/* -------------------------------------------------------------------------- */

chrome.runtime.onInstalled.addListener(
  async (details) => {
    console.log(
      "🚀 Resolve extension installed.",
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
 * Blocker settings use chrome.storage.sync.
 *
 * Resolve session uses chrome.storage.local.
 *
 * Therefore we listen to BOTH storage areas.
 */
chrome.storage.onChanged.addListener(
  async (changes, areaName) => {
    const sessionChanged =
      areaName === "local" &&
      Boolean(changes.resolveSession);

    const settingsChanged =
      areaName === "sync" &&
      Boolean(changes.settings);

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
 * Declarative Net Request performs the actual blocking.
 *
 * This listener is only responsible for:
 *
 * - detecting navigation to a blocked domain
 * - recording the blocked attempt
 * - sending an analytics event
 */
chrome.webNavigation.onBeforeNavigate.addListener(
  async (details) => {
    /**
     * Only process top-level navigation.
     */
    if (details.frameId !== 0) {
      return;
    }

    try {
      const url =
        new URL(details.url);

      /**
       * Ignore browser/internal URLs.
       */
      if (
        url.protocol !== "http:" &&
        url.protocol !== "https:"
      ) {
        return;
      }

      /**
       * Normalize hostname.
       */
      const hostname =
        url.hostname
          .toLowerCase()
          .replace(/^www\./, "");

      /**
       * Check whether the hostname belongs
       * to one of Resolve's blocked domains.
       */
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
                "." + normalizedSite
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

      /**
       * Record the attempt locally.
       *
       * Failure here should not affect
       * the blocking mechanism.
       */
      try {
        await recordBlockedAttempt();
      } catch (statsError) {
        console.error(
          "⚠️ Failed to record blocked attempt:",
          statsError
        );
      }

      /**
       * Send analytics event.
       *
       * Failure here must NOT affect blocking.
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
    /**
     * Only these Resolve applications
     * are allowed to communicate with
     * the extension.
     */
    const allowedOrigins = [
      "https://resolve-web-two.vercel.app",
      "https://resolve-web-git-main-mugohillarys-projects.vercel.app",
      "http://localhost:5173",
      "http://localhost:3000",
    ];

    /**
     * Chrome/Edge normally provides sender.origin
     * for externally connected web pages.
     */
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
    /* Connect Resolve Account                                                */
    /* ---------------------------------------------------------------------- */

    if (
      message?.type ===
      "RESOLVE_CONNECT_ACCOUNT"
    ) {
      (async () => {
        try {
          const session =
            message.session;

          /**
           * A valid Supabase session
           * must contain an access token.
           */
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

          /**
           * Save session to extension
           * local storage.
           */
          await saveResolveSession(
            session
          );

          /**
           * Immediately synchronize
           * Resolve settings and rebuild
           * blocking rules.
           */
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

      /**
       * Keep the message channel open
       * for the asynchronous response.
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

          /**
           * Remove stored session.
           */
          await clearResolveSession();

          /**
           * Clear in-memory blocking list.
           */
          blockedSites = [];

          /**
           * Remove active DNR rules.
           */
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
/* Initial Service Worker Startup                                            */
/* -------------------------------------------------------------------------- */

/**
 * The service worker can start without onInstalled/onStartup
 * firing for the current event.
 *
 * Therefore initialize once when this file is evaluated.
 */
void initialize();