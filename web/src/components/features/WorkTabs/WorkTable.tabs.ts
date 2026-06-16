/** Tipos de aba partilhados pelas tabelas/grids das etapas. */
export const TAB_TYPES = {
  ALL: "all",
  WORKING: "working",
} as const;

export type TabType = (typeof TAB_TYPES)[keyof typeof TAB_TYPES];

// Array mutável (não readonly) para casar com as props que esperam string[].
export const tabsAllWorking: string[] = [TAB_TYPES.ALL, TAB_TYPES.WORKING];
