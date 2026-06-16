import { useCallback } from "react";
import { TAB_TYPES, TabType } from "@components/features/WorkTabs";
import { WorkStatusDto } from "@/dtos";

export const DEFAULT_WORK_STATES = {
  TO_DO: "to-do",
  WORKING: "working",
  FINISHED: "finished",
  INFORMATION: "information",
} as const;

/**
 * Mapeia o workStatus de um item para o estado de UI correspondente.
 *
 * @param workStatus Objeto com o nome do status vindo da API.
 * @param workStates Mapa de estados; usa DEFAULT_WORK_STATES por padrão.
 * @returns Nome do estado de UI (to-do, working, finished).
 */
export const getWorkStatusState = (
  workStatus?: { name: string },
  workStates = DEFAULT_WORK_STATES,
): string => {
  if (!workStatus) return workStates.TO_DO;

  switch (workStatus.name.toLowerCase()) {
    case workStates.TO_DO:
      return workStates.TO_DO;
    case workStates.WORKING:
      return workStates.WORKING;
    case workStates.FINISHED:
      return workStates.FINISHED;
    default:
      return workStates.TO_DO;
  }
};

/**
 * Verifica se o usuário atual pode interagir com um item em estado WORKING.
 * Retorna `true` se o item não está WORKING, não há usuário, ou o status foi
 * criado pelo próprio usuário.
 *
 * @param item Item com workStatus e o id de quem o iniciou.
 * @param currentUserId Id do usuário autenticado.
 * @param workStates Mapa de estados; usa DEFAULT_WORK_STATES por padrão.
 */
export const canUserAccessItem = <
  T extends { workStatus?: { name: string; createdBy?: number | null } },
>(
  item: T,
  currentUserId?: number,
  workStates = DEFAULT_WORK_STATES,
): boolean => {
  if (!currentUserId) return true;

  const workStatus = getWorkStatusState(item.workStatus, workStates);
  if (workStatus !== workStates.WORKING) return true;

  const createdBy = item.workStatus?.createdBy;
  return !createdBy || createdBy === currentUserId;
};

/**
 * Produz um accessor memoizado que resolve o estado de UI de cada item,
 * priorizando o estado "information" (seleção local) antes do workStatus da API
 * e aplicando a restrição "danger" para itens WORKING de outro utilizador.
 *
 * @param activeTab Aba ativa; a restrição "danger" só se aplica na aba ALL.
 * @param informationIds Conjunto de ids com estado "information" local.
 * @param currentUserId Id do utilizador autenticado; omitir desativa a restrição.
 * @param workStates Mapa de estados; usa DEFAULT_WORK_STATES por padrão.
 */
export const useWorkStatusAccessor = <
  T extends {
    id: number;
    workStatus?: WorkStatusDto;
  },
>(
  activeTab: TabType,
  informationIds: Set<number>,
  currentUserId?: number,
  workStates = DEFAULT_WORK_STATES,
) => {
  return useCallback(
    (item: T) => {
      if (informationIds.has(item.id)) {
        return workStates.INFORMATION;
      }

      if (activeTab === TAB_TYPES.ALL) {
        if (!canUserAccessItem(item, currentUserId, workStates)) {
          return "danger";
        }
      }

      return getWorkStatusState(item.workStatus, workStates);
    },
    [activeTab, informationIds, currentUserId, workStates],
  );
};
