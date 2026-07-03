import WelcomeBanner from "../components/dashboard/WelcomeBanner";
import StatCard from "../components/dashboard/StatCard";

export default function Dashboard() {
  return (
    <div className="space-y-8">
      <WelcomeBanner />

      <section className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="Recovery Streak"
          value="7 Days"
          subtitle="+2 from last week"
        />

        <StatCard
          title="Focus Time"
          value="4h 12m"
          subtitle="Today's total"
        />

        <StatCard
          title="Urges Resisted"
          value="12"
          subtitle="This week"
        />

        <StatCard
          title="Sites Blocked"
          value="145"
          subtitle="This month"
        />
      </section>
    </div>
  );
}