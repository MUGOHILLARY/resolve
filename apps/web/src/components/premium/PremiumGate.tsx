import type { ReactNode } from "react";

import { useSubscription } from "../../hooks/useSubscription";

type PremiumGateProps = {
  children: ReactNode;
  fallback?: ReactNode;
};

export default function PremiumGate({
  children,
  fallback,
}: PremiumGateProps) {
  const {
    isPremium,
    loading,
    error,
  } = useSubscription();

  /*
   * Still checking subscription.
   */
  if (loading) {
    return (
      <div className="rounded-2xl border border-slate-700 bg-slate-900 p-6">
        <p className="text-sm text-slate-400">
          Checking Premium access...
        </p>
      </div>
    );
  }

  /*
   * Subscription request failed.
   *
   * Fail closed:
   * never expose a Premium feature when
   * entitlement cannot be verified.
   */
  if (error) {
    return (
      <div className="rounded-2xl border border-red-500/30 bg-red-500/10 p-6">
        <h3 className="text-lg font-semibold text-red-400">
          Unable to verify Premium access
        </h3>

        <p className="mt-1 text-sm text-red-300/80">
          {error}
        </p>
      </div>
    );
  }

  /*
   * Premium user.
   */
  if (isPremium) {
    return <>{children}</>;
  }

  /*
   * Free user with custom fallback.
   */
  if (fallback) {
    return <>{fallback}</>;
  }

  /*
   * Free user.
   */
  return (
    <div className="rounded-2xl border border-slate-700 bg-slate-900 p-6 shadow-sm">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h3 className="text-lg font-semibold text-white">
            Premium Feature
          </h3>

          <p className="mt-1 text-sm text-slate-400">
            Upgrade to Resolve Premium to unlock this feature.
          </p>
        </div>

        <span className="rounded-full bg-slate-700 px-3 py-1 text-xs font-semibold text-slate-300">
          PREMIUM
        </span>
      </div>
    </div>
  );
}