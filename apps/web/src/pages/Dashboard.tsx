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

      {/* Dashboard Statistics */}

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

      {/* Charts & Quick Actions */}

      <section className="grid gap-6 lg:grid-cols-3">

        <div className="lg:col-span-2">
          <WeeklyChart />
        </div>

        <QuickActions />

      </section>

      {/* Bottom Section */}

      <section className="grid gap-6 lg:grid-cols-2">

        <RecoveryScore />

        <RecentActivity />

      </section>

    </div>
  );
}