interface Props {
  biggestTriggers: string;
  emergencyPlan: string;

  setBiggestTriggers: (value: string) => void;
  setEmergencyPlan: (value: string) => void;
}

export default function RiskCard({
  biggestTriggers,
  emergencyPlan,
  setBiggestTriggers,
  setEmergencyPlan,
}: Props) {
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
      <h2 className="mb-6 text-xl font-semibold text-white">
        ⚠️ Risk Management
      </h2>

      <div className="space-y-6">
        <div>
          <label className="mb-2 block text-sm text-slate-300">
            Biggest Triggers
          </label>

          <textarea
            rows={4}
            value={biggestTriggers}
            onChange={(e) =>
              setBiggestTriggers(e.target.value)
            }
            className="w-full rounded-xl border border-slate-700 bg-slate-800 p-4 text-white outline-none transition focus:border-teal-500"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm text-slate-300">
            Emergency Recovery Plan
          </label>

          <textarea
            rows={4}
            value={emergencyPlan}
            onChange={(e) =>
              setEmergencyPlan(e.target.value)
            }
            className="w-full rounded-xl border border-slate-700 bg-slate-800 p-4 text-white outline-none transition focus:border-teal-500"
          />
        </div>
      </div>
    </div>
  );
}