export interface ResolveSettings {
  gambling: boolean;
  adult: boolean;
  social: boolean;
  gaming: boolean;
  customSites: string[];
}

export const DEFAULT_SETTINGS: ResolveSettings = {
  gambling: true,
  adult: true,
  social: false,
  gaming: false,
  customSites: [],
};

/**
 * Get Resolve settings from Chrome sync storage.
 */
export async function getSettings(): Promise<ResolveSettings> {
  const data =
    await chrome.storage.sync.get(
      "settings"
    );

  const settings =
    data.settings as
      | Partial<ResolveSettings>
      | undefined;

  return {
    gambling:
      settings?.gambling ??
      DEFAULT_SETTINGS.gambling,

    adult:
      settings?.adult ??
      DEFAULT_SETTINGS.adult,

    social:
      settings?.social ??
      DEFAULT_SETTINGS.social,

    gaming:
      settings?.gaming ??
      DEFAULT_SETTINGS.gaming,

    customSites:
      Array.isArray(
        settings?.customSites
      )
        ? settings.customSites
        : [],
  };
}

/**
 * Save Resolve settings to Chrome sync storage.
 */
export async function saveSettings(
  settings: ResolveSettings
): Promise<void> {
  await chrome.storage.sync.set({
    settings,
  });

  console.log(
    "💾 Resolve settings saved."
  );
}