const API_BASE_URL =
  "https://resolve-api-ty79.onrender.com";

const SESSION_STORAGE_KEY = "resolveSession";
const SETTINGS_STORAGE_KEY = "settings";

export interface ResolveUser {
  id?: string;
  email?: string;
  [key: string]: unknown;
}

export interface ResolveSession {
  access_token: string;
  refresh_token?: string;
  expires_at?: number;
  expires_in?: number;
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
 * Save the authenticated Resolve/Supabase session.
 */
export async function saveResolveSession(
  session: ResolveSession
): Promise<void> {
  if (!session?.access_token) {
    throw new Error(
      "Cannot save Resolve session: access token is missing."
    );
  }

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
 * Save blocker settings locally.
 */
async function saveSettings(
  settings: BlockerSettings
): Promise<void> {
  await chrome.storage.sync.set({
    [SETTINGS_STORAGE_KEY]: settings,
  });
}

/**
 * Fetch blocker settings from the Resolve API.
 */
export async function syncSettingsFromResolve(): Promise<
  BlockerSettings | null
> {
  try {
    const session =
      await getResolveSession();

    if (!session?.access_token) {
      console.warn(
        "⚠️ No Resolve session found. Cannot sync settings."
      );

      return null;
    }

    console.log(
      "🔄 Syncing Resolve settings from API..."
    );

    console.log(
      "🌐 API URL:",
      `${API_BASE_URL}/api/blocker`
    );

    const response = await fetch(
      `${API_BASE_URL}/api/blocker`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${session.access_token}`,
          Accept: "application/json",
        },
      }
    );

    console.log(
      "📡 Blocker API status:",
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
        "❌ Resolve blocker API returned:",
        response.status,
        errorBody
      );

      if (
        response.status === 401 ||
        response.status === 403
      ) {
        console.warn(
          "🔒 Resolve session is no longer valid."
        );

        await clearResolveSession();
      }

      return null;
    }

    const result =
      await response.json();

    console.log(
      "📥 Resolve blocker API response:",
      result
    );

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

      customSites:
        Array.isArray(
          settings.customSites
        )
          ? settings.customSites
          : Array.isArray(
              settings.custom_sites
            )
          ? settings.custom_sites
          : [],
    };

    await saveSettings(
      normalizedSettings
    );

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