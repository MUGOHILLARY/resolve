export function isFocusActive(
  focusUntil: string | null
) {

  if (!focusUntil)
    return false;

  return new Date() <
    new Date(focusUntil);

}