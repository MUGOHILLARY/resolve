import { authService } from "../services/authService";

const API_BASE_URL =
  import.meta.env.VITE_API_URL ?? "http://localhost:4000";

export type ChatMessage = {
  id: string;
  role: "user" | "assistant";
  message: string;
  created_at: string;
};

async function authHeaders() {
  const session = await authService.getSession();

  if (!session?.access_token) {
    throw new Error("Not authenticated.");
  }

  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${session.access_token}`,
  };
}

export async function sendChat(message: string) {
  const headers = await authHeaders();

  const response = await fetch(`${API_BASE_URL}/api/chat`, {
    method: "POST",
    headers,
    body: JSON.stringify({ message }),
  });

  const data = await response.json();

  if (!response.ok || !data.success) {
    throw new Error(data.message ?? "Failed to send message.");
  }

  return data.reply as string;
}

export async function loadHistory() {
  const headers = await authHeaders();

  const response = await fetch(
    `${API_BASE_URL}/api/chat/history`,
    {
      headers,
    }
  );

  const data = await response.json();

  if (!response.ok || !data.success) {
    throw new Error(data.message ?? "Failed to load history.");
  }

  return data.messages as ChatMessage[];
}

export async function clearHistory() {
  const headers = await authHeaders();

  const response = await fetch(
    `${API_BASE_URL}/api/chat/history`,
    {
      method: "DELETE",
      headers,
    }
  );

  const data = await response.json();

  if (!response.ok || !data.success) {
    throw new Error(data.message ?? "Failed to clear history.");
  }
}