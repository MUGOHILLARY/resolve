const API_BASE_URL = "http://localhost:4000";

export type CreateJournalRequest = {
  mood: string;
  title: string;
  content: string;
};

export async function createJournal(
  journal: CreateJournalRequest
) {
  const response = await fetch(`${API_BASE_URL}/api/journal`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(journal),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Failed to save journal.");
  }

  return data.journal;
}

export async function getJournals() {
  const response = await fetch(`${API_BASE_URL}/api/journal`);

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Failed to load journals.");
  }

  return data.journals;
}