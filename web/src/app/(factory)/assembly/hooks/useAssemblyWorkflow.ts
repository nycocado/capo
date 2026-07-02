import { useCallback, useMemo } from "react";
import { useAssemblyMaterialVerification } from "./useAssemblyMaterialVerification";
import { usePDFViewer } from "./usePDFViewer";
import { AssemblyListDto, UserDto } from "@dtos";
import { TAB_TYPES } from "@components/features/WorkTabs";
import { columnsAssemblyList } from "@components/features/WorkTable/WorkTable.columns";
import { useJointGrid } from "./useJointGrid";
import { useStageListTable, useUIConfigurations } from "@hooks";
import { assemblyButtonConfig } from "@components/features/ControlPanel";
import { WS_EVENTS, WS_ROUTES } from "@/routes";
import {
  claimAssemblyList,
  fetchAssemblyLists,
  getAssemblyListById,
  releaseAssemblyList,
} from "@/lib/api";
import { queryKeys } from "@/lib/query/keys";
import { useWorkStage } from "@/features/work-stage/useWorkStage";
import type { WorkStageConfig } from "@/features/work-stage/types";

const assemblyStageConfig: WorkStageConfig<AssemblyListDto> = {
  context: "assembly",
  queryKey: queryKeys.assemblyLists(),
  fetchList: fetchAssemblyLists,
  fetchById: getAssemblyListById,
  claim: claimAssemblyList,
  release: releaseAssemblyList,
  ws: {
    route: WS_ROUTES.assemblyList,
    eventNames: [WS_EVENTS.stage.claimChanged, WS_EVENTS.stage.statusChanged],
  },
};

export interface UseAssemblyWorkflowProps {
  initialItems: AssemblyListDto[];
  currentUser: UserDto | null;
  fetchError?: string;
}

export const useAssemblyWorkflow = ({
  initialItems,
  currentUser,
  fetchError,
}: UseAssemblyWorkflowProps) => {
  const {
    items,
    selectedDetail: selectedAssemblyList,
    setSelectedId: setSelectedAssemblyListId,
    activeTab,
    setActiveTab,
    search,
    setSearch,
    searchField,
    setSearchField,
    errorMsg,
    setErrorMsg,
    claim,
  } = useWorkStage<AssemblyListDto>({
    ...assemblyStageConfig,
    initialItems,
    fetchError,
  });

  const openWorkingView = useCallback(
    (assemblyList: AssemblyListDto) => {
      setSelectedAssemblyListId(assemblyList.id);
      setActiveTab(TAB_TYPES.WORKING);
    },
    [setSelectedAssemblyListId, setActiveTab],
  );

  const startAssemblyList = useCallback(
    async (id: number): Promise<boolean> => {
      const updated = await claim(id);
      if (updated) setActiveTab(TAB_TYPES.WORKING);
      return Boolean(updated);
    },
    [claim, setActiveTab],
  );

  const materialVerification = useAssemblyMaterialVerification();

  const assemblyListTable = useStageListTable<AssemblyListDto>({
    items,
    search,
    searchField,
    columns: columnsAssemblyList,
    currentUserId: currentUser?.id,
    callbacks: {
      onSelected: async (assemblyList) => {
        try {
          const detail = await getAssemblyListById(assemblyList.id);
          await materialVerification.startVerification(detail, () => {
            if (detail.progress === "done") {
              openWorkingView(detail);
            } else {
              void startAssemblyList(detail.id);
            }
          });
        } catch {
          setErrorMsg("Failed to start material verification");
        }
      },
      onClaim: async (id) => await startAssemblyList(id),
    },
  });

  const weldGrid = useJointGrid({
    assemblyList: selectedAssemblyList ?? null,
    search: activeTab === TAB_TYPES.WORKING ? "" : search,
    onAllFinished: () => {
      setSelectedAssemblyListId(null);
      setActiveTab(TAB_TYPES.ALL);
    },
    onError: setErrorMsg,
  });

  const handleNextWorkflow = useCallback(async () => {
    if (activeTab === TAB_TYPES.ALL) {
      assemblyListTable.handleNextWorkflow();
    } else if (activeTab === TAB_TYPES.WORKING) {
      await weldGrid.handleNextWorkflow();
    }
  }, [activeTab, assemblyListTable, weldGrid]);

  const {
    pdfFile,
    loading: pdfLoading,
    error: pdfError,
  } = usePDFViewer(
    selectedAssemblyList?.isometric?.document ?? null,
    "isometric",
  );

  const handleIsometricClick = useCallback(() => {
    if (pdfFile) {
      window.open(pdfFile, "_blank");
    } else {
      setErrorMsg("No PDF loaded");
    }
  }, [pdfFile, setErrorMsg]);

  const handleListClick = useCallback(async () => {
    if (!selectedAssemblyList) {
      setErrorMsg("No assembly list selected");
      return;
    }
    try {
      await materialVerification.openMaterialsConsultation(
        selectedAssemblyList,
      );
    } catch {
      setErrorMsg("Failed to load materials list");
    }
  }, [selectedAssemblyList, materialVerification, setErrorMsg]);

  const { controlButtons } = useUIConfigurations(
    null,
    null,
    {
      onIsometricClick: handleIsometricClick,
      onListClick: handleListClick,
      onNextClick: handleNextWorkflow,
    },
    { buttonConfig: assemblyButtonConfig },
  );

  const selectedAssemblyListOrNull = selectedAssemblyList ?? null;

  return {
    state: { errorMsg, activeTab, search, setSearch, setErrorMsg },
    assemblyListTable,
    materialVerification,
    weldGrid,
    weldItems: weldGrid.weldItems,
    selectedAssemblyList: selectedAssemblyListOrNull,
    pdfFile,
    pdfLoading,
    pdfError,
    controlButtons,
    setActiveTab,
    searchField,
    setSearchField,
  };
};
