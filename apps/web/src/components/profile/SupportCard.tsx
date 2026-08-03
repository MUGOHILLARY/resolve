interface Props {
  supportPerson: string;
  challenges: string;

  setSupportPerson: (value: string) => void;
  setChallenges: (value: string) => void;
}

export default function SupportCard({
  supportPerson,
  challenges,
  setSupportPerson,
  setChallenges,
}: Props) {
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">

      <h2 className="mb-6 text-xl font-semibold text-white">
        🤝 Support System
      </h2>

      <div className="space-y-6">

        <div>
          <label className="mb-2 block text-sm text-slate-300">
            Support Person
          </label>

          <input
            type="text"
            value={supportPerson}
            onChange={(e) =>
              setSupportPerson(e.target.value)
            }
            placeholder="Friend, family member, mentor..."
            className="w-full rounded-xl border border-slate-700 bg-slate-800 p-4 text-white outline-none transition focus:border-teal-500"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm text-slate-300">
            Current Challenges
          </label>

          <textarea
            rows={4}
            value={challenges}
            onChange={(e) =>
              setChallenges(e.target.value)
            }
            className="w-full rounded-xl border border-slate-700 bg-slate-800 p-4 text-white outline-none transition focus:border-teal-500"
          />
        </div>

      </div>

    </div>
  );
}