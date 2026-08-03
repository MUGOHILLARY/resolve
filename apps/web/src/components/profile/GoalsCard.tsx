interface Props {
  goal: string;
  motivation: string;

  setGoal: (value: string) => void;

  setMotivation: (value: string) => void;
}

export default function GoalsCard({
  goal,
  motivation,
  setGoal,
  setMotivation,
}: Props) {
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">

      <h2 className="mb-6 text-xl font-semibold text-white">
        🎯 Recovery Goals
      </h2>

      <div className="space-y-6">

        <div>

          <label className="mb-2 block text-sm text-slate-300">
            Recovery Goal
          </label>

          <textarea
            rows={4}
            value={goal}
            onChange={(e) =>
              setGoal(e.target.value)
            }
            className="w-full rounded-xl border border-slate-700 bg-slate-800 p-4 text-white outline-none transition focus:border-teal-500"
          />

        </div>

        <div>

          <label className="mb-2 block text-sm text-slate-300">
            Why is recovery important to you?
          </label>

          <textarea
            rows={4}
            value={motivation}
            onChange={(e) =>
              setMotivation(e.target.value)
            }
            className="w-full rounded-xl border border-slate-700 bg-slate-800 p-4 text-white outline-none transition focus:border-teal-500"
          />

        </div>

      </div>

    </div>
  );
}