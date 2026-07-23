import { useMemo } from "react";

import {
  ResponsiveContainer,
  LineChart,
  Line,
  CartesianGrid,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { useJournalStore } from "../../store/journalStore";

const moodValue = {
  terrible: 1,
  bad: 2,
  okay: 3,
  good: 4,
  great: 5,
} as const;

export default function MoodTrendChart() {
  const entries = useJournalStore((state) => state.entries);

  const data = useMemo(() => {
    return [...entries]
      .sort((a, b) => a.createdAt - b.createdAt)
      .slice(-7)
      .map((entry) => ({
        day: new Date(entry.createdAt).toLocaleDateString(undefined, {
          month: "short",
          day: "numeric",
        }),
        mood: moodValue[entry.mood],
      }));
  }, [entries]);

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
      <h2 className="mb-6 text-xl font-semibold text-white">
        Mood Trend (Last 7 Entries)
      </h2>

      {data.length === 0 ? (
        <div className="py-10 text-center text-slate-400">
          No journal entries yet.
        </div>
      ) : (
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data}>
              <CartesianGrid stroke="#334155" />

              <XAxis
                dataKey="day"
                stroke="#94a3b8"
              />

              <YAxis
                stroke="#94a3b8"
                domain={[1, 5]}
                ticks={[1, 2, 3, 4, 5]}
              />

              <Tooltip />

              <Line
                type="monotone"
                dataKey="mood"
                stroke="#14b8a6"
                strokeWidth={3}
                dot={{ r: 5 }}
                activeDot={{ r: 7 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}