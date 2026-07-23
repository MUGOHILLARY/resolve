import { useEffect, useRef, useState } from "react";
import { Bot, Send, Trash2 } from "lucide-react";

import ChatMessage from "./ChatMessage";
import TypingIndicator from "./TypingIndicator";

import { useChatStore } from "../../store/chatStore";
import { useJournalStore } from "../../store/journalStore";

export default function ChatLayout() {
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const messages = useChatStore((state) => state.messages);
  const addMessage = useChatStore((state) => state.addMessage);
  const clearMessages = useChatStore((state) => state.clearMessages);

  const journalEntries = useJournalStore((state) => state.entries);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, [messages, isTyping]);

  function handleSend() {
    if (!input.trim()) return;

    const userInput = input.trim();

    addMessage("user", userInput);

    setInput("");

    setIsTyping(true);

    setTimeout(() => {
      setIsTyping(false);

      addMessage(
        "assistant",
        getAIResponse(userInput, journalEntries)
      );
    }, 1000);
  }

  return (
    <div className="overflow-hidden rounded-3xl border border-slate-800 bg-slate-900 shadow-xl">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800 p-6">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-teal-500/10 text-teal-400">
            <Bot size={26} />
          </div>

          <div>
            <h2 className="text-xl font-semibold text-white">
              Resolve AI Coach
            </h2>

            <p className="text-sm text-slate-400">
              Your personal recovery companion
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={clearMessages}
          className="flex items-center gap-2 rounded-xl border border-slate-700 px-4 py-2 text-slate-300 transition hover:border-red-500 hover:text-red-400"
        >
          <Trash2 size={18} />
          Clear Chat
        </button>
      </div>

      {/* Messages */}
      <div className="flex h-[420px] flex-col gap-5 overflow-y-auto bg-slate-950 p-6">
        {messages.map((message) => (
          <ChatMessage
            key={message.id}
            role={message.role}
            message={message.message}
          />
        ))}

        {isTyping && <TypingIndicator />}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Prompts */}
      <div className="border-t border-slate-800 bg-slate-900 p-4">
        <p className="mb-3 text-sm font-medium text-slate-400">
          Suggested prompts
        </p>

        <div className="flex flex-wrap gap-3">
          {[
            "💪 Motivate me",
            "😊 Check my progress",
            "🧠 Help with urges",
            "🌙 Evening reflection",
          ].map((prompt) => (
            <button
              key={prompt}
              type="button"
              onClick={() => setInput(prompt)}
              className="rounded-full border border-slate-700 px-4 py-2 text-sm text-slate-300 transition hover:border-teal-500 hover:text-white"
            >
              {prompt}
            </button>
          ))}
        </div>
      </div>

      {/* Input */}
      <div className="border-t border-slate-800 bg-slate-900 p-4">
        <div className="flex gap-3">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                handleSend();
              }
            }}
            placeholder="Type your message..."
            className="flex-1 rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none transition focus:border-teal-500"
          />

          <button
            type="button"
            onClick={handleSend}
            className="flex items-center gap-2 rounded-xl bg-teal-500 px-5 py-3 font-semibold text-slate-950 transition hover:bg-teal-400"
          >
            <Send size={18} />
            Send
          </button>
        </div>
      </div>
    </div>
  );
}

function getAIResponse(message: string, entries: any[]) {
  const text = message.toLowerCase();

  const totalEntries = entries.length;
  const latestMood =
    totalEntries > 0 ? entries[0].mood : null;

  if (text.includes("progress")) {
    if (totalEntries === 0) {
      return "I don't see any journal entries yet. Try writing your first journal entry so I can help track your recovery over time.";
    }

    return `You've written ${totalEntries} journal ${
      totalEntries === 1 ? "entry" : "entries"
    }. Your latest recorded mood is "${latestMood}". That's useful information for understanding your recovery journey.`;
  }

  if (text.includes("motivate")) {
    return `You've already taken an important step by using Resolve. ${
      totalEntries > 0
        ? `You've also written ${totalEntries} journal entries, showing consistency and commitment.`
        : "Your first journal entry could be a great place to begin."
    } Keep moving forward one day at a time.`;
  }

  if (text.includes("journal")) {
    return totalEntries > 0
      ? `You've written ${totalEntries} journal entries so far. Reflecting consistently is one of the best ways to recognize patterns and celebrate progress.`
      : "You haven't written a journal entry yet. Journaling can help you recognize emotions, triggers, and personal growth over time.";
  }

  return `Thank you for sharing. I can see you've recorded ${totalEntries} journal ${
    totalEntries === 1 ? "entry" : "entries"
  }. I'm here to help you reflect, stay motivated, and build healthy habits one day at a time.`;
}