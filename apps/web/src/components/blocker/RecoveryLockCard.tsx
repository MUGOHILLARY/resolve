interface Props {
  enabled: boolean;
  level: string;
  expires?: string | null;
  reason?: string | null;

  onActivate: (
    level: string,
    years: number
  ) => void;
}

const options = [
  {
    label: "30 Days",
    years: 30 / 365,
    level: "30_day",
  },
  {
    label: "90 Days",
    years: 90 / 365,
    level: "90_day",
  },
  {
    label: "1 Year",
    years: 1,
    level: "1_year",
  },
  {
    label: "3 Years",
    years: 3,
    level: "3_year",
  },
  {
    label: "5 Years",
    years: 5,
    level: "5_year",
  },
];

export default function RecoveryLockCard({
  enabled,
  level,
  expires,
  reason,
  onActivate,
}: Props) {
  return (
    <div className="rounded-2xl border border-red-900 bg-slate-900 p-6">

      <div className="flex items-center justify-between">

        <div>

          <h2 className="text-2xl font-bold text-white">
            🛡 Recovery Lock
          </h2>

          <p className="mt-2 text-slate-400">
            Prevent impulsive access to high-risk websites.
          </p>

        </div>

        <div
          className={`rounded-full px-4 py-2 text-sm font-semibold ${
            enabled
              ? "bg-green-600 text-white"
              : "bg-slate-700 text-slate-300"
          }`}
        >
          {enabled ? "ACTIVE" : "INACTIVE"}
        </div>

      </div>

      {enabled && (
        <div className="mt-6 rounded-xl bg-slate-800 p-4">

          <p className="text-slate-400">
            Lock Level
          </p>

          <h3 className="text-xl font-bold text-white">
            {level}
          </h3>

          <div className="mt-4">

            <p className="text-slate-400">
              Expires
            </p>

            <p className="text-white">
              {expires ?? "Unknown"}
            </p>

          </div>

          {reason && (

            <div className="mt-4">

              <p className="text-slate-400">
                Reason
              </p>

              <p className="text-white">
                {reason}
              </p>

            </div>

          )}

        </div>
      )}

      <div className="mt-8">

        <h3 className="mb-4 text-lg font-semibold text-white">
          Activate Recovery Lock
        </h3>

        <div className="grid gap-3 md:grid-cols-3">

          {options.map((option) => (

            <button
              key={option.level}
              onClick={() =>
                onActivate(
                  option.level,
                  option.years
                )
              }
              className="rounded-xl bg-red-600 py-3 text-white transition hover:bg-red-700"
            >
              {option.label}
            </button>

          ))}

        </div>

      </div>

    </div>
  );
}