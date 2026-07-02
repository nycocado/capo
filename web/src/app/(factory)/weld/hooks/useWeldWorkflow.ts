import { useCallback } from "react";
import { WeldListDto, UserDto } from "@dtos";
import { WeldWithContext } from "@interfaces/weld-with-context.interface";
import { TAB_TYPES } from "@components/features/WorkTabs";
import { columnsWeldList } from "@components/features/WorkTable/WorkTable.columns";
import { useStageListTable, useUIConfigurations } from "@hooks";
import { API_ROUTES, WS_EVENTS, WS_ROUTES } from "@/routes";
import { useWeldGrid } from "./useWeldGrid";
import { useWeldDataVerification } from "./useWeldDataVerification";
import { weldButtonConfig } from "@components/features/ControlPanel";
import { weldCardConfigs } from "@components/features/WorkPanel/WorkPanel.cardConfigs";
import {
  claimWeldList,
  fetchWeldLists,
  getWeldListById,
  releaseWeldList,
} from "@/lib/api";
import { queryKeys } from "@/lib/query/keys";
import { useWorkStage } from "@/features/work-stage/useWorkStage";
import type { WorkStageConfig } from "@/features/work-stage/types";
import { useState } from "react";

const weldStageConfig: WorkStageConfig<WeldListDto> = {
  context: "weld",
  queryKey: queryKeys.weldLists(),
  fetchList: fetchWeldLists,
  fetchById: getWeldListById,
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

export const useWeldWorkflow = ({
  initialItems,
  currentUser,
  fetchError,
}: UseWeldWorkflowProps) => {
  const {
    items,
    selectedDetail: selectedWeldList,
    setSelectedId: setSelectedWeldListId,
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
  } = useWorkStage<WeldListDto>({
    ...weldStageConfig,
    initialItems,
    fetchError,
  });

  const [selectedWeld, setSelectedWeld] = useState<WeldWithContext | null>(
    null,
  );

  const openWorkingView = useCallback(
    (weldList: WeldListDto) => {
      setSelectedWeldListId(weldList.id);
      setActiveTab(TAB_TYPES.WORKING);
    },
    [setSelectedWeldListId, setActiveTab],
  );

  const startWeldList = useCallback(
    async (id: number): Promise<boolean> => {
      const updated = await claim(id);
      if (updated) setActiveTab(TAB_TYPES.WORKING);
      return Boolean(updated);
    },
    [claim, setActiveTab],
  );

  const weldListTable = useStageListTable<WeldListDto>({
    items,
    search,
    searchField,
    columns: columnsWeldList,
    currentUserId: currentUser?.id,
    callbacks: {
      onSelected: async (weldList) => {
        if (weldList.progress === "done") openWorkingView(weldList);
        else await startWeldList(weldList.id);
      },
      onClaim: async (id) => await startWeldList(id),
    },
  });

  const weldDataVerification = useWeldDataVerification({
    onWeldProcessed: (updatedWeld) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.weldLists() });
      queryClient.invalidateQueries({
        queryKey: [...queryKeys.weldLists(), "detail"],
      });
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
    weldList: selectedWeldList ?? null,
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
    selectedWeld,
    cards,
    controlButtons,
    setActiveTab,
    searchField,
    setSearchField,
    weldDataVerification,
  };
};
