export interface ResolveSettings {
  gambling: boolean;
  adult: boolean;
  social: boolean;
  gaming: boolean;
  customSites: string[];
}

/*
 * Default Resolve blocked websites.
 *
 * Keep this list relatively small while testing.
 */
const gamblingSites = [
  "bet365.com",
  "betway.com",
  "1xbet.com",
  "22bet.com",
];

const adultSites = [
  "pornhub.com",
  "xvideos.com",
  "xnxx.com",
];

const socialSites = [
  "facebook.com",
  "instagram.com",
  "tiktok.com",
];

const gamingSites = [
  "roblox.com",
  "steam.com",
  "steampowered.com",
];

/**
 * Normalize a website/domain.
 */
function normalizeDomain(
  site: string
): string {
  return site
    .trim()
    .toLowerCase()
    .replace(/^https?:\/\//, "")
    .replace(/^www\./, "")
    .split("/")[0]
    .trim();
}

/**
 * Build the complete website blocking list.
 */
export function buildWebsiteList(
  settings: ResolveSettings
): string[] {
  const websites = new Set<string>();

  if (!settings) {
    return [];
  }

  if (settings.gambling) {
    gamblingSites.forEach((site) =>
      websites.add(
        normalizeDomain(site)
      )
    );
  }

  if (settings.adult) {
    adultSites.forEach((site) =>
      websites.add(
        normalizeDomain(site)
      )
    );
  }

  if (settings.social) {
    socialSites.forEach((site) =>
      websites.add(
        normalizeDomain(site)
      )
    );
  }

  if (settings.gaming) {
    gamingSites.forEach((site) =>
      websites.add(
        normalizeDomain(site)
      )
    );
  }

  if (
    Array.isArray(
      settings.customSites
    )
  ) {
    settings.customSites.forEach(
      (site) => {
        const normalized =
          normalizeDomain(site);

        if (normalized) {
          websites.add(
            normalized
          );
        }
      }
    );
  }

  return [...websites];
}