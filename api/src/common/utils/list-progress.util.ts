import { ListProgress } from "@shared/types";

export interface StatusCounts {
  total: number;
  done: number;
  inProgress: number;
}

export function deriveListProgress(counts: StatusCounts): ListProgress {
  if (counts.total > 0 && counts.done === counts.total) {
    return ListProgress.DONE;
  }
  if (counts.done > 0 || counts.inProgress > 0) {
    return ListProgress.IN_PROGRESS;
  }
  return ListProgress.TO_DO;
}
