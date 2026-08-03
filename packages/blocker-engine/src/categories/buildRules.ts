import { gamblingSites } from "../categories/gambling";
import { adultSites } from "../categories/adult";
import { socialSites } from "../categories/social";
import { gamingSites } from "../categories/gaming";

import type {
  BlockerSettings,
} from "@resolve/types";

export function buildWebsiteList(
  settings: BlockerSettings
) {

  const websites = new Set<string>();

  if (settings.gambling)
    gamblingSites.forEach(s => websites.add(s));

  if (settings.adult_content)
    adultSites.forEach(s => websites.add(s));

  if (settings.social_media)
    socialSites.forEach(s => websites.add(s));

  if (settings.gaming)
    gamingSites.forEach(s => websites.add(s));

  settings.custom_sites.forEach(s =>
    websites.add(s)
  );

  return [...websites];

}