"use client";

import { memo } from "react";
import NavBar from "@components/layout/NavBar/NavBar";
import { Col, Container, Row } from "react-bootstrap";
import { WorkTable } from "@components/features/WorkTable";
import { columnsWeldList } from "@components/features/WorkTable/WorkTable.columns";
import { ErrorToast } from "@components/common/ErrorToast";
import { useWeldWorkflow } from "@/app/(factory)/weld/hooks";
import { UserDto, WeldListDto } from "@dtos";
import {
  TAB_TYPES,
  tabsAllWorking,
  TabType,
  WorkTabs,
} from "@components/features/WorkTabs";
import { WorkPanel } from "@components/features/WorkPanel";
import { ControlPanel } from "@components/features/ControlPanel";
import { WorkGrid } from "@components/features/WorkGrid";
import { FormModal } from "@components/layout/Modals/FormModal";

export interface WeldClientProps {
  initialItems: WeldListDto[];
  currentUser: UserDto | null;
  fetchError?: string;
}

const WeldClient = memo(function WeldClient(props: WeldClientProps) {
  const { initialItems, currentUser, fetchError } = props;

  const {
    state: { errorMsg, activeTab, search, setSearch, setErrorMsg },
    weldListTable,
    weldGrid,
    weldItems,
    cards,
    selectedWeld,
    controlButtons,
    setActiveTab,
    searchField,
    setSearchField,
    weldDataVerification,
  } = useWeldWorkflow({ initialItems, currentUser, fetchError });

  const showError = Boolean(errorMsg);

  return (
    <>
      <NavBar title="Welding" fixed={true} />
      <div
        className="d-flex justify-content-center align-items-center"
        style={{ height: "calc(100vh - var(--navbar-height))" }}
      >
        <Container fluid className="mx-4">
          <Row className="g-4">
            <Col md={5} className="d-flex flex-column gap-3">
              <WorkPanel cards={cards} hasSelection={!!selectedWeld} />
              <ControlPanel
                search={search}
                setSearch={setSearch}
                buttons={controlButtons}
                activeTab={activeTab}
                context="weld"
                searchField={searchField}
                setSearchField={setSearchField}
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
                  key="weldlist-table"
                  items={weldListTable.tableItems}
                  handleRowClick={weldListTable.handleRowClick}
                  columns={columnsWeldList}
                  rowStates={weldListTable.rowStates}
                  rowStateAccessor={weldListTable.rowStateAccessor}
                />
              ) : (
                <WorkGrid
                  key="weld-grid"
                  items={weldItems}
                  accessor="number"
                  handleItemClick={weldGrid.handleItemClick}
                  itemStates={weldGrid.itemStates}
                  itemStateAccessor={weldGrid.itemStateAccessor}
                  columns={3}
                  groupBy={(item) => item.spoolInfo.internalId}
                  renderGroupTitle={(groupItems, gi) => (
                    <div key={gi} className="text-white mb-3">
                      <h4>{groupItems[0]?.spoolInfo.internalId}</h4>
                    </div>
                  )}
                />
              )}
            </Col>
          </Row>
        </Container>
      </div>

      <FormModal
        showModal={weldDataVerification.showModal}
        title={weldDataVerification.modalTitle}
        fields={weldDataVerification.modalFields}
        values={weldDataVerification.formValues}
        loading={
          weldDataVerification.loading || weldDataVerification.isSubmitting
        }
        error={undefined}
        handleFieldChange={weldDataVerification.handleFieldChange}
        handleSubmit={weldDataVerification.handleContinue}
        handleCancel={weldDataVerification.handleCancel}
        submitText="Complete Weld"
        cancelText="Cancel"
      />

      <ErrorToast
        show={showError}
        message={errorMsg || ""}
        onClose={() => setErrorMsg(null)}
      />
    </>
  );
});

export default WeldClient;
