import { normalizeDomain } from "../normalize";
import { isValidDomain } from "../validate";

export function importCsv(
  csv: string
) {

  return csv
    .split(/\r?\n/)
    .flatMap(line => line.split(","))
    .map(normalizeDomain)
    .filter(isValidDomain);

}