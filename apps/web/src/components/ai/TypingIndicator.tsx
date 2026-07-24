export default function TypingIndicator() {
  return (
    <div className="flex items-center gap-3">

      <div
        className="
          flex
          items-center
          justify-center
          w-8
          h-8
          rounded-full
          bg-blue-600
        "
      >
        <span className="text-white text-sm">
          AI
        </span>
      </div>


      <div
        className="
          flex
          items-center
          gap-1
          bg-slate-800
          px-4
          py-3
          rounded-xl
        "
      >

        <span
          className="
            w-2
            h-2
            bg-slate-400
            rounded-full
            animate-bounce
          "
        />

        <span
          className="
            w-2
            h-2
            bg-slate-400
            rounded-full
            animate-bounce
            [animation-delay:150ms]
          "
        />

        <span
          className="
            w-2
            h-2
            bg-slate-400
            rounded-full
            animate-bounce
            [animation-delay:300ms]
          "
        />

      </div>

    </div>
  );
}