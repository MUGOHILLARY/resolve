export interface ChatMessageType {
  id: string;
  role: "assistant" | "user";
  message: string;
  createdAt: number;
}