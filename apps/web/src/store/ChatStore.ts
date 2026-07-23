import { create } from "zustand";
import { persist } from "zustand/middleware";

import type { ChatMessageType } from "../types/chat";

type ChatStore = {
  messages: ChatMessageType[];

  addMessage: (
    role: "assistant" | "user",
    message: string
  ) => void;

  clearMessages: () => void;
};

function welcomeMessage(): ChatMessageType {
  return {
    id: crypto.randomUUID(),
    role: "assistant",
    message:
      "Hello! I'm Resolve AI. I'm here to support your recovery journey. How are you feeling today?",
    createdAt: Date.now(),
  };
}

export const useChatStore = create<ChatStore>()(
  persist(
    (set) => ({
      messages: [welcomeMessage()],

      addMessage: (role, message) =>
        set((state) => ({
          messages: [
            ...state.messages,
            {
              id: crypto.randomUUID(),
              role,
              message,
              createdAt: Date.now(),
            },
          ],
        })),

      clearMessages: () =>
        set({
          messages: [welcomeMessage()],
        }),
    }),
    {
      name: "resolve-ai-chat",
    }
  )
);