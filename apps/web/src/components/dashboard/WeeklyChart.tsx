import {
  LineChart,
  Line,
  ResponsiveContainer,
  XAxis,
  Tooltip,
} from "recharts";

const data = [
  { day: "Mon", score: 25 },
  { day: "Tue", score: 40 },
  { day: "Wed", score: 38 },
  { day: "Thu", score: 55 },
  { day: "Fri", score: 68 },
  { day: "Sat", score: 82 },
  { day: "Sun", score: 91 },
];

export default function WeeklyChart() {
  return (
    <div className="rounded-3xl border border-slate-800 bg-slate-900 p-6">
      <h2 className="mb-6 text-xl font-semibold text-white">
        Weekly Recovery Progress
      </h2>

      <div className="h-72">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <XAxis
              dataKey="day"
              stroke="#94A3B8"
            />

            <Tooltip />

            <Line
              type="monotone"
              dataKey="score"
              stroke="#14B8A6"
              strokeWidth={4}
              dot={{ r: 5 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}