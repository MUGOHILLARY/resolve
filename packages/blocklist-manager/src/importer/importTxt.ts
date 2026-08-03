import { normalizeDomain } from "../normalize";
import { isValidDomain } from "../validate";

export function importTxt(text: string): string[] {

  return text
    .split(/\r?\n/)
    .map(normalizeDomain)
    .filter(isValidDomain);

}