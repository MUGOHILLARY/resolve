const API_URL = "http://localhost:4000/api/events";

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

export async function emitEvent(
  event: ResolveEvent
): Promise<boolean> {
  try {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(event),
    });

    if (!response.ok) {
      console.error(
        "Resolve API returned:",
        response.status,
        response.statusText
      );
      return false;
    }

    console.log("Resolve event sent:", event.type);

    return true;
  } catch (error) {
    console.error(
      "Unable to send Resolve event:",
      error
    );

    return false;
  }
}