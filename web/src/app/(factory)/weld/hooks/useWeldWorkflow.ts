import { useCallback, useMemo, useState } from "react";
import { useWeldListTable } from "./useWeldListTable";
import { WeldListDto, UserDto } from "@/dtos";
import { WeldWithContext } from "@interfaces/weld-with-context.interface";
import { TAB_TYPES } from "@components/features/WorkTabs";
import { useUIConfigurations } from "@/hooks";
import { API_ROUTES, WS_EVENTS, WS_ROUTES } from "@/routes";
import { useWeldGrid } from "@/app/(factory)/weld/hooks/useWeldGrid";
import { useWeldDataVerification } from "@/app/(factory)/weld/hooks/useWeldDataVerification";
import { mergeWeldIntoWeldLists } from "../utils/weldUtils";
import { weldButtonConfig } from "@components/features/ControlPanel";
import { weldCardConfigs } from "@components/features/WorkPanel/WorkPanel.cardConfigs";
import { fetchToDoWeldLists, setWeldListWorking } from "@/lib/api";
import { queryKeys } from "@/lib/query/keys";
import { replaceById, upsertManyById } from "@/domain/logic/upsertById";
import { useWorkStage } from "@/features/work-stage/useWorkStage";
import type { WorkStageConfig } from "@/features/work-stage/types";

/** Configuração da etapa de soldagem para o núcleo genérico useWorkStage. */
const weldStageConfig: WorkStageConfig<WeldListDto> = {
  context: "weld",
  queryKey: queryKeys.weldLists(),
  fetchToDo: fetchToDoWeldLists,
  setWorking: setWeldListWorking,
  ws: {
    route: WS_ROUTES.weldList,
    events: [
      {
        name: WS_EVENTS.weldList.updateWorkStatus,
        toUpdate: (payload) => (current) =>
          replaceById(current, payload as WeldListDto),
      },
      {
        // O gateway emite um ARRAY de weld-lists em createsWeldList.
        name: WS_EVENTS.weldList.create,
        toUpdate: (payload) => (current) =>
          upsertManyById(current, payload as WeldListDto[]),
      },
    ],
  },
};

export interface UseWeldWorkflowProps {
  initialItems: WeldListDto[];
  currentUser: UserDto | null;
  fetchError?: string;
}

/**
 * Hook principal da etapa de soldagem: compõe o núcleo genérico useWorkStage
 * com tabela, verificação de dados do weld, grid de welds e configurações de UI.
 *
 * @param initialItems Lista prefetchada pelo RSC (seed do cache TanStack Query).
 * @param currentUser Usuário autenticado; usado para controle de acesso à weld-list.
 * @param fetchError Erro do prefetch RSC, exibido até a primeira interação.
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
    setWorking,
  } = useWorkStage<WeldListDto>({
    ...weldStageConfig,
    initialItems,
    fetchError,
  });

  // A weld-list selecionada (derivada do cache) alimenta o grid de welds.
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

  // Último weld selecionado; mantido para ações auxiliares como abrir o WPS.
  const [selectedWeld, setSelectedWeld] = useState<WeldWithContext | null>(
    null,
  );

  // Abre uma weld-list na aba Working
  const openWorkingView = useCallback(
    (weldList: WeldListDto) => {
      setSelectedWeldListId(weldList.id);
      setActiveTab(TAB_TYPES.WORKING);
    },
    [setActiveTab],
  );

  // Marca a weld-list como working e abre sua vista de welds
  const startWeldList = useCallback(
    async (id: number): Promise<boolean> => {
      const updated = await setWorking(id);
      if (updated) openWorkingView(updated);
      return Boolean(updated);
    },
    [setWorking, openWorkingView],
  );

  const weldListTable = useWeldListTable(items, search, currentUser?.id, {
    onWeldListSelected: async (weldList) => {
      const currentState = weldList.workStatus?.name || "to-do";
      if (currentState === "to-do") {
        await startWeldList(weldList.id);
      } else {
        openWorkingView(weldList);
      }
    },
    onWeldListSetWorking: async (id) => await startWeldList(id),
  });

  const weldDataVerification = useWeldDataVerification({
    onWeldProcessed: (updatedWeld) => {
      // Reflete o weld atualizado no cache; o grid deriva da weld-list.
      queryClient.setQueryData<WeldListDto[]>(
        queryKeys.weldLists(),
        (current = []) => mergeWeldIntoWeldLists(current, updatedWeld),
      );
      setSelectedWeld(updatedWeld); // mantém foco no weld com dados atualizados
    },
    onError: setErrorMsg,
  });

  const handleWeldClick = useCallback(
    (weld: WeldWithContext) => {
      const currentState = weld.workStatus?.name || "to-do";

      // sempre mantém o último weld selecionado para ações auxiliares (ex.: WPS)
      setSelectedWeld(weld);

      if (currentState === "to-do") {
        weldDataVerification.startVerification(weld);
      }
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
    onError: setErrorMsg,
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
    window.open(API_ROUTES.documents.download(doc), "_blank");
  }, [selectedWeld, setErrorMsg]);

  const { cards, controlButtons } = useUIConfigurations(
    selectedWeld,
    null,
    {
      onNextClick: handleNextWorkflow,
      onWpsClick: handleWpsClick,
    },
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
