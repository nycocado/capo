"use client";

import { useState } from "react";
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
 * Núcleo genérico das três etapas (cut/assembly/weld): mantém a lista leve como
 * estado de servidor no TanStack Query — semeada pelo prefetch RSC e sincronizada
 * por WebSocket — e o detalhe completo da ordem selecionada numa query separada.
 * Expõe as mutations de claim/release e o estado de UI compartilhado (aba, busca,
 * campo de busca, erro).
 *
 * @param params Configuração da etapa somada aos dados do prefetch.
 */
export function useWorkStage<TList extends StageListItem>({
  context,
  queryKey,
  fetchList,
  fetchById,
  claim: claimRequest,
  release: releaseRequest,
  ws,
  initialItems,
  fetchError,
}: UseWorkStageParams<TList>) {
  const queryClient = useQueryClient();

  const { data: items = [] } = useQuery({
    queryKey,
    queryFn: fetchList,
    initialData: initialItems,
    // A lista é mantida fresca por WebSocket/mutations; sem refetch em background.
    staleTime: Infinity,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });

  // Id da ordem cujo detalhe completo está em cache (a "ordem aberta").
  const [selectedId, setSelectedId] = useState<number | null>(null);

  // Query do detalhe completo: só ativa quando há uma ordem selecionada.
  const detailQueryKey = [...(queryKey as unknown[]), "detail", selectedId];
  const { data: selectedDetail } = useQuery<TList>({
    queryKey: detailQueryKey,
    queryFn: () => fetchById(selectedId!),
    enabled: selectedId !== null,
    // O detalhe não envelhece sozinho: é invalidado manualmente pelo WS e pelo claim.
    staleTime: Infinity,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });

  // Sincroniza o cache com os eventos em tempo real da etapa.
  // Ao receber qualquer evento, invalida a lista leve E o prefixo de detalhe.
  useStageSocket({
    route: ws.route,
    queryKey,
    eventNames: ws.eventNames,
    onEvent: () => {
      // Invalida todos os detalhes em cache (prefixo [...queryKey, "detail"]).
      queryClient.invalidateQueries({
        queryKey: [...(queryKey as unknown[]), "detail"],
      });
    },
  });

  const [activeTab, setActiveTab] = useState<TabType>(TAB_TYPES.ALL);
  const [search, setSearch] = useState("");
  const [searchField, setSearchField] = useState("id");
  const [errorMsg, setErrorMsg] = useState<string | null>(fetchError ?? null);

  // O campo de busca padrão depende da aba ativa (colunas diferentes por aba).
  // Ajuste durante o render (incl. mount): reseta o campo quando a aba muda,
  // sem efeito — evitando o set-state-in-effect e o flash do valor anterior.
  const stageKey = `${context}:${activeTab}`;
  const [syncedStageKey, setSyncedStageKey] = useState<string | null>(null);
  if (syncedStageKey !== stageKey) {
    setSyncedStageKey(stageKey);
    const fields = getSearchFields(context, activeTab);
    setSearchField(fields[0]?.id ?? "id");
  }

  const replaceInCache = (updated: TList) =>
    queryClient.setQueryData<TList[]>(queryKey, (current = []) =>
      replaceById(current, updated),
    );

  const onMutationError = (error: unknown) =>
    setErrorMsg(error instanceof Error ? error.message : "Unexpected error");

  const claimMutation = useMutation({
    mutationFn: claimRequest,
    onSuccess: (full: TList) => {
      // O retorno do claim é o detalhe completo: popula o cache de detalhe,
      // invalida a lista leve para atualizar counts/progress e seleciona a ordem.
      queryClient.setQueryData(
        [...(queryKey as unknown[]), "detail", full.id],
        full,
      );
      queryClient.invalidateQueries({ queryKey });
      setSelectedId(full.id);
    },
    onError: onMutationError,
  });

  const releaseMutation = useMutation({
    mutationFn: releaseRequest,
    onSuccess: (updated: TList) => {
      // Atualiza a lista leve com o item liberado e descarta o id selecionado.
      replaceInCache(updated);
      queryClient.invalidateQueries({ queryKey });
      setSelectedId(null);
    },
    onError: onMutationError,
  });

  /**
   * Reivindica (claim) uma ordem. O detalhe completo é guardado em cache e a
   * lista leve é invalidada; devolve o detalhe ou `undefined` em caso de erro.
   *
   * @param id Id da ordem a reivindicar.
   */
  const claim = async (id: number): Promise<TList | undefined> => {
    try {
      return await claimMutation.mutateAsync(id);
    } catch {
      return undefined;
    }
  };

  /**
   * Liberta (release) o claim de uma ordem, invalida a lista leve e limpa o
   * id selecionado. Devolve o item atualizado ou `undefined` em caso de erro.
   *
   * @param id Id da ordem a libertar.
   */
  const release = async (id: number): Promise<TList | undefined> => {
    try {
      return await releaseMutation.mutateAsync(id);
    } catch {
      return undefined;
    }
  };

  return {
    items,
    selectedDetail,
    selectedId,
    setSelectedId,
    queryClient,
    activeTab,
    setActiveTab,
    search,
    setSearch,
    searchField,
    setSearchField,
    errorMsg,
    setErrorMsg,
    claim,
    release,
    isClaiming: claimMutation.isPending,
    isReleasing: releaseMutation.isPending,
  };
}
