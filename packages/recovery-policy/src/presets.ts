import type { RecoveryPolicy } from "./types.js";

export const presets: Record<string, RecoveryPolicy> = {

  beginner: {

    gambling: true,
    adult: true,
    social: false,
    gaming: false,
    shopping: false,
    streaming: false,
    aiCoach: true,
    journal: true,
    accountability: false,
    emergencyLock: false,
    focusMode: true

  },

  recovery: {

    gambling: true,
    adult: true,
    social: true,
    gaming: true,
    shopping: false,
    streaming: true,
    aiCoach: true,
    journal: true,
    accountability: true,
    emergencyLock: true,
    focusMode: true

  },

  focus: {

    gambling: false,
    adult: false,
    social: true,
    gaming: true,
    shopping: true,
    streaming: true,
    aiCoach: true,
    journal: false,
    accountability: false,
    emergencyLock: false,
    focusMode: true

  }

};