import type { RecoveryPolicy } from "./types.js";

export const defaultPolicy: RecoveryPolicy = {

  gambling: true,

  adult: true,

  social: true,

  gaming: false,

  shopping: false,

  streaming: false,

  aiCoach: true,

  journal: true,

  accountability: false,

  emergencyLock: false,

  focusMode: true

};