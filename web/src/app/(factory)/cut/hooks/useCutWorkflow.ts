import { useMemo } from "react";
import { useCutOperations } from "./useCutOperations";
import { useCutListTable } from "./useCutListTable";
import { usePipeLengthTable } from "./usePipeLengthTable";
import {
  extractPipeLengthsFromCutList,
  validateHeatNumber,
} from "../utils/cutUtils";
import { CutListDto, UserDto } from "@/dtos";
import { PipeLengthWithContext } from "@/interfaces";
import {
  columnsCutList,
  columnsPipeLengthDto,
} from "@components/features/WorkTable/WorkTable.columns";
import { TAB_TYPES } from "@components/features/WorkTabs";
import { filterBySearch, useModalState, useUIConfigurations } from "@/hooks";
import { cutButtonConfig } from "@components/features/ControlPanel";
import { cutCardConfigs } from "@components/features/WorkPanel/WorkPanel.cardConfigs";
import { cutCompletionModalConfig } from "@components/layout/Modals/ComponentLabelModal.valueConfig";
import { WS_EVENTS, WS_ROUTES } from "@/routes";
import {
  claimCutList,
  fetchCutLists,
  getCutListById,
  releaseCutList,
} from "@/lib/api";
import { queryKeys } from "@/lib/query/keys";
import { useWorkStage } from "@/features/work-stage/useWorkStage";
import type { WorkStageConfig } from "@/features/work-stage/types";

const cutStageConfig: WorkStageConfig<CutListDto> = {
  context: "cut",
  queryKey: queryKeys.cutLists(),
  fetchList: fetchCutLists,
  fetchById: getCutListById,
  claim: claimCutList,
  release: releaseCutList,
  ws: {
    route: WS_ROUTES.cutList,
    eventNames: [WS_EVENTS.stage.claimChanged, WS_EVENTS.stage.statusChanged],
  },
};

export interface UseCutWorkflowProps {
  initialItems: CutListDto[];
  currentUser: UserDto | null;
  fetchError?: string;
}

export const useCutWorkflow = ({
  initialItems,
  currentUser,
  fetchError,
}: UseCutWorkflowProps) => {
  const {
    items: cutLists,
    selectedDetail: selectedCutList,
    setSelectedId: setSelectedCutListId,
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
  } = useWorkStage<CutListDto>({ ...cutStageConfig, initialItems, fetchError });

  const workingPipeLengths = useMemo<PipeLengthWithContext[]>(() => {
    if (!selectedCutList) return [];
    return extractPipeLengthsFromCutList(selectedCutList);
  }, [selectedCutList]);

  const modal = useModalState<PipeLengthWithContext>();
  const {
    pendingItem,
    setInputValue,
    completedItem,
    setPendingItem,
    setIsEditing,
    setInputShow,
    setShowCompletionModal,
    setCompletedItem,
    resetModalState,
    resetCompletionModal,
  } = modal;

  const openCutList = (cutList: CutListDto) => {
    setSelectedCutListId(cutList.id);
    setActiveTab(TAB_TYPES.WORKING);
  };

  const startCutList = async (id: number): Promise<boolean> => {
    const updated = await claim(id);
    if (updated) {
      setActiveTab(TAB_TYPES.WORKING);
    }
    return Boolean(updated);
  };

  const refreshCutLists = () =>
    queryClient.invalidateQueries({ queryKey: queryKeys.cutLists() });

  const cutListSearchFunction = (
    items: CutListDto[],
    search: string,
    searchField: string,
  ) => filterBySearch(items, search, searchField, columnsCutList);
  const pipeLengthSearchFunction = (
    items: PipeLengthWithContext[],
    search: string,
    searchField: string,
  ) => filterBySearch(items, search, searchField, columnsPipeLengthDto);

  const cutListTable = useCutListTable(
    cutLists,
    search,
    currentUser?.id,
    { onCutListSelected: openCutList, onCutListClaim: startCutList },
    searchField,
    cutListSearchFunction,
  );

  const pipeLengthTable = usePipeLengthTable(
    workingPipeLengths,
    search,
    {
      onWorkingTransition: (item) => {
        setPendingItem(item);
        setIsEditing(false);
        setInputValue("");
        setInputShow(true);
      },
      onItemCompleted: (item) => {
        setCompletedItem(item);
        setShowCompletionModal(true);
      },
    },
    searchField,
    pipeLengthSearchFunction,
  );

  const selectedPipeLength =
    activeTab === TAB_TYPES.WORKING ? pipeLengthTable.selectedItem : null;

  const { startWork, finishWork, isSubmitting } = useCutOperations({
    onSuccess: () => {
      refreshCutLists();
      if (pendingItem) pipeLengthTable.proceedToWorking(pendingItem.id);
      resetModalState();
    },
    onError: setErrorMsg,
  });

  const handleInputConfirm = async (inputHeatNumber: string) => {
    if (!pendingItem || !validateHeatNumber(inputHeatNumber)) {
      setErrorMsg("Please enter a valid heat number");
      return;
    }
    await startWork(pendingItem, inputHeatNumber.trim());
  };

  const handleCompletionModalConfirm = async () => {
    if (!completedItem) return resetCompletionModal();
    await finishWork(completedItem);
    if (completedItem.id === selectedPipeLength?.id)
      pipeLengthTable.clearSelection();
    resetCompletionModal();
  };

  const handleNextClick = () => {
    if (activeTab === TAB_TYPES.ALL) return cutListTable.handleNextWorkflow();
    if (activeTab === TAB_TYPES.WORKING) {
      if (pipeLengthTable.areAllWorkingItemsFinished()) {
        setActiveTab(TAB_TYPES.ALL);
        setSelectedCutListId(null);
      } else {
        pipeLengthTable.handleNextWorkflow();
      }
    }
  };

  const { cards, controlButtons, modalData } = useUIConfigurations(
    selectedPipeLength,
    completedItem,
    { onNextClick: handleNextClick },
    {
      buttonConfig: cutButtonConfig,
      cardConfigs: cutCardConfigs,
      modalConfig: cutCompletionModalConfig,
    },
  );

  return {
    state: { errorMsg, activeTab, search, setSearch, setErrorMsg },
    modal,
    cutListTable,
    pipeLengthTable,
    selectedPipeLength,
    isSubmitting,
    cards,
    controlButtons,
    modalData,
    handleInputConfirm,
    handleCompletionModalConfirm,
    setActiveTab,
    searchField,
    setSearchField,
  };
};
