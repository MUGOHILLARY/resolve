import { supabase } from "../lib/supabase";

const API_URL =
  import.meta.env.VITE_API_URL || "http://localhost:4000";

/**
 * Blocker settings returned by the Resolve API.
 */
export interface BlockerSettings {
  id?: string;
  user_id: string;

  adult_content: boolean;
  gambling: boolean;
  social_media: boolean;
  gaming: boolean;

  custom_sites: string[];

  focus_mode: boolean;
  focus_until: string | null;

  emergency_lock: boolean;
  daily_limit: number;

  // Recovery Lock
  recovery_lock_enabled: boolean;
  recovery_lock_level: string | null;
  recovery_lock_until: string | null;
  recovery_lock_reason: string | null;

  created_at?: string;
  updated_at?: string;
}

/**
 * API response wrapper.
 */
interface BlockerSettingsResponse {
  success: boolean;
  settings: BlockerSettings;
  message?: string;
}

/**
 * Error type used when the API returns a non-success status.
 */
interface ApiError extends Error {
  code?: string;
  status?: number;
}

/**
 * Get the current Supabase access token and construct
 * the Authorization header for the Resolve API.
 */
async function getAuthorizationHeader(): Promise<HeadersInit> {
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session?.access_token) {
    throw new Error("You are not authenticated.");
  }

  return {
    Authorization: `Bearer ${session.access_token}`,
    "Content-Type": "application/json",
  };
}

/**
 * Parse an API response safely.
 */
async function parseResponse<T>(
  response: Response
): Promise<T> {
  let data: T | null = null;

  /**
   * 204 No Content is valid and has no JSON body.
   */
  if (response.status !== 204) {
    const contentType =
      response.headers.get("content-type") || "";

    if (contentType.includes("application/json")) {
      try {
        data = (await response.json()) as T;
      } catch {
        throw new Error(
          "The server returned an invalid JSON response."
        );
      }
    } else {
      const text = await response.text();

      if (text) {
        throw new Error(text);
      }
    }
  }

  if (!response.ok) {
    const errorData = data as
      | {
          message?: string;
          code?: string;
        }
      | null;

    const error: ApiError = new Error(
      errorData?.message ||
        `Request failed with status ${response.status}.`
    );

    error.code = errorData?.code;
    error.status = response.status;

    throw error;
  }

  if (data === null) {
    return {} as T;
  }

  return data;
}

/**
 * GET /api/blocker
 *
 * Loads the authenticated user's blocker settings.
 *
 * cache: "no-store" prevents the browser from reusing
 * cached authenticated blocker settings.
 */
export async function getBlockerSettings(): Promise<BlockerSettings> {
  const headers = await getAuthorizationHeader();

  const response = await fetch(`${API_URL}/api/blocker`, {
    method: "GET",
    headers,
    cache: "no-store",
  });

  const data =
    await parseResponse<BlockerSettingsResponse>(response);

  if (!data.success || !data.settings) {
    throw new Error(
      data.message ||
        "Unable to load blocker settings."
    );
  }

  return data.settings;
}

/**
 * PATCH /api/blocker
 *
 * Updates basic blocker settings.
 *
 * Custom websites are deliberately excluded from this
 * endpoint because custom website management is Premium-only.
 */
export async function updateBlockerSettings(
  updates: Partial<BlockerSettings>
): Promise<BlockerSettings> {
  const headers = await getAuthorizationHeader();

  /**
   * Never send protected/system fields or custom_sites
   * through the general update endpoint.
   *
   * Custom sites must go through the Premium-protected
   * custom-site endpoints.
   */
  const {
    custom_sites: _customSites,
    id: _id,
    user_id: _userId,
    created_at: _createdAt,
    updated_at: _updatedAt,
    ...safeUpdates
  } = updates;

  const response = await fetch(`${API_URL}/api/blocker`, {
    method: "PATCH",
    headers: {
      ...headers,
      "Cache-Control": "no-store",
    },
    cache: "no-store",
    body: JSON.stringify(safeUpdates),
  });

  const data =
    await parseResponse<BlockerSettingsResponse>(response);

  if (!data.success || !data.settings) {
    throw new Error(
      data.message ||
        "Unable to update blocker settings."
    );
  }

  return data.settings;
}

/**
 * POST /api/blocker/custom-site
 *
 * Adds a custom website.
 *
 * The API route is Premium-protected.
 */
export async function addCustomWebsite(
  website: string
): Promise<BlockerSettings> {
  const headers = await getAuthorizationHeader();

  const response = await fetch(
    `${API_URL}/api/blocker/custom-site`,
    {
      method: "POST",
      headers,
      cache: "no-store",
      body: JSON.stringify({
        website,
      }),
    }
  );

  const data =
    await parseResponse<BlockerSettingsResponse>(response);

  if (!data.success || !data.settings) {
    throw new Error(
      data.message ||
        "Unable to add custom website."
    );
  }

  return data.settings;
}

/**
 * DELETE /api/blocker/custom-site
 *
 * Removes a custom website.
 *
 * The API route is Premium-protected.
 */
export async function removeCustomWebsite(
  website: string
): Promise<BlockerSettings> {
  const headers = await getAuthorizationHeader();

  const response = await fetch(
    `${API_URL}/api/blocker/custom-site`,
    {
      method: "DELETE",
      headers,
      cache: "no-store",
      body: JSON.stringify({
        website,
      }),
    }
  );

  const data =
    await parseResponse<BlockerSettingsResponse>(response);

  if (!data.success || !data.settings) {
    throw new Error(
      data.message ||
        "Unable to remove custom website."
    );
  }

  return data.settings;
}

/**
 * Activate Resolve Recovery Lock.
 *
 * IMPORTANT:
 * The existing Blocker.tsx calls this function using:
 *
 *   activateRecoveryLock(level, years)
 *
 * where:
 *   level = string
 *   years = number
 *
 * We preserve that interface so Blocker.tsx does not need
 * to be changed.
 *
 * The numeric duration is converted into an absolute
 * ISO timestamp before being sent to the API.
 */
export async function activateRecoveryLock(
  level: string,
  years: number
): Promise<BlockerSettings> {
  if (!level) {
    throw new Error(
      "Recovery lock level is required."
    );
  }

  if (
    !Number.isFinite(years) ||
    years <= 0
  ) {
    throw new Error(
      "Recovery lock duration must be greater than zero."
    );
  }

  const recoveryLockUntil = new Date();

  /**
   * Convert years to days.
   *
   * Using 365 days preserves the existing duration model
   * used by the Blocker UI.
   */
  recoveryLockUntil.setDate(
    recoveryLockUntil.getDate() +
      Math.round(years * 365)
  );

  return updateBlockerSettings({
    recovery_lock_enabled: true,
    recovery_lock_level: level,
    recovery_lock_until:
      recoveryLockUntil.toISOString(),
    recovery_lock_reason: "Recovery",
  });
}

/**
 * Disable Resolve Recovery Lock.
 */
export async function disableRecoveryLock(): Promise<BlockerSettings> {
  return updateBlockerSettings({
    recovery_lock_enabled: false,
    recovery_lock_level: null,
    recovery_lock_until: null,
    recovery_lock_reason: null,
  });
}