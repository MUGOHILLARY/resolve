import { useEffect, useState } from "react";

import {
  BlockerHeader,
  CategoryCards,
  WebsiteList,
  AddWebsiteForm,
  RecoveryLockCard,
} from "../components/blocker";

import {
  getBlockerSettings,
  updateBlockerSettings,
  addCustomWebsite,
  removeCustomWebsite,
  activateRecoveryLock,
} from "../services/blockerService";

import { useBlockerStore } from "../store/blockerStore";

export default function Blocker() {
  const {
    settings,
    setSettings,
    updateSettings,
  } = useBlockerStore();

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    initialize();
  }, []);

  async function initialize() {
    try {
      const data = await getBlockerSettings();
      setSettings(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  async function toggleSetting(
    key:
      | "gambling"
      | "adult_content"
      | "social_media"
      | "gaming"
      | "focus_mode"
  ) {
    if (!settings) return;

    const value = !settings[key];

    updateSettings({
      [key]: value,
    });

    try {
      const updated = await updateBlockerSettings({
        ...settings,
        [key]: value,
      });

      setSettings(updated);
    } catch (error) {
      console.error(error);

      updateSettings({
        [key]: !value,
      });
    }
  }

  async function addWebsite(site: string) {
    if (!settings) return;

    const website = site.trim().toLowerCase();

    if (!website) return;

    if (settings.custom_sites.includes(website)) {
      return;
    }

    try {
      const updated = await addCustomWebsite(website);
      setSettings(updated);
    } catch (error) {
      console.error(error);
    }
  }

  async function removeWebsite(site: string) {
    try {
      const updated = await removeCustomWebsite(site);
      setSettings(updated);
    } catch (error) {
      console.error(error);
    }
  }

  async function handleRecoveryLock(
    level: string,
    years: number
  ) {
    try {
      const updated = await activateRecoveryLock(
        level,
        years
      );

      setSettings(updated);

      alert("Recovery Lock Activated Successfully.");
    } catch (error) {
      console.error(error);
    }
  }

  if (loading) {
    return (
      <div className="text-white">
        Loading blocker...
      </div>
    );
  }

  if (!settings) {
    return (
      <div className="text-red-500">
        Failed to load blocker settings.
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <BlockerHeader />

      <RecoveryLockCard
        enabled={settings.recovery_lock_enabled}
        level={settings.recovery_lock_level ?? "None"}
        expires={settings.recovery_lock_until}
        reason={settings.recovery_lock_reason}
        onActivate={handleRecoveryLock}
      />

      <CategoryCards
        settings={settings}
        onToggle={toggleSetting}
      />

      <AddWebsiteForm
        onAdd={addWebsite}
      />

      <WebsiteList
        websites={settings.custom_sites}
        onDelete={removeWebsite}
      />
    </div>
  );
}