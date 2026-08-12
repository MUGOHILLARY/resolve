export interface ResolveSettings {
  gambling: boolean;
  adult: boolean;
  social: boolean;
  gaming: boolean;
  customSites: string[];
}

/**
 * --------------------------------------------------------------------------
 * Gambling websites
 * --------------------------------------------------------------------------
 *
 * Curated list of commonly used gambling / betting domains.
 *
 * IMPORTANT:
 * This is a domain blocklist, not an automatic classification engine.
 * New gambling domains will need to be added to this list or supplied
 * through customSites.
 *
 * Subdomains are automatically covered by blockerEngine.ts because it uses:
 *
 *   ||domain^
 *
 * --------------------------------------------------------------------------
 */

const gamblingSites = [
  // ------------------------------------------------------------------------
  // International sportsbooks / betting
  // ------------------------------------------------------------------------

  "bet365.com",
  "betway.com",
  "1xbet.com",
  "22bet.com",
  "williamhill.com",
  "ladbrokes.com",
  "coral.co.uk",
  "betfair.com",
  "paddypower.com",
  "unibet.com",
  "bwin.com",
  "888sport.com",
  "888casino.com",
  "betfred.com",
  "skybet.com",
  "boylesports.com",
  "10bet.com",
  "betvictor.com",
  "betsson.com",
  "leovegas.com",
  "mrgreen.com",
  "sportingbet.com",
  "parimatch.com",
  "melbet.com",
  "megapari.com",
  "mostbet.com",
  "stake.com",
  "1win.com",
  "bc.game",
  "22bet.com",
  "betwinner.com",
  "betmaster.com",
  "fonbet.com",
  "pin-up.bet",
  "pinup.com",

  // ------------------------------------------------------------------------
  // Kenya / East Africa focused betting domains
  // ------------------------------------------------------------------------

  "sportpesa.com",
  "sportpesa.co.ke",
  "betika.com",
  "betika.co.ke",
  "odibets.com",
  "odibets.co.ke",
  "betway.co.ke",
  "1xbet.co.ke",
  "betafriq.com",
  "mozzartbet.com",
  "bangbet.com",
  "betgr8.com",
  "betlion.com",
  "betin.com",
  "betpawa.com",
  "betpawa.co.ke",
  "mcheza.com",
  "supabet.com",
  "elitebet.com",
  "playabet.com",
  "kwikbet.com",
  "luckysports.co.ke",

  // ------------------------------------------------------------------------
  // Casino / online gambling
  // ------------------------------------------------------------------------

  "casino.com",
  "casino.org",
  "casumo.com",
  "jackpotjoy.com",
  "grosvenorcasinos.com",
  "betwaycasino.com",
  "partypoker.com",
  "partycasino.com",
  "pokerstars.com",
  "pokerstarscasino.com",
  "888casino.com",
  "unibetcasino.com",
  "betssoncasino.com",
  "royalpanda.com",
  "videoslots.com",
  "rizk.com",
  "mansioncasino.com",
  "spinpalace.com",
  "spinwin.com",

  // ------------------------------------------------------------------------
  // Poker
  // ------------------------------------------------------------------------

  "pokerstars.com",
  "partypoker.com",
  "888poker.com",
  "ggpoker.com",
  "americascardroom.eu",
  "acr.bet",
  "natural8.com",

  // ------------------------------------------------------------------------
  // Lottery / lottery-style gambling
  // ------------------------------------------------------------------------

  "lotto.com",
  "lottoland.com",
  "thelotter.com",
];

/**
 * --------------------------------------------------------------------------
 * Adult websites
 * --------------------------------------------------------------------------
 */

const adultSites = [
  "pornhub.com",
  "xvideos.com",
  "xnxx.com",
  "xhamster.com",
  "redtube.com",
  "youporn.com",
  "tube8.com",
  "spankbang.com",
  "porn.com",
  "hqporner.com",
  "eporner.com",
  "beeg.com",
  "pornone.com",
  "drtuber.com",
  "tnaflix.com",
];

/**
 * --------------------------------------------------------------------------
 * Social media websites
 * --------------------------------------------------------------------------
 */

const socialSites = [
  "facebook.com",
  "instagram.com",
  "tiktok.com",
  "twitter.com",
  "x.com",
  "snapchat.com",
  "reddit.com",
  "pinterest.com",
  "threads.net",
  "linkedin.com",
  "tumblr.com",
  "discord.com",
];

/**
 * --------------------------------------------------------------------------
 * Gaming websites
 * --------------------------------------------------------------------------
 */

const gamingSites = [
  "roblox.com",
  "steam.com",
  "steampowered.com",
  "epicgames.com",
  "store.epicgames.com",
  "playstation.com",
  "xbox.com",
  "nintendo.com",
  "ea.com",
  "battle.net",
  "blizzard.com",
  "minecraft.net",
  "leagueoflegends.com",
  "riotgames.com",
  "fortnite.com",
  "twitch.tv",
];

/**
 * --------------------------------------------------------------------------
 * Domain normalization
 * --------------------------------------------------------------------------
 *
 * Converts:
 *
 *   https://www.bet365.com/sports
 *
 * into:
 *
 *   bet365.com
 *
 * Also handles:
 *
 *   http://bet365.com
 *   www.bet365.com
 *   bet365.com/sports
 *
 * --------------------------------------------------------------------------
 */

function normalizeDomain(site: string): string {
  if (
    typeof site !== "string" ||
    !site.trim()
  ) {
    return "";
  }

  let normalized = site.trim().toLowerCase();

  /**
   * Remove protocol.
   */
  normalized = normalized.replace(
    /^https?:\/\//,
    ""
  );

  /**
   * Remove leading www.
   */
  normalized = normalized.replace(
    /^www\./,
    ""
  );

  /**
   * Remove everything after the hostname.
   */
  normalized = normalized.split("/")[0];

  /**
   * Remove trailing dot.
   */
  normalized = normalized.replace(
    /\.$/,
    ""
  );

  /**
   * Remove whitespace.
   */
  normalized = normalized.trim();

  return normalized;
}

/**
 * --------------------------------------------------------------------------
 * Build the complete website blocking list
 * --------------------------------------------------------------------------
 */

export function buildWebsiteList(
  settings: ResolveSettings
): string[] {
  if (!settings) {
    return [];
  }

  const websites = new Set<string>();

  /**
   * Gambling
   */
  if (settings.gambling) {
    for (const site of gamblingSites) {
      const normalized =
        normalizeDomain(site);

      if (normalized) {
        websites.add(normalized);
      }
    }
  }

  /**
   * Adult content
   */
  if (settings.adult) {
    for (const site of adultSites) {
      const normalized =
        normalizeDomain(site);

      if (normalized) {
        websites.add(normalized);
      }
    }
  }

  /**
   * Social media
   */
  if (settings.social) {
    for (const site of socialSites) {
      const normalized =
        normalizeDomain(site);

      if (normalized) {
        websites.add(normalized);
      }
    }
  }

  /**
   * Gaming
   */
  if (settings.gaming) {
    for (const site of gamingSites) {
      const normalized =
        normalizeDomain(site);

      if (normalized) {
        websites.add(normalized);
      }
    }
  }

  /**
   * Custom websites supplied by the user / Resolve API.
   */
  if (
    Array.isArray(settings.customSites)
  ) {
    for (const site of settings.customSites) {
      const normalized =
        normalizeDomain(site);

      if (normalized) {
        websites.add(normalized);
      }
    }
  }

  return [...websites];
}