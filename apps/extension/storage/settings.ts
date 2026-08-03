export interface ResolveSettings {
  gambling: boolean;
  adult: boolean;
  social: boolean;
  gaming: boolean;
  customSites: string[];
}

const DEFAULT_SETTINGS: ResolveSettings = {
  gambling: true,
  adult: true,
  social: false,
  gaming: false,
  customSites: [],
};

export async function getSettings(): Promise<ResolveSettings> {
  const data = await chrome.storage.sync.get("settings");

  return data.settings ?? DEFAULT_SETTINGS;
}

export async function saveSettings(
  settings: ResolveSettings
) {
  await chrome.storage.sync.set({
    settings,
  });
}