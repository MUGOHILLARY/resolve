import { useCallback, useEffect, useState } from "react";

import {
  getSubscription,
  type Subscription,
} from "../lib/api";

export function useSubscription() {
  const [subscription, setSubscription] =
    useState<Subscription | null>(null);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState<string | null>(null);

  const loadSubscription =
    useCallback(async () => {
      try {
        setLoading(true);
        setError(null);

        const data = await getSubscription();

        console.log(
          "✅ Resolve subscription:",
          data
        );

        setSubscription(data);
      } catch (err: any) {
        console.error(
          "❌ Failed to load subscription:",
          err
        );

        setError(
          err?.message ??
            "Failed to load subscription."
        );

        setSubscription(null);
      } finally {
        setLoading(false);
      }
    }, []);

  useEffect(() => {
    loadSubscription();
  }, [loadSubscription]);

  /*
  |--------------------------------------------------------------------------
  | Premium Entitlement
  |--------------------------------------------------------------------------
  |
  | Premium requires:
  |
  | 1. plan = premium
  | 2. status = active OR trialing
  | 3. current period has not expired
  |
  |--------------------------------------------------------------------------
  */

  const isPremium = (() => {
    if (!subscription) {
      return false;
    }

    if (subscription.plan !== "premium") {
      return false;
    }

    const validStatus =
      subscription.status === "active" ||
      subscription.status === "trialing";

    if (!validStatus) {
      return false;
    }

    if (subscription.current_period_end) {
      const expiresAt = new Date(
        subscription.current_period_end
      ).getTime();

      if (
        Number.isFinite(expiresAt) &&
        expiresAt < Date.now()
      ) {
        return false;
      }
    }

    return true;
  })();

  return {
    subscription,
    isPremium,
    loading,
    error,
    refreshSubscription: loadSubscription,
  };
}