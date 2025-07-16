// Tab constants for better maintainability
export const TAB_TYPES = {
  ALL: "all",
  WORKING: "working",
} as const;

// Type derivation
export type TabType = (typeof TAB_TYPES)[keyof typeof TAB_TYPES];

// Tab configurations - remove readonly constraint
export const tabsAllWorking: string[] = [TAB_TYPES.ALL, TAB_TYPES.WORKING];
