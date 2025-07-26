import { useCallback, useState, useEffect } from "react";
import { useAssemblyListTable } from "./useAssemblyListTable";
import { useAssemblyMaterialVerification } from "./useAssemblyMaterialVerification";
import { usePDFViewer } from "./usePDFViewer";
import { AssemblyListDto, UserDto } from "@/dtos";
import { TAB_TYPES } from "@components/features/WorkTabs";
import { getAvailableSheets } from "../utils/assemblyUtils";
import { useJointGrid } from "./useJointGrid";
import { getSearchFields } from "@components/features/ControlPanel/ControlPanel.searchConfig";
import {
  useUIConfigurations,
  useWebSocket,
  useWorkClientState,
  useWorkListOperations,
} from "@/hooks";
import { API_ROUTES, WS_EVENTS, WS_ROUTES } from "@/routes";
import { assemblyButtonConfig } from "@components/features/ControlPanel";

export interface UseAssemblyWorkflowProps {
  initialItems: AssemblyListDto[];
  currentUser: UserDto | null;
  fetchError?: string;
}

// Main hook for assembly workflow
export const useAssemblyWorkflow = ({
  initialItems,
  currentUser,
  fetchError,
}: UseAssemblyWorkflowProps) => {
  // Client state management
  const state = useWorkClientState<AssemblyListDto, AssemblyListDto>(
    initialItems,
    fetchError,
  );
  const {
    errorMsg,
    setErrorMsg,
    items, // ← Main items array
    setItems,
    setWorkingItems,
    activeTab,
    setActiveTab,
    search,
    setSearch,
  } = state;

  // Additional state for assembly workflow
  const [selectedAssemblyList, setSelectedAssemblyList] =
    useState<AssemblyListDto | null>(null);
  const [selectedSheetNumber, setSelectedSheetNumber] = useState<number | null>(
    null,
  );

  // Search field state
  const [searchField, setSearchField] = useState<string>("id");

  // List modal states for readonly consultation
  const [showListModal, setShowListModal] = useState(false);
  const [listCurrentStep, setListCurrentStep] = useState<
    "pipeLength" | "fitting"
  >("pipeLength");
  const [listPipeLengths, setListPipeLengths] = useState<any[]>([]);
  const [listFittings, setListFittings] = useState<any[]>([]);

  const handleAssemblyListCreate = useCallback(
    (newAssemblyList: AssemblyListDto) => {
      // Update MAIN items array (what's displayed in table)
      setItems((prev) => [...prev, newAssemblyList]);

      // Only add to workingItems if it's actually in working status
      const workStatus = newAssemblyList.workStatus?.name;
      if (workStatus === "working") {
        setWorkingItems((prev) => [...prev, newAssemblyList]);
      }
    },
    [setItems, setWorkingItems],
  );

  // Handle assembly list update from websocket
  const handleAssemblyListUpdate = useCallback(
    (updatedAssemblyList: AssemblyListDto) => {
      // Update MAIN items array (what's displayed in table)
      setItems((prev) =>
        prev.map((al) =>
          al.id === updatedAssemblyList.id ? updatedAssemblyList : al,
        ),
      );

      // Also update working items for consistency
      setWorkingItems((prev) =>
        prev.map((al) =>
          al.id === updatedAssemblyList.id ? updatedAssemblyList : al,
        ),
      );

      // Update selected assembly list if it's the same
      setSelectedAssemblyList((prev) =>
        prev && prev.id === updatedAssemblyList.id ? updatedAssemblyList : prev,
      );
    },
    [setItems, setWorkingItems],
  );

  // WebSocket connection
  useWebSocket({
    wsRoute: WS_ROUTES.assemblyList,
    eventHandlers: [
      {
        eventName: WS_EVENTS.assemblyList.updateWorkStatus,
        handler: handleAssemblyListUpdate,
      },
      {
        eventName: WS_EVENTS.assemblyList.create,
        handler: handleAssemblyListCreate,
      },
    ],
    enabled: true,
    connectionName: "AssemblyList",
  });

  // Assembly list operations
  const { setWorking } = useWorkListOperations<AssemblyListDto>(
    API_ROUTES.assemblyLists.setWorking,
    "setting assembly list to working",
    {
      onSuccess: (updated) => {
        // Update MAIN items array (what's displayed in table)
        setItems((prev) =>
          prev.map((al) => (al.id === updated.id ? updated : al)),
        );

        // Also update working items for consistency
        setWorkingItems((prev) =>
          prev.map((al) => (al.id === updated.id ? updated : al)),
        );

        setSelectedAssemblyList(updated);
        const firstSheet = updated.isometric?.sheets?.[0];
        if (firstSheet) {
          setSelectedSheetNumber(firstSheet.number);
        }
        setActiveTab(TAB_TYPES.WORKING);
      },
      onError: setErrorMsg,
    },
  );

  // Material verification
  const materialVerification = useAssemblyMaterialVerification();

  // Assembly list table (ALL tab) - FIXED: using items instead of workingItems
  const assemblyListTable = useAssemblyListTable(
    items, // ✅ Using main items array instead of workingItems
    search,
    currentUser?.id,
    {
      onAssemblyListSelected: async (assemblyList: AssemblyListDto) => {
        // Always start material verification flow regardless of status
        try {
          await materialVerification.startVerification(assemblyList, () => {
            const currentState = assemblyList.workStatus?.name || "to-do";
            if (currentState === "to-do") {
              setWorking(assemblyList.id);
            } else {
              setSelectedAssemblyList(assemblyList);
              const firstSheet = assemblyList.isometric?.sheets?.[0];
              if (firstSheet) {
                setSelectedSheetNumber(firstSheet.number);
              }
              setActiveTab(TAB_TYPES.WORKING);
            }
          });
        } catch (error) {
          setErrorMsg("Failed to start material verification");
        }
      },
      onAssemblyListSetWorking: async (id) => await setWorking(id),
    },
  );

  // Joint operations
  const weldGrid = useJointGrid({
    assemblyList: selectedAssemblyList,
    sheetNumber: selectedSheetNumber,
    search: activeTab === TAB_TYPES.WORKING ? "" : search, // Sem busca no working
    onAllFinished: () => {
      setSelectedAssemblyList(null);
      setSelectedSheetNumber(null);
      setActiveTab(TAB_TYPES.ALL);
    },
    onError: setErrorMsg,
  });

  // Handle next workflow - corrected functionality
  const handleNextWorkflow = useCallback(async () => {
    if (activeTab === TAB_TYPES.ALL) {
      // Use the table's own next workflow logic
      assemblyListTable.handleNextWorkflow();
    } else if (activeTab === TAB_TYPES.WORKING) {
      await weldGrid.handleNextWorkflow();
    }
  }, [activeTab, assemblyListTable, weldGrid]);

  // Get available sheets
  getAvailableSheets(selectedAssemblyList);

  // Current sheet for PDF viewer
  const currentSheet =
    selectedAssemblyList && selectedSheetNumber !== null
      ? selectedAssemblyList.isometric?.sheets?.find(
          (s) => s.number === selectedSheetNumber,
        )
      : null;

  // PDF viewer
  const {
    pdfFile,
    loading: pdfLoading,
    error: pdfError,
  } = usePDFViewer(currentSheet?.document || null);

  // Handle isometric viewer - send raw file to browser
  const handleIsometricClick = useCallback(() => {
    if (pdfFile) {
      // pdfFile is already a blob URL from usePDFViewer, just open it
      window.open(pdfFile, "_blank");
    } else {
      setErrorMsg("No PDF loaded");
    }
  }, [pdfFile, setErrorMsg]);

  // Handle list click - show materials in readonly mode
  const handleListClick = useCallback(async () => {
    if (!selectedAssemblyList) {
      setErrorMsg("No assembly list selected");
      return;
    }

    try {
      // Use consultation mode method
      await materialVerification.openMaterialsConsultation(
        selectedAssemblyList,
      );
    } catch (error) {
      setErrorMsg("Failed to load materials list");
    }
  }, [selectedAssemblyList, materialVerification, setErrorMsg]);

  // Handlers for list modal navigation
  const handleListNext = useCallback(() => {
    setListCurrentStep("fitting");
  }, []);

  const handleListPrevious = useCallback(() => {
    setListCurrentStep("pipeLength");
  }, []);

  const handleListCancel = useCallback(() => {
    setShowListModal(false);
    setListCurrentStep("pipeLength");
  }, []);

  // UI configurations - with restored isometric functionality
  const { controlButtons } = useUIConfigurations(
    null,
    null,
    {
      onIsometricClick: handleIsometricClick,
      onListClick: handleListClick,
      onNextClick: handleNextWorkflow,
    },
    {
      buttonConfig: assemblyButtonConfig,
    },
  );

  // Initialize search field based on active tab
  useEffect(() => {
    const searchFields = getSearchFields("assembly", activeTab);
    const defaultSearchField = searchFields[0]?.id || "id";
    setSearchField(defaultSearchField);
  }, [activeTab]);

  return {
    // State - what AssemblyClient uses
    state: {
      errorMsg,
      activeTab,
      search,
      setSearch,
      setErrorMsg,
    },

    // Table
    assemblyListTable,

    // Features
    materialVerification,

    // Operations
    weldGrid, // or rename to weldGrid

    // Data
    weldItems: weldGrid.weldItems,
    selectedAssemblyList,
    selectedSheetNumber,

    // PDF
    pdfFile,
    pdfLoading,
    pdfError,

    // UI - only controlButtons
    controlButtons,

    // Handlers
    setActiveTab,

    // Search
    searchField,
    setSearchField,

    // Modal for readonly consultation
    showListModal,
    setShowListModal,
    listCurrentStep,
    setListCurrentStep,
    listPipeLengths,
    setListPipeLengths,
    listFittings,
    setListFittings,

    // Handlers for list modal navigation
    handleListNext,
    handleListPrevious,
    handleListCancel,
  };
};
