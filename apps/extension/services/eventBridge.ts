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
      };
    };

type Listener = (event: ResolveEvent) => void;

const listeners = new Set<Listener>();

export function subscribe(listener: Listener) {
  listeners.add(listener);

  return () => listeners.delete(listener);
}

export function publish(event: ResolveEvent) {
  listeners.forEach(listener => listener(event));
}