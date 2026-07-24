import { useEffect, useState } from "react";

import {
  getProfile,
  createProfile,
  updateProfile,
} from "../services/profileService";

import { useProfileStore } from "../store/profileStore";

export default function RecoveryProfile() {
  const {
    profile,
    setProfile,
  } = useProfileStore();

  const [goal, setGoal] = useState("");
  const [challenges, setChallenges] = useState("");
  const [preferences, setPreferences] = useState("");

  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProfile();
  }, []);

  async function loadProfile() {
    try {
      const data = await getProfile();

      if (data) {
        setProfile(data);

        setGoal(data.goal);
        setChallenges(data.challenges);
        setPreferences(data.preferences);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  async function saveProfile() {
    try {
      setSaving(true);

      const payload = {
        goal,
        challenges,
        preferences,
      };

      let updated;

      if (profile) {
        updated = await updateProfile(payload);
      } else {
        updated = await createProfile(payload);
      }

      setProfile(updated);

      alert("Recovery profile saved successfully.");

    } catch (error: any) {
      alert(error.message);
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="text-white">
        Loading profile...
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl space-y-8">

      <div>
        <h1 className="text-3xl font-bold text-white">
          Recovery Profile
        </h1>

        <p className="mt-2 text-slate-400">
          Help Resolve understand your goals so it can
          provide personalized coaching.
        </p>
      </div>

      <div className="space-y-6 rounded-xl bg-slate-900 p-6">

        <div>
          <label className="mb-2 block text-white">
            Recovery Goal
          </label>

          <textarea
            value={goal}
            onChange={(e) =>
              setGoal(e.target.value)
            }
            className="w-full rounded-lg bg-slate-800 p-3 text-white"
            rows={3}
          />
        </div>

        <div>
          <label className="mb-2 block text-white">
            Current Challenges
          </label>

          <textarea
            value={challenges}
            onChange={(e) =>
              setChallenges(e.target.value)
            }
            className="w-full rounded-lg bg-slate-800 p-3 text-white"
            rows={4}
          />
        </div>

        <div>
          <label className="mb-2 block text-white">
            Preferred Coaching Style
          </label>

          <textarea
            value={preferences}
            onChange={(e) =>
              setPreferences(e.target.value)
            }
            className="w-full rounded-lg bg-slate-800 p-3 text-white"
            rows={3}
          />
        </div>

        <button
          onClick={saveProfile}
          disabled={saving}
          className="rounded-lg bg-blue-600 px-6 py-3 text-white hover:bg-blue-700 disabled:opacity-50"
        >
          {saving ? "Saving..." : "Save Profile"}
        </button>

      </div>
    </div>
  );
}