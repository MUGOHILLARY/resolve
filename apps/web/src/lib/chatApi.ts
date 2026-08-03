import { authService } from "../services/authService";

const API_BASE_URL =
  import.meta.env.VITE_API_URL ?? "http://localhost:4000";

export type ChatMessage = {
  id: string;
  role: "user" | "assistant";
  message: string;
  created_at: string;
};

async function authHeaders(): Promise<Record<string, string>> {
  const session = await authService.getSession();

  if (!session?.access_token) {
    throw new Error("Not authenticated.");
  }

  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${session.access_token}`,
  };
}

async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const headers = await authHeaders();

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      ...headers,
      ...(options.headers ?? {}),
    },
  });

  const data = await response.json();

  if (!response.ok || !data.success) {
    throw new Error(data.message ?? "Request failed.");
  }

  return data as T;
}

export async function sendChat(message: string): Promise<string> {
  const data = await apiRequest<{
    success: boolean;
    reply: string;
  }>("/api/chat", {
    method: "POST",
    body: JSON.stringify({ message }),
  });

  return data.reply;
}

export async function loadHistory(): Promise<ChatMessage[]> {
  const data = await apiRequest<{
    success: boolean;
    messages: ChatMessage[];
  }>("/api/chat/history");

  return data.messages;
}

export async function clearHistory(): Promise<void> {
  await apiRequest<{
    success: boolean;
  }>("/api/chat/history", {
    method: "DELETE",
  });
}