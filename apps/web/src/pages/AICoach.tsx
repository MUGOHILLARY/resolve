import RecoveryKPIs from "../components/ai/RecoveryKPIs";
import RecoveryStreak from "../components/ai/RecoveryStreak";
import RecoverySummary from "../components/ai/RecoverySummary";
import MoodAnalytics from "../components/ai/MoodAnalytics";
import MoodTrendChart from "../components/ai/MoodTrendChart";
import ChatLayout from "../components/ai/ChatLayout";

export default function AICoach() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white">
          AI Coach
        </h1>

        <p className="mt-2 text-slate-400">
          Talk with your personal AI recovery companion for guidance,
          encouragement, and personalized insights.
        </p>
      </div>

      {/* Recovery KPI Dashboard */}
      <RecoveryKPIs />

      {/* Recovery Streak */}
      <RecoveryStreak />

      {/* Recovery Summary */}
      <RecoverySummary />

      {/* Analytics */}
      <div className="grid gap-8 xl:grid-cols-2">
        <MoodAnalytics />
        <MoodTrendChart />
      </div>

      {/* AI Chat */}
      <ChatLayout />
    </div>
  );
}