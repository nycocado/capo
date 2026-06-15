"use client";

import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { TAB_TYPES, type TabType } from "@components/features/WorkTabs";
import { getSearchFields } from "@components/features/ControlPanel/ControlPanel.searchConfig";
import { useStageSocket } from "@/lib/ws/useStageSocket";
import { replaceById } from "@/domain/logic/upsertById";
import type { StageListItem, WorkStageConfig } from "./types";

export interface UseWorkStageParams<TList extends StageListItem>
  extends WorkStageConfig<TList> {
  /** Lista vinda do prefetch RSC, usada como dado inicial do cache. */
  initialItems: TList[];
  /** Erro do prefetch RSC, exibido até a primeira interação. */
  fetchError?: string;
}

/**
 * Núcleo genérico das três etapas (cut/assembly/weld): mantém a lista como
 * estado de servidor no TanStack Query — semeada pelo prefetch RSC e
 * sincronizada por WebSocket — e expõe a mutation de "set working" mais o
 * estado de UI compartilhado (aba, busca, campo de busca, erro).
 *
 * @param params Configuração da etapa somada aos dados do prefetch.
 */
export function useWorkStage<TList extends StageListItem>({
  context,
  queryKey,
  fetchToDo,
  setWorking: setWorkingRequest,
  ws,
  initialItems,
  fetchError,
}: UseWorkStageParams<TList>) {
  const queryClient = useQueryClient();

  const { data: items = [] } = useQuery({
    queryKey,
    queryFn: fetchToDo,
    initialData: initialItems,
    // A lista é mantida fresca por WebSocket/mutations; sem refetch em background.
    staleTime: Infinity,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });

  // Sincroniza a lista em cache com os eventos em tempo real da etapa.
  useStageSocket<TList>({ route: ws.route, queryKey, events: ws.events });

  const [activeTab, setActiveTab] = useState<TabType>(TAB_TYPES.ALL);
  const [search, setSearch] = useState("");
  const [searchField, setSearchField] = useState("id");
  const [errorMsg, setErrorMsg] = useState<string | null>(fetchError ?? null);

  // O campo de busca padrão depende da aba ativa (colunas diferentes por aba).
  useEffect(() => {
    const fields = getSearchFields(context, activeTab);
    setSearchField(fields[0]?.id ?? "id");
  }, [context, activeTab]);

  const setWorkingMutation = useMutation({
    mutationFn: setWorkingRequest,
    onSuccess: (updated) => {
      queryClient.setQueryData<TList[]>(queryKey, (current = []) =>
        replaceById(current, updated),
      );
    },
    onError: (error) => {
      setErrorMsg(error instanceof Error ? error.message : "Unexpected error");
    },
  });

  /**
   * Dispara o "set working" da lista e devolve a lista atualizada, ou
   * `undefined` em caso de erro (já reportado em `errorMsg`).
   *
   * @param id Id da lista a marcar como "working".
   */
  const setWorking = async (id: number): Promise<TList | undefined> => {
    try {
      return await setWorkingMutation.mutateAsync(id);
    } catch {
      return undefined;
    }
  };

  return {
    items,
    queryClient,
    activeTab,
    setActiveTab,
    search,
    setSearch,
    searchField,
    setSearchField,
    errorMsg,
    setErrorMsg,
    setWorking,
    isSettingWorking: setWorkingMutation.isPending,
  };
}
