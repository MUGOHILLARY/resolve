interface Props {
  streak: number;
  journals: number;
  chats: number;
  averageMood: number;
}

export default function StatsGrid({
  streak,
  journals,
  chats,
  averageMood,
}: Props) {
  const cards = [
    {
      title: "Recovery Streak",
      value: `${streak} Days`,
    },
    {
      title: "Journal Entries",
      value: journals,
    },
    {
      title: "AI Conversations",
      value: chats,
    },
    {
      title: "Average Mood",
      value: averageMood.toFixed(1),
    },
  ];

  return (
    <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
      {cards.map((card) => (
        <div
          key={card.title}
          className="rounded-2xl border border-slate-800 bg-slate-900 p-6"
        >
          <p className="text-sm text-slate-400">
            {card.title}
          </p>

          <h2 className="mt-4 text-3xl font-bold text-white">
            {card.value}
          </h2>
        </div>
      ))}
    </div>
  );
}