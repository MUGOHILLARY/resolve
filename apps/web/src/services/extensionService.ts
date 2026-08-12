import { supabase } from "../lib/supabase";

declare global {
  interface Window {
    chrome?: {
      runtime?: {
        sendMessage?: (
          extensionId: string,
          message: unknown,
          callback?: (response: unknown) => void
        ) => void;

        lastError?: {
          message?: string;
        };
      };
    };
  }
}

const EXTENSION_ID =
  import.meta.env.VITE_RESOLVE_EXTENSION_ID;

export interface ExtensionResponse {
  success?: boolean;
  connected?: boolean;
  message?: string;
  userId?: string | null;
  email?: string | null;
}

/**
 * Type guard for extension responses.
 */
function isExtensionResponse(
  response: unknown
): response is ExtensionResponse {
  if (response === null || typeof response !== "object") {
    return false;
  }

  const value = response as Record<string, unknown>;

  return (
    value.success === undefined ||
    typeof value.success === "boolean"
  ) &&
    (
      value.connected === undefined ||
      typeof value.connected === "boolean"
    ) &&
    (
      value.message === undefined ||
      typeof value.message === "string"
    ) &&
    (
      value.userId === undefined ||
      value.userId === null ||
      typeof value.userId === "string"
    ) &&
    (
      value.email === undefined ||
      value.email === null ||
      typeof value.email === "string"
    );
}

/**
 * Check whether extension messaging is available.
 */
function isExtensionAvailable(): boolean {
  return Boolean(
    window.chrome?.runtime?.sendMessage
  );
}

/**
 * Get Chrome/Edge runtime error safely.
 */
function getRuntimeError(): string | null {
  const runtimeError =
    window.chrome?.runtime?.lastError;

  if (!runtimeError) {
    return null;
  }

  return (
    runtimeError.message ??
    "Chrome/Edge extension messaging failed."
  );
}

/**
 * Connect the currently logged-in Resolve user
 * to the Resolve browser extension.
 */
export async function connectResolveExtension(): Promise<ExtensionResponse> {
  if (!EXTENSION_ID) {
    throw new Error(
      "Resolve extension ID is not configured. Set VITE_RESOLVE_EXTENSION_ID."
    );
  }

  if (!isExtensionAvailable()) {
    throw new Error(
      "Chrome/Edge extension messaging is unavailable."
    );
  }

  const {
    data: { session },
    error,
  } = await supabase.auth.getSession();

  if (error) {
    throw error;
  }

  if (!session?.access_token) {
    throw new Error(
      "You must be logged in to connect Resolve."
    );
  }

  return new Promise((resolve, reject) => {
    window.chrome!.runtime!.sendMessage!(
      EXTENSION_ID,
      {
        type: "RESOLVE_CONNECT_ACCOUNT",

        session: {
          access_token: session.access_token,
          refresh_token: session.refresh_token,
          user: session.user,
        },
      },

      (rawResponse: unknown) => {
        const runtimeError = getRuntimeError();

        if (runtimeError) {
          reject(
            new Error(
              runtimeError
            )
          );

          return;
        }

        if (!isExtensionResponse(rawResponse)) {
          reject(
            new Error(
              "Invalid response received from Resolve extension."
            )
          );

          return;
        }

        if (rawResponse.success === false) {
          reject(
            new Error(
              rawResponse.message ??
                "Resolve extension rejected the connection."
            )
          );

          return;
        }

        resolve(rawResponse);
      }
    );
  });
}

/**
 * Ask the extension whether the current browser
 * has a Resolve session.
 */
export async function getExtensionConnectionStatus(): Promise<ExtensionResponse> {
  if (!EXTENSION_ID) {
    throw new Error(
      "Resolve extension ID is not configured."
    );
  }

  if (!isExtensionAvailable()) {
    throw new Error(
      "Extension messaging is unavailable."
    );
  }

  return new Promise((resolve, reject) => {
    window.chrome!.runtime!.sendMessage!(
      EXTENSION_ID,
      {
        type: "RESOLVE_GET_CONNECTION_STATUS",
      },

      (rawResponse: unknown) => {
        const runtimeError = getRuntimeError();

        if (runtimeError) {
          reject(
            new Error(runtimeError)
          );

          return;
        }

        if (!rawResponse) {
          resolve({
            success: false,
            connected: false,
          });

          return;
        }

        if (!isExtensionResponse(rawResponse)) {
          reject(
            new Error(
              "Invalid response received from Resolve extension."
            )
          );

          return;
        }

        resolve(rawResponse);
      }
    );
  });
}

/**
 * Disconnect Resolve from the extension.
 */
export async function disconnectResolveExtension(): Promise<ExtensionResponse> {
  if (!EXTENSION_ID) {
    throw new Error(
      "Resolve extension ID is not configured."
    );
  }

  if (!isExtensionAvailable()) {
    throw new Error(
      "Extension messaging is unavailable."
    );
  }

  return new Promise((resolve, reject) => {
    window.chrome!.runtime!.sendMessage!(
      EXTENSION_ID,
      {
        type: "RESOLVE_DISCONNECT_ACCOUNT",
      },

      (rawResponse: unknown) => {
        const runtimeError = getRuntimeError();

        if (runtimeError) {
          reject(
            new Error(
              runtimeError
            )
          );

          return;
        }

        if (!rawResponse) {
          resolve({
            success: false,
          });

          return;
        }

        if (!isExtensionResponse(rawResponse)) {
          reject(
            new Error(
              "Invalid response received from Resolve extension."
            )
          );

          return;
        }

        resolve(rawResponse);
      }
    );
  });
}