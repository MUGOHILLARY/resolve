import { normalizeDomain } from "../normalize";
import { isValidDomain } from "../validate";

export function importHosts(
  text: string
) {

  return text
    .split(/\r?\n/)
    .map(line => {

      const parts = line.trim().split(/\s+/);

      return parts.length >= 2
        ? parts[1]
        : "";

    })
    .map(normalizeDomain)
    .filter(isValidDomain);

}