export const TAB_TYPES = {
  ALL: "all",
  WORKING: "working",
} as const;

export type TabType = (typeof TAB_TYPES)[keyof typeof TAB_TYPES];

export const tabsAllWorking: string[] = [TAB_TYPES.ALL, TAB_TYPES.WORKING];
