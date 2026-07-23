import { Bot, User } from "lucide-react";

type ChatMessageProps = {
  role: "assistant" | "user";
  message: string;
};

export default function ChatMessage({
  role,
  message,
}: ChatMessageProps) {
  const isAssistant = role === "assistant";

  return (
    <div
      className={`flex ${
        isAssistant ? "justify-start" : "justify-end"
      }`}
    >
      <div
        className={`flex max-w-[80%] gap-3 ${
          isAssistant ? "" : "flex-row-reverse"
        }`}
      >
        <div
          className={`flex h-10 w-10 items-center justify-center rounded-full ${
            isAssistant
              ? "bg-teal-500/10 text-teal-400"
              : "bg-blue-500/10 text-blue-400"
          }`}
        >
          {isAssistant ? <Bot size={20} /> : <User size={20} />}
        </div>

        <div
          className={`rounded-2xl px-4 py-3 ${
            isAssistant
              ? "bg-slate-800 text-white"
              : "bg-teal-500 text-slate-950"
          }`}
        >
          {message}
        </div>
      </div>
    </div>
  );
}