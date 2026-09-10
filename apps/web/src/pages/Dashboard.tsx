import {
  Flame,
  Clock3,
  Target,
  Shield,
  Check,
  Crown,
} from "lucide-react";

import { useState } from "react";

import WelcomeBanner from "../components/dashboard/WelcomeBanner";
import InsightCard from "../components/dashboard/InsightCard";
import WeeklyChart from "../components/dashboard/WeeklyChart";
import QuickActions from "../components/dashboard/QuickActions";
import RecoveryScore from "../components/dashboard/RecoveryScore";
import RecentActivity from "../components/dashboard/RecentActivity";

import { useDashboardStore } from "../store/dashboardStore";
import { useStreakStore } from "../store/streakStore";

import { useSubscription } from "../hooks/useSubscription";
import PremiumGate from "../components/premium/PremiumGate";

import { startPaystackCheckout } from "../services/subscriptionService";

export default function Dashboard() {
  const streak = useStreakStore(
    (state) => state.streak
  );

  const {
    focusTime,
    urgesResisted,
    blockedSites,
  } = useDashboardStore();

  /*
   * ------------------------------------------------------------------
   * Premium Subscription
   * ------------------------------------------------------------------
   */

  const {
    subscription,
    isPremium,
    loading: subscriptionLoading,
    error: subscriptionError,
    refreshSubscription,
  } = useSubscription();

  /*
   * ------------------------------------------------------------------
   * Paystack Checkout
   * ------------------------------------------------------------------
   */

  const [checkoutPlan, setCheckoutPlan] =
    useState<"monthly" | "yearly" | null>(null);

  const [checkoutError, setCheckoutError] =
    useState<string | null>(null);

  async function handleCheckout(
    plan: "monthly" | "yearly"
  ) {
    try {
      setCheckoutError(null);
      setCheckoutPlan(plan);

      await startPaystackCheckout(plan);
    } catch (error: any) {
      console.error(
        "❌ Resolve Premium checkout failed:",
        error
      );

      setCheckoutError(
        error?.message ??
          "Unable to start Premium checkout. Please try again."
      );

      setCheckoutPlan(null);
    }
  }

  return (
    <div className="space-y-6">

      {/* ------------------------------------------------------------------ */}
      {/* Welcome                                                            */}
      {/* ------------------------------------------------------------------ */}

      <WelcomeBanner />

      {/* ------------------------------------------------------------------ */}
      {/* PREMIUM SUBSCRIPTION                                               */}
      {/* ------------------------------------------------------------------ */}

      <section className="rounded-2xl border border-slate-700 bg-slate-900 p-5 shadow-sm">

        <div className="mb-5 flex items-center justify-between">

          <div>
            <div className="flex items-center gap-2">

              <Crown
                size={20}
                className="text-amber-400"
              />

              <h2 className="text-lg font-semibold text-white">
                Resolve Membership
              </h2>

            </div>

            <p className="mt-1 text-sm text-slate-400">
              Your Resolve Premium membership and subscription status.
            </p>
          </div>

          {!subscriptionLoading &&
            !subscriptionError && (
              <span
                className={`rounded-full px-3 py-1 text-xs font-semibold ${
                  isPremium
                    ? "bg-emerald-500/20 text-emerald-400"
                    : "bg-slate-700 text-slate-300"
                }`}
              >
                {isPremium
                  ? "PREMIUM"
                  : "FREE"}
              </span>
            )}

        </div>

        {/* -------------------------------------------------------------- */}
        {/* Loading                                                        */}
        {/* -------------------------------------------------------------- */}

        {subscriptionLoading ? (

          <div className="rounded-xl bg-slate-800 p-4">

            <p className="text-sm text-slate-400">
              Checking your subscription...
            </p>

          </div>

        ) : subscriptionError ? (

          /* ------------------------------------------------------------ */
          /* Subscription Error                                           */
          /* ------------------------------------------------------------ */

          <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-4">

            <p className="text-sm font-medium text-red-400">
              Failed to load subscription
            </p>

            <p className="mt-1 text-sm text-red-300/80">
              {subscriptionError}
            </p>

            <button
              type="button"
              onClick={refreshSubscription}
              className="mt-3 rounded-lg bg-slate-700 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-600"
            >
              Try Again
            </button>

          </div>

        ) : (

          <>
            {/* -------------------------------------------------------- */}
            {/* Current Subscription                                      */}
            {/* -------------------------------------------------------- */}

            <div className="grid gap-4 sm:grid-cols-3">

              {/* Plan */}

              <div className="rounded-xl bg-slate-800 p-4">

                <p className="text-xs uppercase tracking-wide text-slate-500">
                  Plan
                </p>

                <p className="mt-2 text-xl font-semibold capitalize text-white">
                  {subscription?.plan ??
                    "Unknown"}
                </p>

              </div>

              {/* Status */}

              <div className="rounded-xl bg-slate-800 p-4">

                <p className="text-xs uppercase tracking-wide text-slate-500">
                  Status
                </p>

                <p className="mt-2 text-xl font-semibold capitalize text-white">
                  {subscription?.status ??
                    "Unknown"}
                </p>

              </div>

              {/* Premium Access */}

              <div className="rounded-xl bg-slate-800 p-4">

                <p className="text-xs uppercase tracking-wide text-slate-500">
                  Premium Access
                </p>

                <p
                  className={`mt-2 text-xl font-semibold ${
                    isPremium
                      ? "text-emerald-400"
                      : "text-slate-300"
                  }`}
                >
                  {isPremium
                    ? "Enabled"
                    : "Not Enabled"}
                </p>

              </div>

            </div>

            {/* -------------------------------------------------------- */}
            {/* Premium Member                                            */}
            {/* -------------------------------------------------------- */}

            {isPremium ? (

              <div className="mt-5 rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-5">

                <div className="flex items-start gap-4">

                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-500/20">

                    <Crown
                      size={22}
                      className="text-emerald-400"
                    />

                  </div>

                  <div>

                    <h3 className="font-semibold text-emerald-400">
                      Resolve Premium is active
                    </h3>

                    <p className="mt-1 text-sm text-emerald-300/80">
                      You have full access to your Premium features.
                    </p>

                    {subscription?.current_period_end && (
                      <p className="mt-2 text-xs text-emerald-300/60">
                        Current period ends{" "}
                        {new Date(
                          subscription.current_period_end
                        ).toLocaleDateString()}
                      </p>
                    )}

                  </div>

                </div>

              </div>

            ) : (

              /* ------------------------------------------------------ */
              /* Premium Pricing                                         */
              /* ------------------------------------------------------ */

              <div className="mt-6">

                <div className="mb-5">

                  <h3 className="text-xl font-bold text-white">
                    Upgrade to Resolve Premium
                  </h3>

                  <p className="mt-1 text-sm text-slate-400">
                    Unlock the full Resolve recovery experience.
                  </p>

                </div>

                {/* Checkout Error */}

                {checkoutError && (

                  <div className="mb-5 rounded-xl border border-red-500/30 bg-red-500/10 p-4">

                    <p className="text-sm font-medium text-red-400">
                      Payment could not be started
                    </p>

                    <p className="mt-1 text-sm text-red-300/80">
                      {checkoutError}
                    </p>

                  </div>

                )}

                <div className="grid gap-5 md:grid-cols-2">

                  {/* -------------------------------------------------- */}
                  {/* Monthly Plan                                        */}
                  {/* -------------------------------------------------- */}

                  <div className="relative rounded-2xl border border-slate-700 bg-slate-800 p-6">

                    <div className="mb-5">

                      <p className="text-sm font-semibold uppercase tracking-wide text-slate-400">
                        Monthly
                      </p>

                      <div className="mt-2 flex items-end gap-1">

                        <span className="text-4xl font-bold text-white">
                          $6.99
                        </span>

                        <span className="mb-1 text-sm text-slate-400">
                          / month
                        </span>

                      </div>

                    </div>

                    <div className="space-y-3">

                      <div className="flex items-center gap-2 text-sm text-slate-300">
                        <Check
                          size={17}
                          className="text-emerald-400"
                        />
                        Full Premium access
                      </div>

                      <div className="flex items-center gap-2 text-sm text-slate-300">
                        <Check
                          size={17}
                          className="text-emerald-400"
                        />
                        Advanced recovery insights
                      </div>

                      <div className="flex items-center gap-2 text-sm text-slate-300">
                        <Check
                          size={17}
                          className="text-emerald-400"
                        />
                        Premium statistics
                      </div>

                      <div className="flex items-center gap-2 text-sm text-slate-300">
                        <Check
                          size={17}
                          className="text-emerald-400"
                        />
                        AI Coach access
                      </div>

                    </div>

                    <button
                      type="button"
                      disabled={
                        checkoutPlan !== null
                      }
                      onClick={() =>
                        handleCheckout("monthly")
                      }
                      className="mt-6 w-full rounded-xl bg-emerald-500 px-5 py-3 font-semibold text-slate-950 transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {checkoutPlan ===
                      "monthly"
                        ? "Opening Paystack..."
                        : "Choose Monthly"}
                    </button>

                  </div>

                  {/* -------------------------------------------------- */}
                  {/* Yearly Plan                                         */}
                  {/* -------------------------------------------------- */}

                  <div className="relative rounded-2xl border border-emerald-500/50 bg-slate-800 p-6">

                    {/* Best Value */}

                    <div className="absolute right-4 top-4 rounded-full bg-emerald-500/20 px-3 py-1 text-xs font-bold text-emerald-400">
                      BEST VALUE
                    </div>

                    <div className="mb-5 pr-24">

                      <p className="text-sm font-semibold uppercase tracking-wide text-slate-400">
                        Yearly
                      </p>

                      <div className="mt-2 flex items-end gap-1">

                        <span className="text-4xl font-bold text-white">
                          $72.99
                        </span>

                        <span className="mb-1 text-sm text-slate-400">
                          / year
                        </span>

                      </div>

                    </div>

                    <div className="space-y-3">

                      <div className="flex items-center gap-2 text-sm text-slate-300">
                        <Check
                          size={17}
                          className="text-emerald-400"
                        />
                        Full Premium access
                      </div>

                      <div className="flex items-center gap-2 text-sm text-slate-300">
                        <Check
                          size={17}
                          className="text-emerald-400"
                        />
                        Advanced recovery insights
                      </div>

                      <div className="flex items-center gap-2 text-sm text-slate-300">
                        <Check
                          size={17}
                          className="text-emerald-400"
                        />
                        Premium statistics
                      </div>

                      <div className="flex items-center gap-2 text-sm text-slate-300">
                        <Check
                          size={17}
                          className="text-emerald-400"
                        />
                        AI Coach access
                      </div>

                    </div>

                    <button
                      type="button"
                      disabled={
                        checkoutPlan !== null
                      }
                      onClick={() =>
                        handleCheckout("yearly")
                      }
                      className="mt-6 w-full rounded-xl bg-emerald-500 px-5 py-3 font-semibold text-slate-950 transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {checkoutPlan ===
                      "yearly"
                        ? "Opening Paystack..."
                        : "Choose Yearly"}
                    </button>

                  </div>

                </div>

                <p className="mt-4 text-center text-xs text-slate-500">
                  Secure checkout powered by Paystack.
                </p>

              </div>
            )}

          </>

        )}

      </section>

      {/* ------------------------------------------------------------------ */}
      {/* PREMIUM GATE TEST                                                  */}
      {/* ------------------------------------------------------------------ */}

      <PremiumGate>

        <section className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-6 shadow-sm">

          <div className="flex items-center gap-4">

            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-500/20">

              <Shield
                size={24}
                className="text-emerald-400"
              />

            </div>

            <div>

              <h2 className="text-lg font-semibold text-emerald-400">
                Premium Feature Unlocked
              </h2>

              <p className="mt-1 text-sm text-emerald-300/80">
                You have access to this Premium feature.
              </p>

            </div>

          </div>

        </section>

      </PremiumGate>

      {/* ------------------------------------------------------------------ */}
      {/* DASHBOARD STATISTICS                                               */}
      {/* ------------------------------------------------------------------ */}

      <section className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">

        <InsightCard
          icon={<Flame size={22} />}
          title="Recovery Streak"
          value={`${streak} Days`}
          subtitle="Keep building your momentum"
          trend="+2 this week"
          progress={(streak / 30) * 100}
          progressColor="bg-orange-500"
        />

        <InsightCard
          icon={<Clock3 size={22} />}
          title="Focus Time"
          value={focusTime}
          subtitle="Today's productive time"
          trend="+18%"
          progress={80}
        />

        <InsightCard
          icon={<Target size={22} />}
          title="Urges Resisted"
          value={String(urgesResisted)}
          subtitle="Strong decisions this week"
          trend="+5"
          progress={65}
          progressColor="bg-emerald-500"
        />

        <InsightCard
          icon={<Shield size={22} />}
          title="Blocked Sites"
          value={String(blockedSites)}
          subtitle="Protected this month"
          trend="100%"
          progress={100}
          progressColor="bg-cyan-500"
        />

      </section>

      {/* ------------------------------------------------------------------ */}
      {/* CHARTS & QUICK ACTIONS                                             */}
      {/* ------------------------------------------------------------------ */}

      <section className="grid gap-6 lg:grid-cols-3">

        <div className="lg:col-span-2">
          <WeeklyChart />
        </div>

        <QuickActions />

      </section>

      {/* ------------------------------------------------------------------ */}
      {/* BOTTOM SECTION                                                     */}
      {/* ------------------------------------------------------------------ */}

      <section className="grid gap-6 lg:grid-cols-2">

        <RecoveryScore />

        <RecentActivity />

      </section>

    </div>
  );
}