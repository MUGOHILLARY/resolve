import { getSettings } from "../storage/settings";
import { buildWebsiteList } from "../rules/buildRules";

function normalizeHostname(hostname: string): string {
  return hostname
    .toLowerCase()
    .replace(/^www\./, "")
    .trim();
}

export async function getBlockedSites(): Promise<string[]> {
  const settings = await getSettings();

  return buildWebsiteList(settings).map(normalizeHostname);
}

export async function shouldBlock(
  url: string
): Promise<boolean> {
  try {
    const blockedSites = await getBlockedSites();

    const hostname = normalizeHostname(
      new URL(url).hostname
    );

    return blockedSites.some(site =>
      hostname === site ||
      hostname.endsWith("." + site)
    );

  } catch (error) {

    console.error(
      "Navigation check failed:",
      error
    );

    return false;
  }
}(async () => {
  console.log(
    "Should block betika:",
    await shouldBlock("https://betika.com")
  );

  console.log(
    "Should block youtube:",
    await shouldBlock("https://youtube.com")
  );
})();