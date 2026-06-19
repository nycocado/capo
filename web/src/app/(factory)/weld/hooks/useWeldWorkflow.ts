import { useCallback, useMemo, useState } from "react";
import { useWeldListTable } from "./useWeldListTable";
import { WeldListDto, UserDto } from "@/dtos";
import { WeldWithContext } from "@interfaces/weld-with-context.interface";
import { TAB_TYPES } from "@components/features/WorkTabs";
import { useUIConfigurations } from "@/hooks";
import { API_ROUTES, WS_EVENTS, WS_ROUTES } from "@/routes";
import { useWeldGrid } from "./useWeldGrid";
import { useWeldDataVerification } from "./useWeldDataVerification";
import { weldButtonConfig } from "@components/features/ControlPanel";
import { weldCardConfigs } from "@components/features/WorkPanel/WorkPanel.cardConfigs";
import { claimWeldList, fetchWeldLists, releaseWeldList } from "@/lib/api";
import { queryKeys } from "@/lib/query/keys";
import { useWorkStage } from "@/features/work-stage/useWorkStage";
import type { WorkStageConfig } from "@/features/work-stage/types";

/** Configuração da etapa de soldagem para o núcleo genérico useWorkStage. */
const weldStageConfig: WorkStageConfig<WeldListDto> = {
  context: "weld",
  queryKey: queryKeys.weldLists(),
  fetchList: fetchWeldLists,
  claim: claimWeldList,
  release: releaseWeldList,
  ws: {
    route: WS_ROUTES.weldList,
    eventNames: [WS_EVENTS.stage.claimChanged, WS_EVENTS.stage.statusChanged],
  },
};

export interface UseWeldWorkflowProps {
  initialItems: WeldListDto[];
  currentUser: UserDto | null;
  fetchError?: string;
}

/**
 * Hook principal da etapa de soldagem: compõe o núcleo genérico useWorkStage
 * com a tabela, o modal de dados do weld (WPS + filler), o grid de welds e as
 * configurações de UI.
 *
 * @param initialItems Lista prefetchada pelo RSC (seed do cache).
 * @param currentUser Utilizador autenticado (claim/acesso).
 * @param fetchError Erro do prefetch RSC.
 */
export const useWeldWorkflow = ({
  initialItems,
  currentUser,
  fetchError,
}: UseWeldWorkflowProps) => {
  const {
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
    claim,
  } = useWorkStage<WeldListDto>({ ...weldStageConfig, initialItems, fetchError });

  const [selectedWeldListId, setSelectedWeldListId] = useState<number | null>(
    null,
  );
  const selectedWeldList = useMemo<WeldListDto | null>(
    () =>
      selectedWeldListId === null
        ? null
        : (items.find((wl) => wl.id === selectedWeldListId) ?? null),
    [items, selectedWeldListId],
  );

  // Último weld selecionado; mantido para ações auxiliares (ex.: abrir o WPS).
  const [selectedWeld, setSelectedWeld] = useState<WeldWithContext | null>(
    null,
  );

  const openWorkingView = useCallback(
    (weldList: WeldListDto) => {
      setSelectedWeldListId(weldList.id);
      setActiveTab(TAB_TYPES.WORKING);
    },
    [setActiveTab],
  );

  const startWeldList = useCallback(
    async (id: number): Promise<boolean> => {
      const updated = await claim(id);
      if (updated) openWorkingView(updated);
      return Boolean(updated);
    },
    [claim, openWorkingView],
  );

  const weldListTable = useWeldListTable(
    items,
    search,
    currentUser?.id,
    {
      onWeldListSelected: async (weldList) => {
        if (weldList.progress === "done") openWorkingView(weldList);
        else await startWeldList(weldList.id);
      },
      onWeldListClaim: async (id) => await startWeldList(id),
    },
    searchField,
  );

  const weldDataVerification = useWeldDataVerification({
    onWeldProcessed: (updatedWeld) => {
      // O servidor recomputa o progresso da ordem; revalida a lista.
      queryClient.invalidateQueries({ queryKey: queryKeys.weldLists() });
      setSelectedWeld(updatedWeld);
    },
    onError: setErrorMsg,
  });

  const handleWeldClick = useCallback(
    (weld: WeldWithContext) => {
      setSelectedWeld(weld);
      if (weld.status !== "done") weldDataVerification.startVerification(weld);
    },
    [weldDataVerification],
  );

  const weldGrid = useWeldGrid({
    weldList: selectedWeldList,
    search: activeTab === TAB_TYPES.WORKING ? "" : search,
    onAllFinished: () => {
      setSelectedWeldListId(null);
      setActiveTab(TAB_TYPES.ALL);
    },
    handleWeldClick,
  });

  const handleNextWorkflow = useCallback(async () => {
    if (activeTab === TAB_TYPES.ALL) {
      weldListTable.handleNextWorkflow();
    } else if (activeTab === TAB_TYPES.WORKING) {
      await weldGrid.handleNextWorkflow();
    }
  }, [activeTab, weldListTable, weldGrid]);

  const handleWpsClick = useCallback(() => {
    if (!selectedWeld) {
      setErrorMsg("Selecione um weld na grade para visualizar o WPS.");
      return;
    }
    const doc = selectedWeld.wps?.document;
    if (!doc) {
      setErrorMsg("WPS não disponível para o weld selecionado.");
      return;
    }
    window.open(API_ROUTES.documents.download("wps", doc), "_blank");
  }, [selectedWeld, setErrorMsg]);

  const { cards, controlButtons } = useUIConfigurations(
    selectedWeld,
    null,
    { onNextClick: handleNextWorkflow, onWpsClick: handleWpsClick },
    {
      buttonConfig: weldButtonConfig,
      cardConfigs: (item: WeldWithContext | null) =>
        weldCardConfigs(item, { onWPSClick: handleWpsClick }),
    },
  );

  return {
    state: { errorMsg, activeTab, search, setSearch, setErrorMsg },
    weldListTable,
    weldGrid,
    weldItems: weldGrid.weldItems,
    cards,
    controlButtons,
    setActiveTab,
    searchField,
    setSearchField,
    weldDataVerification,
  };
};
