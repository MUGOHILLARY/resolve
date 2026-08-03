export function isValidDomain(
  domain: string
): boolean {

  const regex =
    /^[a-z0-9.-]+\.[a-z]{2,}$/i;

  return regex.test(domain);

}