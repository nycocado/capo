// Define work states constants
export const WORK_STATES = {
  TO_DO: "to-do",
  INFORMATION: "information",
  WORKING: "working",
  FINISHED: "finished",
} as const;

// Define timing constants
export const TIMING = {
  FINISHED_MOVE_DELAY: 2000, // Visual feedback delay for finished items
} as const;

// Define validation constants
export const VALIDATION = {
  HEAT_NUMBER_MIN: 1,
} as const;

// Type for work states
export type WorkState = (typeof WORK_STATES)[keyof typeof WORK_STATES];
