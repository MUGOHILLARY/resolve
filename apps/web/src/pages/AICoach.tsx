import RecoveryKPIs from "../components/ai/RecoveryKPIs";
import RecoveryStreak from "../components/ai/RecoveryStreak";
import RecoverySummary from "../components/ai/RecoverySummary";
import MoodAnalytics from "../components/ai/MoodAnalytics";
import MoodTrendChart from "../components/ai/MoodTrendChart";
import ChatLayout from "../components/ai/ChatLayout";

import PremiumGate from "../components/premium/PremiumGate";

export default function AICoach() {
  return (
    <PremiumGate>
      <div className="space-y-6">

        {/* Header */}
        <div className="flex items-center gap-5 rounded-2xl border border-slate-800 bg-slate-900/50 p-6">

          <img
            src="/resolve-logo.png"
            alt="Resolve"
            className="h-16 w-16 object-contain drop-shadow-xl"
          />

          <div>
            <h1 className="text-3xl font-bold text-white">
              Resolve AI Coach
            </h1>

            <p className="mt-2 max-w-3xl text-slate-400">
              Your personal recovery companion. Receive encouragement,
              personalized guidance, recovery insights, and practical
              strategies to help you stay focused and build lasting habits.
            </p>
          </div>

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
    </PremiumGate>
  );
}