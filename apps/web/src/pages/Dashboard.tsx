import {
  Flame,
  Clock3,
  Target,
  Shield,
} from "lucide-react";

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
  } = useSubscription();

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

        <div className="mb-4 flex items-center justify-between">

          <div>
            <h2 className="text-lg font-semibold text-white">
              Resolve Membership
            </h2>

            <p className="mt-1 text-sm text-slate-400">
              Live subscription status from the Resolve API
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
                {isPremium ? "PREMIUM" : "FREE"}
              </span>
            )}

        </div>

        {subscriptionLoading ? (

          <div className="rounded-xl bg-slate-800 p-4">
            <p className="text-sm text-slate-400">
              Checking your subscription...
            </p>
          </div>

        ) : subscriptionError ? (

          <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-4">

            <p className="text-sm font-medium text-red-400">
              Failed to load subscription
            </p>

            <p className="mt-1 text-sm text-red-300/80">
              {subscriptionError}
            </p>

          </div>

        ) : (

          <div className="grid gap-4 sm:grid-cols-3">

            {/* Plan */}

            <div className="rounded-xl bg-slate-800 p-4">

              <p className="text-xs uppercase tracking-wide text-slate-500">
                Plan
              </p>

              <p className="mt-2 text-xl font-semibold capitalize text-white">
                {subscription?.plan ?? "Unknown"}
              </p>

            </div>

            {/* Status */}

            <div className="rounded-xl bg-slate-800 p-4">

              <p className="text-xs uppercase tracking-wide text-slate-500">
                Status
              </p>

              <p className="mt-2 text-xl font-semibold capitalize text-white">
                {subscription?.status ?? "Unknown"}
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