export function shouldTriggerEmergencyLock(
  attempts: number
) {

  return attempts >= 3;

}