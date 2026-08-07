import { useEffect, useState } from "react";

import {
  getProfile,
  createProfile,
  updateProfile,
} from "../services/profileService";

import { useProfileStore } from "../store/profileStore";

import {
  ProfileHeader,
  GoalsCard,
  ProgressCard,
  RiskCard,
  DailyHabitsCard,
  SupportCard,
  NotesCard,
  SaveProfileButton,
} from "../components/profile";

export default function RecoveryProfile() {
  const { profile, setProfile } = useProfileStore();

  /*
  |--------------------------------------------------------------------------
  | Form State
  |--------------------------------------------------------------------------
  */

  const [goal, setGoal] = useState("");
  const [motivation, setMotivation] = useState("");

  const [challenges, setChallenges] = useState("");
  const [preferences, setPreferences] = useState("");

  const [currentStreak, setCurrentStreak] = useState(0);

  const [biggestTriggers, setBiggestTriggers] =
    useState("");

  const [emergencyPlan, setEmergencyPlan] =
    useState("");

  const [dailyHabits, setDailyHabits] =
    useState("");

  const [supportPerson, setSupportPerson] =
    useState("");

  const [reminderTime, setReminderTime] =
    useState("");

  const [notes, setNotes] = useState("");

  /*
  |--------------------------------------------------------------------------
  | Loading / Saving State
  |--------------------------------------------------------------------------
  */

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  /*
  |--------------------------------------------------------------------------
  | Load Existing Recovery Profile
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    loadRecoveryProfile();
  }, []);

  async function loadRecoveryProfile() {
    try {
      const data = await getProfile();

      /*
      |--------------------------------------------------------------------------
      | No profile exists yet
      |--------------------------------------------------------------------------
      */

      if (!data) {
        return;
      }

      /*
      |--------------------------------------------------------------------------
      | Store Profile
      |--------------------------------------------------------------------------
      */

      setProfile(data);

      /*
      |--------------------------------------------------------------------------
      | Populate Form
      |--------------------------------------------------------------------------
      */

      setGoal(data.goal ?? "");

      setMotivation(data.motivation ?? "");

      setChallenges(data.challenges ?? "");

      setPreferences(data.preferences ?? "");

      setCurrentStreak(
        data.current_streak ?? 0
      );

      setBiggestTriggers(
        data.biggest_triggers ?? ""
      );

      setEmergencyPlan(
        data.emergency_plan ?? ""
      );

      setDailyHabits(
        data.daily_habits ?? ""
      );

      setSupportPerson(
        data.support_person ?? ""
      );

      /*
      |--------------------------------------------------------------------------
      | IMPORTANT
      |--------------------------------------------------------------------------
      |
      | Database may return NULL for reminder_time.
      | The input still needs a string, so convert NULL
      | to an empty string for the UI.
      |
      */

      setReminderTime(
        data.reminder_time ?? ""
      );

      setNotes(data.notes ?? "");
    } catch (error) {
      console.error(
        "Failed to load recovery profile:",
        error
      );
    } finally {
      setLoading(false);
    }
  }

  /*
  |--------------------------------------------------------------------------
  | Save Recovery Profile
  |--------------------------------------------------------------------------
  */

  async function saveRecoveryProfile() {
    try {
      setSaving(true);

      /*
      |--------------------------------------------------------------------------
      | IMPORTANT REMINDER_TIME FIX
      |--------------------------------------------------------------------------
      |
      | PostgreSQL TIME columns cannot accept "".
      |
      | If the user leaves the reminder time empty,
      | send NULL instead.
      |
      */

      const payload = {
        goal,
        motivation,
        challenges,
        preferences,

        current_streak: currentStreak,

        biggest_triggers: biggestTriggers,

        emergency_plan: emergencyPlan,

        daily_habits: dailyHabits,

        support_person: supportPerson,

        reminder_time:
          reminderTime.trim() === ""
            ? null
            : reminderTime,

        notes,
      };

      /*
      |--------------------------------------------------------------------------
      | Create or Update
      |--------------------------------------------------------------------------
      */

      const updated = profile
        ? await updateProfile(payload)
        : await createProfile(payload);

      /*
      |--------------------------------------------------------------------------
      | Update Store
      |--------------------------------------------------------------------------
      */

      setProfile(updated);

      /*
      |--------------------------------------------------------------------------
      | Success
      |--------------------------------------------------------------------------
      */

      alert("Recovery profile saved successfully.");
    } catch (error: any) {
      console.error(
        "Failed to save recovery profile:",
        error
      );

      alert(
        error?.message ??
          "Failed to save recovery profile."
      );
    } finally {
      setSaving(false);
    }
  }

  /*
  |--------------------------------------------------------------------------
  | Loading Screen
  |--------------------------------------------------------------------------
  */

  if (loading) {
    return (
      <div className="text-white">
        Loading recovery profile...
      </div>
    );
  }

  /*
  |--------------------------------------------------------------------------
  | Page
  |--------------------------------------------------------------------------
  */

  return (
    <div className="mx-auto max-w-5xl space-y-8">

      {/* Header */}

      <ProfileHeader />

      {/* Goals */}

      <GoalsCard
        goal={goal}
        motivation={motivation}
        setGoal={setGoal}
        setMotivation={setMotivation}
      />

      {/* Progress */}

      <ProgressCard
        currentStreak={currentStreak}
        setCurrentStreak={setCurrentStreak}
      />

      {/* Risk Management */}

      <RiskCard
        biggestTriggers={biggestTriggers}
        emergencyPlan={emergencyPlan}
        setBiggestTriggers={
          setBiggestTriggers
        }
        setEmergencyPlan={
          setEmergencyPlan
        }
      />

      {/* Daily Habits */}

      <DailyHabitsCard
        dailyHabits={dailyHabits}
        preferences={preferences}
        reminderTime={reminderTime}
        setDailyHabits={setDailyHabits}
        setPreferences={setPreferences}
        setReminderTime={setReminderTime}
      />

      {/* Support */}

      <SupportCard
        supportPerson={supportPerson}
        challenges={challenges}
        setSupportPerson={
          setSupportPerson
        }
        setChallenges={setChallenges}
      />

      {/* Notes */}

      <NotesCard
        notes={notes}
        setNotes={setNotes}
      />

      {/* Save */}

      <SaveProfileButton
        saving={saving}
        onSave={saveRecoveryProfile}
      />

    </div>
  );
}