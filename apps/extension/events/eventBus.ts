/**
 * Resolve Event Bus
 *
 * Sends extension analytics/events to the deployed Resolve API.
 */

const API_URL =
  "https://resolve-api-ty79.onrender.com/api/events";

export type ResolveEvent =
  | {
      type: "site_blocked";
      payload: {
        domain: string;
        timestamp: number;
      };
    }
  | {
      type: "focus_started";
      payload: {
        timestamp: number;
      };
    }
  | {
      type: "focus_finished";
      payload: {
        minutes: number;
        timestamp: number;
      };
    }
  | {
      type: "streak_updated";
      payload: {
        streak: number;
        timestamp: number;
      };
    };

/**
 * Send a Resolve event to the backend.
 */
export async function emitEvent(
  event: ResolveEvent
): Promise<boolean> {
  try {
    console.log(
      "📡 Sending Resolve event:",
      event.type,
      event
    );

    const response = await fetch(API_URL, {
      method: "POST",

      headers: {
        "Content-Type": "application/json",
      },

      body: JSON.stringify(event),
    });

    if (!response.ok) {
      console.error(
        "❌ Resolve event API returned:",
        response.status,
        response.statusText
      );

      return false;
    }

    console.log(
      "✅ Resolve event sent:",
      event.type
    );

    return true;
  } catch (error) {
    console.error(
      "❌ Unable to send Resolve event:",
      error
    );

    return false;
  }
}