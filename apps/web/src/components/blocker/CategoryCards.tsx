interface Props {
  settings: {
    gambling: boolean;
    adult_content: boolean;
    social_media: boolean;
    gaming: boolean;
    focus_mode: boolean;
  };

  onToggle: (
    key:
      | "gambling"
      | "adult_content"
      | "social_media"
      | "gaming"
      | "focus_mode"
  ) => void;
}

export default function CategoryCards({
  settings,
  onToggle,
}: Props) {
  const categories = [
    {
      title: "Gambling",
      description: "Block betting and gambling websites.",
      key: "gambling" as const,
      enabled: settings.gambling,
    },
    {
      title: "Adult Content",
      description: "Block adult websites.",
      key: "adult_content" as const,
      enabled: settings.adult_content,
    },
    {
      title: "Social Media",
      description: "Block Facebook, Instagram, TikTok, X and more.",
      key: "social_media" as const,
      enabled: settings.social_media,
    },
    {
      title: "Gaming",
      description: "Block gaming websites.",
      key: "gaming" as const,
      enabled: settings.gaming,
    },
    {
      title: "Focus Mode",
      description: "Temporarily block all distractions.",
      key: "focus_mode" as const,
      enabled: settings.focus_mode,
    },
  ];

  return (
    <div className="grid gap-6 md:grid-cols-2">
      {categories.map((category) => (
        <div
          key={category.title}
          className="rounded-2xl border border-slate-800 bg-slate-900 p-6"
        >
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-xl font-semibold text-white">
                {category.title}
              </h2>

              <p className="mt-2 text-slate-400">
                {category.description}
              </p>
            </div>

            <span
              className={`rounded-full px-3 py-1 text-xs font-semibold ${
                category.enabled
                  ? "bg-green-600 text-white"
                  : "bg-slate-700 text-slate-300"
              }`}
            >
              {category.enabled ? "ON" : "OFF"}
            </span>
          </div>

          <button
            onClick={() => onToggle(category.key)}
            className={`mt-6 w-full rounded-lg px-5 py-3 font-medium transition ${
              category.enabled
                ? "bg-red-600 hover:bg-red-700 text-white"
                : "bg-teal-600 hover:bg-teal-700 text-white"
            }`}
          >
            {category.enabled ? "Disable" : "Enable"}
          </button>
        </div>
      ))}
    </div>
  );
}