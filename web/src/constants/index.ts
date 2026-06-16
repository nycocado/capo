/** Estados de trabalho de um item ao longo das etapas (corte/montagem/solda). */
export const WORK_STATES = {
  TO_DO: "to-do",
  INFORMATION: "information",
  WORKING: "working",
  FINISHED: "finished",
} as const;

/** Limites de validação partilhados (ex.: heat number mínimo). */
export const VALIDATION = {
  HEAT_NUMBER_MIN: 1,
} as const;
