import { deduplicateDomains } from "./deduplicate";

export function mergeLists(
  ...lists: string[][]
) {

  return deduplicateDomains(
    lists.flat()
  );

}