/**
 * Progresso derivado de uma ordem de trabalho, agregado a partir do status
 * dos seus itens (não é persistido — calculado no service).
 */
export enum ListProgress {
  TO_DO = "to_do",
  IN_PROGRESS = "in_progress",
  DONE = "done",
}
