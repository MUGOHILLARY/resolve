import {
  PolicyCard,
  PolicyToggle,
  PolicyPreset,
} from "@resolve/ui";

import { useState } from "react";

export default function RecoveryPolicy() {
  const [preset, setPreset] = useState("Recovery");

  const [policy, setPolicy] = useState({
    gambling: true,
    adult: true,
    social: true,
    gaming: false,
    shopping: false,
    streaming: false,
    aiCoach: true,
    journal: true,
    accountability: false,
    emergencyLock: false,
    focusMode: true,
  });

  function toggle(key: keyof typeof policy) {
    setPolicy((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  }

  return (
    <div className="mx-auto max-w-6xl space-y-8 p-8">
      <div>
        <h1 className="text-3xl font-bold text-white">
          Recovery Policy
        </h1>

        <p className="text-slate-400">
          Configure how Resolve protects and supports your recovery journey.
        </p>
      </div>

      {/* Presets */}

      <div className="grid gap-4 md:grid-cols-3">
        <PolicyPreset
          title="Beginner"
          description="Gentle protection for new users."
          selected={preset === "Beginner"}
          onSelect={() => setPreset("Beginner")}
        />

        <PolicyPreset
          title="Recovery"
          description="Maximum protection for addiction recovery."
          selected={preset === "Recovery"}
          onSelect={() => setPreset("Recovery")}
        />

        <PolicyPreset
          title="Focus"
          description="Reduce distractions while studying or working."
          selected={preset === "Focus"}
          onSelect={() => setPreset("Focus")}
        />
      </div>

      {/* Categories */}

      <div className="grid gap-6 lg:grid-cols-2">
        <PolicyCard
          title="Website Protection"
          description="Choose which categories Resolve should block."
        >
          <div className="space-y-3">
            <PolicyToggle
              label="Gambling"
              checked={policy.gambling}
              onChange={() => toggle("gambling")}
            />

            <PolicyToggle
              label="Adult Content"
              checked={policy.adult}
              onChange={() => toggle("adult")}
            />

            <PolicyToggle
              label="Social Media"
              checked={policy.social}
              onChange={() => toggle("social")}
            />

            <PolicyToggle
              label="Gaming"
              checked={policy.gaming}
              onChange={() => toggle("gaming")}
            />

            <PolicyToggle
              label="Shopping"
              checked={policy.shopping}
              onChange={() => toggle("shopping")}
            />

            <PolicyToggle
              label="Streaming"
              checked={policy.streaming}
              onChange={() => toggle("streaming")}
            />
          </div>
        </PolicyCard>

        <PolicyCard
          title="Recovery Tools"
          description="Configure recovery features available inside Resolve."
        >
          <div className="space-y-3">
            <PolicyToggle
              label="AI Coach"
              checked={policy.aiCoach}
              onChange={() => toggle("aiCoach")}
            />

            <PolicyToggle
              label="Journal"
              checked={policy.journal}
              onChange={() => toggle("journal")}
            />

            <PolicyToggle
              label="Accountability Partner"
              checked={policy.accountability}
              onChange={() => toggle("accountability")}
            />

            <PolicyToggle
              label="Emergency Lock"
              checked={policy.emergencyLock}
              onChange={() => toggle("emergencyLock")}
            />

            <PolicyToggle
              label="Focus Mode"
              checked={policy.focusMode}
              onChange={() => toggle("focusMode")}
            />
          </div>
        </PolicyCard>
      </div>

      <div className="flex justify-end">
        <button className="rounded-lg bg-teal-500 px-6 py-3 font-semibold text-slate-950 transition hover:bg-teal-400">
          Save Policy
        </button>
      </div>
    </div>
  );
}