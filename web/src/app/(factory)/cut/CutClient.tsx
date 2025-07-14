'use client';
import { CutListDto, PipeLengthDto, UserDto } from '@/dtos';
import { useCallback, useState } from 'react';
import {
  TAB_TYPES,
  tabsAllWorking,
  TabType,
  WorkTabs,
} from '@components/features/factory/WorkTabs';
import {
  useCutListOperations,
  useCutListTable,
  useCutOperations,
  usePipeLengthSelection,
  usePipeLengthTable,
  useUIConfigurations,
  useWebSocketCutList,
} from '@/app/(factory)/cut/hooks';
import {
  enrichPipeLengths,
  extractPipeLengthsFromCutList,
  validateHeatNumber,
} from '@/app/(factory)/cut/utils/cutClientUtils';
import { WORK_STATES } from '@/app/(factory)/cut/constants';
import NavBar from '@components/layout/NavBar/NavBar';
import { Col, Container, Row } from 'react-bootstrap';
import { WorkPanel } from '@components/features/factory/WorkPanel';
import { ControlPanel } from '@components/features/factory/ControlPanel';
import { WorkTable } from '@components/features/WorkTable';
import {
  columnsCutList,
  columnsPipeLengthDto,
} from '@components/features/WorkTable/WorkTable.columns';
import { ComponentLabelModal, InputModal } from '@components/layout/Modals';
import { ErrorToast } from '@components/common/ErrorToast';

export interface CutClientProps {
  initialItems: CutListDto[];
  currentUser: UserDto | null;
  fetchError?: string;
}

// Main state management hook
const useCutClientState = (initialItems: CutListDto[], fetchError?: string) => {
  const [errorMsg, setErrorMsg] = useState<string | null>(fetchError ?? null);
  const [cutLists, setCutLists] = useState<CutListDto[]>(initialItems);
  const [workingPipeLengths, setWorkingPipeLengths] = useState<PipeLengthDto[]>(
    [],
  );
  const [activeTab, setActiveTab] = useState<TabType>(TAB_TYPES.ALL);
  const [search, setSearch] = useState<string>('');

  return {
    errorMsg,
    setErrorMsg,
    cutLists,
    setCutLists,
    workingPipeLengths,
    setWorkingPipeLengths,
    activeTab,
    setActiveTab,
    search,
    setSearch,
  };
};

// Modal state management hook
const useModalState = () => {
  const [inputShow, setInputShow] = useState(false);
  const [pendingItem, setPendingItem] = useState<PipeLengthDto | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [inputValue, setInputValue] = useState<string>('');
  const [showCompletionModal, setShowCompletionModal] = useState(false);
  const [completedItem, setCompletedItem] = useState<PipeLengthDto | null>(
    null,
  );

  const resetModalState = () => {
    setInputShow(false);
    setPendingItem(null);
    setIsEditing(false);
    setInputValue('');
  };

  const resetCompletionModal = () => {
    setShowCompletionModal(false);
    setCompletedItem(null);
  };

  return {
    inputShow,
    pendingItem,
    isEditing,
    inputValue,
    setInputValue,
    showCompletionModal,
    completedItem,
    setPendingItem,
    setIsEditing,
    setInputShow,
    setShowCompletionModal,
    setCompletedItem,
    resetModalState,
    resetCompletionModal,
  };
};

export default function CutClient(props: CutClientProps) {
  const { initialItems, currentUser, fetchError } = props;

  const {
    errorMsg,
    setErrorMsg,
    cutLists,
    setCutLists,
    workingPipeLengths,
    setWorkingPipeLengths,
    activeTab,
    setActiveTab,
    search,
    setSearch,
  } = useCutClientState(initialItems, fetchError);

  const {
    inputShow,
    pendingItem,
    isEditing,
    inputValue,
    setInputValue,
    showCompletionModal,
    completedItem,
    setPendingItem,
    setIsEditing,
    setInputShow,
    setShowCompletionModal,
    setCompletedItem,
    resetModalState,
    resetCompletionModal,
  } = useModalState();

  // WebSocket para atualizações em tempo real dos CutLists
  const handleCutListUpdate = useCallback(
    (updatedCutList: CutListDto) => {
      setCutLists((prevCutLists) => {
        return prevCutLists.map((cutList) =>
          cutList.id === updatedCutList.id ? updatedCutList : cutList,
        );
      });

      // Atualizar pipeLengths se necessário - usando ref para evitar dependências
      if (activeTab === TAB_TYPES.WORKING) {
        setWorkingPipeLengths((prevPipeLengths) => {
          // Verificar se algum pipe length pertence ao cutList atualizado
          const belongsToUpdatedCutList = prevPipeLengths.some((pl) => {
            const newPipeLengths =
              extractPipeLengthsFromCutList(updatedCutList);
            return newPipeLengths.some((newPl) => newPl.id === pl.id);
          });

          if (belongsToUpdatedCutList) {
            return extractPipeLengthsFromCutList(updatedCutList);
          }

          return prevPipeLengths;
        });
      }
    },
    [], // Sem dependências para evitar reconexões
  );

  // Configurar WebSocket
  const { isConnected } = useWebSocketCutList({
    onCutListUpdate: handleCutListUpdate,
    enabled: true,
  });

  const updatePipeLength = (updatedPipeLength: PipeLengthDto) => {
    setWorkingPipeLengths((prev) =>
      prev.map((pl) =>
        pl.id === updatedPipeLength.id ? updatedPipeLength : pl,
      ),
    );
  };

  // Cut list operations (set-working)
  const { setWorking } = useCutListOperations({
    onSuccess: (updatedCutList) => {
      // Update the cut list in state
      setCutLists((prev) =>
        prev.map((cl) => (cl.id === updatedCutList.id ? updatedCutList : cl)),
      );
      // Navigate to working tab with the updated cut list
      setWorkingPipeLengths(extractPipeLengthsFromCutList(updatedCutList));
      setActiveTab(TAB_TYPES.WORKING);
    },
    onError: (error) => setErrorMsg(error),
  });

  // Separate table hooks for each type
  const cutListTable = useCutListTable(cutLists, search, currentUser?.id, {
    onCutListSelected: (cutList: CutListDto) => {
      setWorkingPipeLengths(extractPipeLengthsFromCutList(cutList));
      setActiveTab(TAB_TYPES.WORKING);
    },
    onCutListSetWorking: async (cutListId: number) => {
      return await setWorking(cutListId);
    },
  });

  const pipeLengthTable = usePipeLengthTable(
    enrichPipeLengths(workingPipeLengths, cutLists),
    search,
    {
      onWorkingTransition: (item: PipeLengthDto) => {
        setPendingItem(item);
        setIsEditing(false);
        setInputValue('');
        setInputShow(true);
      },
      onItemCompleted: (item: PipeLengthDto) => {
        setCompletedItem(item);
        setShowCompletionModal(true);
      },
    },
  );

  const selectedPipeLength =
    activeTab === TAB_TYPES.WORKING ? pipeLengthTable.selectedItem : null;

  // API operations
  const { startWork, finishWork, editHeatNumber, isSubmitting } =
    useCutOperations({
      onSuccess: (updatedItem) => {
        updatePipeLength(updatedItem);
        if (!isEditing && pendingItem) {
          pipeLengthTable.proceedToWorking(pendingItem.id);
        }
        resetModalState();
      },
      onError: (error) => setErrorMsg(error),
    });

  // Modal handlers
  const handleInputConfirm = async (inputHeatNumber: string) => {
    if (!pendingItem) return;

    if (!validateHeatNumber(inputHeatNumber)) {
      setErrorMsg('Please enter a valid heat number');
      return;
    }

    const heatNumber = parseInt(inputHeatNumber);

    if (isEditing) {
      await editHeatNumber(pendingItem, heatNumber);
    } else {
      await startWork(pendingItem, heatNumber);
    }
  };

  const handleHeatNumberEdit = () => {
    if (!selectedPipeLength || activeTab === TAB_TYPES.ALL) return;

    const currentHeatNumber = selectedPipeLength.heatNumber?.toString() || '';
    setPendingItem(selectedPipeLength);
    setIsEditing(true);
    setInputValue(currentHeatNumber);
    setInputShow(true);
  };

  const handleCompletionModalConfirm = async () => {
    if (!completedItem) {
      resetCompletionModal();
      return;
    }

    await finishWork(completedItem);
    resetCompletionModal();
  };

  // Next button handler
  const handleNextClick = () => {
    if (activeTab === TAB_TYPES.ALL) {
      cutListTable.handleNextWorkflow();
      return;
    }

    if (activeTab === TAB_TYPES.WORKING) {
      if (pipeLengthTable.areAllWorkingItemsFinished()) {
        setActiveTab(TAB_TYPES.ALL);
        setWorkingPipeLengths([]);
      } else {
        pipeLengthTable.handleNextWorkflow();
      }
    }
  };

  // UI configurations
  const { enrichedSelectedItem } = usePipeLengthSelection(
    selectedPipeLength,
    cutLists,
    activeTab,
  );

  const canEditHeatNumber = Boolean(
    selectedPipeLength &&
      activeTab === TAB_TYPES.WORKING &&
      (pipeLengthTable.rowStateAccessor(selectedPipeLength) ===
        WORK_STATES.WORKING ||
        pipeLengthTable.rowStateAccessor(selectedPipeLength) ===
          WORK_STATES.FINISHED),
  );

  const { cards, controlButtons, modalData } = useUIConfigurations(
    enrichedSelectedItem,
    completedItem,
    canEditHeatNumber,
    {
      onHeatNumberEdit: handleHeatNumberEdit,
      onNextClick: handleNextClick,
    },
  );

  const showError = Boolean(errorMsg);

  return (
    <>
      <NavBar title="Cutting" fixed={true} />
      <div
        className="d-flex justify-content-center align-items-center"
        style={{ height: 'calc(100vh - 56px)' }}
      >
        <Container fluid className="mx-4">
          <Row className="g-4">
            <Col md={5} className="d-flex flex-column gap-3">
              <WorkPanel cards={cards} />
              <ControlPanel
                search={search}
                setSearch={setSearch}
                buttons={controlButtons}
                tag="PIPL"
              />
            </Col>
            <Col md={7} className="d-flex flex-column gap-3">
              <WorkTabs
                tabs={tabsAllWorking}
                activeTab={activeTab}
                setActiveTab={(tab: string) => setActiveTab(tab as TabType)}
              />
              {/* Render specific table based on active tab */}
              {activeTab === TAB_TYPES.ALL ? (
                <WorkTable
                  key="cutlist-table"
                  items={cutListTable.tableItems}
                  handleRowClick={cutListTable.handleRowClick}
                  columns={columnsCutList}
                  rowStates={cutListTable.rowStates}
                  rowStateAccessor={cutListTable.rowStateAccessor}
                />
              ) : (
                <WorkTable
                  key="pipelength-table"
                  items={pipeLengthTable.tableItems}
                  handleRowClick={pipeLengthTable.handleRowClick}
                  columns={columnsPipeLengthDto}
                  rowStates={pipeLengthTable.rowStates}
                  rowStateAccessor={pipeLengthTable.rowStateAccessor}
                />
              )}
            </Col>
          </Row>
        </Container>
      </div>

      <InputModal
        show={inputShow}
        onHide={resetModalState}
        onConfirm={handleInputConfirm}
        title="Heat Number"
        inputType="number"
        isLoading={isSubmitting}
        confirmText={isEditing ? 'Update' : 'Confirm'}
        value={inputValue}
        onValueChange={setInputValue}
      />

      <ComponentLabelModal
        show={showCompletionModal}
        onHide={resetCompletionModal}
        onConfirm={handleCompletionModalConfirm}
        title="PIPE LENGTH"
        value={modalData.value}
        values={modalData.values}
      />

      <ErrorToast
        show={showError}
        message={errorMsg || ''}
        onClose={() => setErrorMsg(null)}
      />
    </>
  );
}
