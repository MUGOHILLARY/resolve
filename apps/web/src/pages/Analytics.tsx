import { useEffect, useState } from "react";

import {
  AnalyticsHeader,
  RecoveryScoreCard,
  StatsGrid,
  MoodChart,
  AIInsightsCard,
} from "../components/analytics";

import { loadJournals } from "../services/journalService";
import { loadHistory } from "../lib/api";
import { getProfile } from "../services/profileService";

export default function Analytics() {
  const [loading, setLoading] = useState(true);

  const [score, setScore] = useState(0);

  const [streak, setStreak] = useState(0);

  const [journalCount, setJournalCount] =
    useState(0);

  const [chatCount, setChatCount] =
    useState(0);

  const [averageMood, setAverageMood] =
    useState(0);

  const [chartData, setChartData] = useState<
    {
      day: string;
      mood: number;
    }[]
  >([]);

  const [insights, setInsights] = useState<
    string[]
  >([]);

  useEffect(() => {
    loadAnalytics();
  }, []);

  async function loadAnalytics() {
    try {
      const journals =
        await loadJournals();

      const chats =
        await loadHistory();

      const profile =
        await getProfile();

      setJournalCount(
        journals.length
      );

      setChatCount(
        chats.length
      );

      setStreak(
        profile?.current_streak ?? 0
      );

      /*
      |--------------------------------------------------------------------------
      | Mood Mapping
      |--------------------------------------------------------------------------
      */

      const moodValues: Record<
        string,
        number
      > = {
        excellent: 5,
        happy: 5,
        good: 4,
        calm: 4,
        okay: 3,
        neutral: 3,
        anxious: 2,
        sad: 2,
        angry: 1,
      };

      const moods = journals.map(
        (journal) =>
          moodValues[
            journal.mood.toLowerCase()
          ] ?? 3
      );

      const average =
        moods.length > 0
          ? moods.reduce(
              (a, b) => a + b,
              0
            ) / moods.length
          : 0;

      setAverageMood(
        average
      );

      setChartData(
        journals
          .slice()
          .reverse()
          .map((journal) => ({
            day: new Date(
              journal.created_at
            ).toLocaleDateString(
              "en-US",
              {
                month: "short",
                day: "numeric",
              }
            ),
            mood:
              moodValues[
                journal.mood.toLowerCase()
              ] ?? 3,
          }))
      );

      /*
      |--------------------------------------------------------------------------
      | Recovery Score
      |--------------------------------------------------------------------------
      */

      let recoveryScore = 50;

      recoveryScore += Math.min(
        streak,
        30
      );

      recoveryScore += Math.min(
        journalCount,
        20
      );

      recoveryScore += Math.min(
        Math.floor(chatCount / 5),
        10
      );

      recoveryScore = Math.min(
        recoveryScore,
        100
      );

      setScore(
        recoveryScore
      );

      /*
      |--------------------------------------------------------------------------
      | AI Insights
      |--------------------------------------------------------------------------
      */

      const aiInsights: string[] =
        [];

      if (streak >= 7)
        aiInsights.push(
          "You're maintaining a healthy recovery streak."
        );

      if (journalCount >= 10)
        aiInsights.push(
          "Consistent journaling is helping build self-awareness."
        );

      if (average >= 4)
        aiInsights.push(
          "Your overall mood trend has been positive."
        );

      if (chatCount >= 20)
        aiInsights.push(
          "You've been actively engaging with Resolve AI."
        );

      if (
        aiInsights.length === 0
      ) {
        aiInsights.push(
          "Keep journaling consistently to unlock deeper insights."
        );
      }

      setInsights(
        aiInsights
      );
    } catch (error) {
      console.error(
        error
      );
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="text-white">
        Loading analytics...
      </div>
    );
  }

  return (
    <div className="space-y-8">

      <AnalyticsHeader />

      <RecoveryScoreCard
        score={score}
      />

      <StatsGrid
        streak={streak}
        journals={
          journalCount
        }
        chats={chatCount}
        averageMood={
          averageMood
        }
      />

      <MoodChart
        data={chartData}
      />

      <AIInsightsCard
        insights={insights}
      />

    </div>
  );
}