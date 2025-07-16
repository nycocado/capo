export const WORK_STATES = {
  TO_DO: "to-do",
  WORKING: "working",
  FINISHED: "finished",
  INFORMATION: "information",
} as const;

export const TIMING = {
  FINISHED_MOVE_DELAY: 2000, // Visual feedback delay for finished items
} as const;

export type WorkState = (typeof WORK_STATES)[keyof typeof WORK_STATES];
