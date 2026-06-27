"use client";
import { CutListDto, UserDto } from "@dtos";
import NavBar from "@components/layout/NavBar/NavBar";
import { Col, Container, Row } from "react-bootstrap";
import { WorkTable } from "@components/features/WorkTable";
import {
  columnsCutList,
  columnsPipeLengthDto,
} from "@components/features/WorkTable/WorkTable.columns";
import { ComponentLabelModal, InputModal } from "@components/layout/Modals";
import { ErrorToast } from "@components/common/ErrorToast";
import { useCutWorkflow } from "./hooks/useCutWorkflow";
import { memo } from "react";
import { WorkPanel } from "@components/features/WorkPanel";
import { ControlPanel } from "@components/features/ControlPanel";
import {
  TAB_TYPES,
  tabsAllWorking,
  TabType,
  WorkTabs,
} from "@components/features/WorkTabs";

export interface CutClientProps {
  initialItems: CutListDto[];
  currentUser: UserDto | null;
  fetchError?: string;
}

const CutClient = memo(function CutClient(props: CutClientProps) {
  const { initialItems, currentUser, fetchError } = props;

  const {
    state: { errorMsg, activeTab, search, setSearch, setErrorMsg },
    modal: {
      inputShow,
      isEditing,
      inputValue,
      setInputValue,
      showCompletionModal,
      resetModalState,
      resetCompletionModal,
    },
    cutListTable,
    pipeLengthTable,
    isSubmitting,
    cards,
    selectedPipeLength,
    controlButtons,
    modalData,
    handleInputConfirm,
    handleCompletionModalConfirm,
    setActiveTab,
    searchField,
    setSearchField,
  } = useCutWorkflow({ initialItems, currentUser, fetchError });

  const showError = Boolean(errorMsg);

  return (
    <>
      <NavBar title="Cutting" fixed={true} />
      <div
        className="d-flex justify-content-center align-items-center"
        style={{ height: "calc(100vh - var(--navbar-height))" }}
      >
        <Container fluid className="mx-4">
          <Row className="g-4">
            <Col md={5} className="d-flex flex-column gap-3">
              <WorkPanel cards={cards} hasSelection={!!selectedPipeLength} />
              <ControlPanel
                search={search}
                setSearch={setSearch}
                buttons={controlButtons}
                searchField={searchField}
                setSearchField={setSearchField}
                activeTab={activeTab}
                context="cut"
              />
            </Col>
            <Col md={7} className="d-flex flex-column gap-3">
              <WorkTabs
                tabs={tabsAllWorking}
                activeTab={activeTab}
                setActiveTab={(tab: string) => setActiveTab(tab as TabType)}
              />
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
        inputType="text"
        isLoading={isSubmitting}
        confirmText={isEditing ? "Update" : "Confirm"}
        value={inputValue}
        onValueChange={setInputValue}
      />

      <ComponentLabelModal
        show={showCompletionModal}
        onHide={resetCompletionModal}
        onConfirm={handleCompletionModalConfirm}
        title="PIPE LENGTH"
        value={modalData?.value ?? ""}
        values={modalData?.values}
      />

      <ErrorToast
        show={showError}
        message={errorMsg || ""}
        onClose={() => setErrorMsg(null)}
      />
    </>
  );
});

export default CutClient;
