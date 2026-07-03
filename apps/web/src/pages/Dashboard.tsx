import WelcomeBanner from "../components/dashboard/WelcomeBanner";
import StatCard from "../components/dashboard/StatCard";
import WeeklyChart from "../components/dashboard/WeeklyChart";
import QuickActions from "../components/dashboard/QuickActions";
import RecoveryScore from "../components/dashboard/RecoveryScore";
import RecentActivity from "../components/dashboard/RecentActivity";

import { useDashboardStore } from "../store/dashboardStore";
import { useStreakStore } from "../store/streakStore";

export default function Dashboard() {
  const streak = useStreakStore((state) => state.streak);

  const {
    focusTime,
    urgesResisted,
    blockedSites,
  } = useDashboardStore();

  return (
    <div className="space-y-8">
      <WelcomeBanner />

      <section className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="Recovery Streak"
          value={`${streak} Days`}
          subtitle="Current streak"
        />

        <StatCard
          title="Focus Time"
          value={focusTime}
          subtitle="Today's total"
        />

        <StatCard
          title="Urges Resisted"
          value={String(urgesResisted)}
          subtitle="This week"
        />

        <StatCard
          title="Blocked Sites"
          value={String(blockedSites)}
          subtitle="This month"
        />
      </section>

      <section className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <WeeklyChart />
        </div>

        <QuickActions />
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <RecoveryScore />

        <RecentActivity />
      </section>
    </div>
  );
}