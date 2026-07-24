import { getSession } from "./authService";

const API_BASE =
  import.meta.env.VITE_API_URL ||
  "http://localhost:4000";

export interface RecoveryProfile {
  id?: string;
  user_id?: string;
  goal: string;
  challenges: string;
  preferences: string;
  created_at?: string;
  updated_at?: string;
}

interface ProfileResponse {
  success: boolean;
  profile: RecoveryProfile | null;
  message?: string;
}

async function getHeaders() {
  const session = await getSession();

  if (!session) {
    throw new Error("You must be logged in.");
  }

  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${session.access_token}`,
  };
}

/*
|--------------------------------------------------------------------------
| Get Profile
|--------------------------------------------------------------------------
*/

export async function getProfile() {
  const headers = await getHeaders();

  const response = await fetch(
    `${API_BASE}/api/profile`,
    {
      headers,
    }
  );

  const data: ProfileResponse =
    await response.json();

  if (!response.ok || !data.success) {
    throw new Error(
      data.message ||
        "Failed to load profile."
    );
  }

  return data.profile;
}

/*
|--------------------------------------------------------------------------
| Create Profile
|--------------------------------------------------------------------------
*/

export async function createProfile(
  profile: RecoveryProfile
) {
  const headers = await getHeaders();

  const response = await fetch(
    `${API_BASE}/api/profile`,
    {
      method: "POST",
      headers,
      body: JSON.stringify(profile),
    }
  );

  const data: ProfileResponse =
    await response.json();

  if (!response.ok || !data.success) {
    throw new Error(
      data.message ||
        "Failed to create profile."
    );
  }

  return data.profile;
}

/*
|--------------------------------------------------------------------------
| Update Profile
|--------------------------------------------------------------------------
*/

export async function updateProfile(
  profile: RecoveryProfile
) {
  const headers = await getHeaders();

  const response = await fetch(
    `${API_BASE}/api/profile`,
    {
      method: "PUT",
      headers,
      body: JSON.stringify(profile),
    }
  );

  const data: ProfileResponse =
    await response.json();

  if (!response.ok || !data.success) {
    throw new Error(
      data.message ||
        "Failed to update profile."
    );
  }

  return data.profile;
}