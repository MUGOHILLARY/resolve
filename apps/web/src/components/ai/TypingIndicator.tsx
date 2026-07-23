export default function TypingIndicator() {
  return (
    <div className="flex justify-start">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-teal-500/10">
          🤖
        </div>

        <div className="flex items-center gap-1 rounded-2xl bg-slate-800 px-4 py-3">
          <span className="h-2 w-2 animate-bounce rounded-full bg-slate-400 [animation-delay:-0.3s]" />
          <span className="h-2 w-2 animate-bounce rounded-full bg-slate-400 [animation-delay:-0.15s]" />
          <span className="h-2 w-2 animate-bounce rounded-full bg-slate-400" />
        </div>
      </div>
    </div>
  );
}