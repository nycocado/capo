import { useCallback } from "react";
import { WORK_STATES } from "@/constants";

/** Estado de UI a partir do status de um item (pipe-length/joint/weld). */
export const statusToUiState = (status?: string): string => {
  switch (status) {
    case "in_progress":
      return WORK_STATES.WORKING;
    case "done":
      return WORK_STATES.FINISHED;
    default:
      return WORK_STATES.TO_DO;
  }
};

/** Uma ordem é acessível se não estiver reclamada (claim) por outro utilizador. */
export const isListAccessible = (
  list: { claimedBy?: { id: number } | null },
  currentUserId?: number,
): boolean =>
  !list.claimedBy || !currentUserId || list.claimedBy.id === currentUserId;

/**
 * Estado de UI de uma ordem: "danger" se reclamada por outro utilizador
 * (bloqueada), senão derivado do progresso agregado.
 *
 * @param list Ordem com progresso e claim.
 * @param currentUserId Id do utilizador autenticado.
 */
export const listToUiState = (
  list: { progress?: string; claimedBy?: { id: number } | null },
  currentUserId?: number,
): string => {
  if (!isListAccessible(list, currentUserId)) return "danger";
  return statusToUiState(list.progress);
};

/**
 * Accessor memoizado do estado de UI de cada item: dá prioridade ao estado
 * "information" (seleção local) e delega no `resolveRawState` para o estado
 * vindo da API (status do item ou progresso/claim da ordem).
 *
 * @param informationIds Conjunto de ids com estado "information" local.
 * @param resolveRawState Resolve o estado de UI a partir dos campos da API.
 */
export const useWorkStatusAccessor = <T extends { id: number }>(
  informationIds: Set<number>,
  resolveRawState: (item: T) => string,
) =>
  useCallback(
    (item: T) =>
      informationIds.has(item.id)
        ? WORK_STATES.INFORMATION
        : resolveRawState(item),
    [informationIds, resolveRawState],
  );
