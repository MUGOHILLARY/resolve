import {
  gamblingSites,
  adultSites,
  socialSites,
  gamingSites,
} from "./defaultRules";

import { ResolveSettings } from "../storage/settings";

export function buildWebsiteList(
  settings: ResolveSettings
): string[] {

  const websites = new Set<string>();

  if (settings.gambling) {
    gamblingSites.forEach(site => websites.add(site));
  }

  if (settings.adult) {
    adultSites.forEach(site => websites.add(site));
  }

  if (settings.social) {
    socialSites.forEach(site => websites.add(site));
  }

  if (settings.gaming) {
    gamingSites.forEach(site => websites.add(site));
  }

  settings.customSites.forEach(site =>
    websites.add(site)
  );

  return [...websites];
}