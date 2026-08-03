import { normalizeDomain } from "../normalize";
import { isValidDomain } from "../validate";

export function importJson(
  data: string[]
) {

  return data
    .map(normalizeDomain)
    .filter(isValidDomain);

}