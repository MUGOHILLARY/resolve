const API_BASE_URL = "http://localhost:4000";

const SESSION_STORAGE_KEY = "resolveSession";
const SETTINGS_STORAGE_KEY = "settings";

export interface ResolveUser {
  id?: string;
  email?: string;
}

export interface ResolveSession {
  access_token: string;
  refresh_token?: string;
  expires_at?: number;
  user?: ResolveUser;
}

export interface BlockerSettings {
  gambling: boolean;
  adult: boolean;
  social: boolean;
  gaming: boolean;
  customSites: string[];
}

/**
 * Save the logged-in Resolve/Supabase session.
 */
export async function saveResolveSession(
  session: ResolveSession
): Promise<void> {
  await chrome.storage.local.set({
    [SESSION_STORAGE_KEY]: session,
  });

  console.log("✅ Resolve session saved.");
}

/**
 * Retrieve the currently connected Resolve session.
 */
export async function getResolveSession(): Promise<
  ResolveSession | null
> {
  const result = await chrome.storage.local.get(
    SESSION_STORAGE_KEY
  );

  const session =
    result[SESSION_STORAGE_KEY] as
      | ResolveSession
      | undefined;

  return session ?? null;
}

/**
 * Remove the connected Resolve account.
 */
export async function clearResolveSession(): Promise<void> {
  await chrome.storage.local.remove(
    SESSION_STORAGE_KEY
  );

  console.log("🔓 Resolve session cleared.");
}

/**
 * Fetch the logged-in user's blocker settings
 * from the Resolve API and save them locally.
 */
export async function syncSettingsFromResolve(): Promise<
  BlockerSettings | null
> {
  try {
    const session = await getResolveSession();

    if (!session?.access_token) {
      console.warn(
        "⚠️ No Resolve session found. Cannot sync settings."
      );

      return null;
    }

    console.log(
      "🔄 Syncing Resolve settings from API..."
    );

    const response = await fetch(
      `${API_BASE_URL}/api/blocker`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${session.access_token}`,
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      console.error(
        `❌ Resolve blocker API returned ${response.status}`
      );

      if (
        response.status === 401 ||
        response.status === 403
      ) {
        console.warn(
          "🔒 Resolve session is no longer valid."
        );
      }

      return null;
    }

    const result = await response.json();

    const settings =
      result?.settings ??
      result?.data ??
      result;

    if (!settings) {
      console.warn(
        "⚠️ Resolve returned no blocker settings."
      );

      return null;
    }

    const normalizedSettings: BlockerSettings = {
      gambling: Boolean(
        settings.gambling
      ),

      adult: Boolean(
        settings.adult ??
          settings.adult_content
      ),

      social: Boolean(
        settings.social ??
          settings.social_media
      ),

      gaming: Boolean(
        settings.gaming
      ),

      customSites: Array.isArray(
        settings.customSites
      )
        ? settings.customSites
        : Array.isArray(
            settings.custom_sites
          )
        ? settings.custom_sites
        : [],
    };

    /*
     * IMPORTANT:
     * Save the API settings into the same
     * storage area used by getSettings().
     */
    await chrome.storage.sync.set({
      [SETTINGS_STORAGE_KEY]:
        normalizedSettings,
    });

    console.log(
      "✅ Resolve blocker settings synced:",
      normalizedSettings
    );

    return normalizedSettings;
  } catch (error) {
    console.error(
      "❌ Failed to sync Resolve settings:",
      error
    );

    return null;
  }
}