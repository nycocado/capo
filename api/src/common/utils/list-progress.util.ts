import { ListProgress } from "@shared/types";

/** Contagem de itens de uma ordem por estado. */
export interface StatusCounts {
  total: number;
  done: number;
  inProgress: number;
}

/**
 * Deriva o progresso de uma ordem a partir da contagem dos seus itens.
 *
 * @param counts Total, concluídos e em progresso dos itens da ordem
 * @returns done se todos concluídos; in_progress se algum começou; senão to_do
 */
export function deriveListProgress(counts: StatusCounts): ListProgress {
  if (counts.total > 0 && counts.done === counts.total) {
    return ListProgress.DONE;
  }
  if (counts.done > 0 || counts.inProgress > 0) {
    return ListProgress.IN_PROGRESS;
  }
  return ListProgress.TO_DO;
}
