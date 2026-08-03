interface Props {
  websites: string[];
  onDelete: (website: string) => void;
}

export default function WebsiteList({
  websites,
  onDelete,
}: Props) {
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">

      <h2 className="mb-6 text-xl font-semibold text-white">
        Blocked Websites
      </h2>

      {websites.length === 0 ? (
        <p className="text-slate-400">
          No websites have been blocked yet.
        </p>
      ) : (
        <div className="space-y-3">
          {websites.map((website) => (
            <div
              key={website}
              className="flex items-center justify-between rounded-xl bg-slate-800 px-4 py-3"
            >
              <span className="text-white">
                {website}
              </span>

              <button
                onClick={() => onDelete(website)}
                className="rounded-lg bg-red-600 px-4 py-2 text-sm text-white hover:bg-red-700"
              >
                Remove
              </button>
            </div>
          ))}
        </div>
      )}

    </div>
  );
}