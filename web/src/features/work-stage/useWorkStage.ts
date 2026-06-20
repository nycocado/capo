"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { TAB_TYPES, type TabType } from "@components/features/WorkTabs";
import { getSearchFields } from "@components/features/ControlPanel/ControlPanel.searchConfig";
import { useStageSocket } from "@/lib/ws/useStageSocket";
import { replaceById } from "@/domain/logic/upsertById";
import type { StageListItem, WorkStageConfig } from "./types";

export interface UseWorkStageParams<
  TList extends StageListItem,
> extends WorkStageConfig<TList> {
  initialItems: TList[];
  fetchError?: string;
}

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
    staleTime: Infinity,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });

  const [selectedId, setSelectedId] = useState<number | null>(null);

  const detailQueryKey = [...(queryKey as unknown[]), "detail", selectedId];
  const { data: selectedDetail } = useQuery<TList>({
    queryKey: detailQueryKey,
    queryFn: () => fetchById(selectedId!),
    enabled: selectedId !== null,
    staleTime: Infinity,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });

  useStageSocket({
    route: ws.route,
    queryKey,
    eventNames: ws.eventNames,
    onEvent: () => {
      queryClient.invalidateQueries({
        queryKey: [...(queryKey as unknown[]), "detail"],
      });
    },
  });

  const [activeTab, setActiveTab] = useState<TabType>(TAB_TYPES.ALL);
  const [search, setSearch] = useState("");
  const [searchField, setSearchField] = useState("id");
  const [errorMsg, setErrorMsg] = useState<string | null>(fetchError ?? null);

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
      replaceInCache(updated);
      queryClient.invalidateQueries({ queryKey });
      setSelectedId(null);
    },
    onError: onMutationError,
  });

  const claim = async (id: number): Promise<TList | undefined> => {
    try {
      return await claimMutation.mutateAsync(id);
    } catch {
      return undefined;
    }
  };

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
