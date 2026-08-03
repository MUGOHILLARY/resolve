import { normalizeDomain } from "./normalize";

export function deduplicateDomains(
  domains: string[]
): string[] {
  return [...new Set(domains.map(normalizeDomain))];
}