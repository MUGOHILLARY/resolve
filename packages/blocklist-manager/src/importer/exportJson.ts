export function exportJson(
  domains: string[]
) {

  return JSON.stringify(
    domains,
    null,
    2
  );

}
