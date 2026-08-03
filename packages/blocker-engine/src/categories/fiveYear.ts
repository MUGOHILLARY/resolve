export function isFiveYearLockExpired(
  lockDate: Date
) {

  const expiry = new Date(lockDate);

  expiry.setFullYear(
    expiry.getFullYear() + 5
  );

  return new Date() >= expiry;

}