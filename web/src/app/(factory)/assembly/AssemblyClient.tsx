"use client";

import NavBar from "@components/layout/NavBar/NavBar";
import {Col, Container, Row} from "react-bootstrap";
import {useState} from "react";
import {assemblyButtonConfig} from "@components/features/factory/ControlPanel/ControlPanel.buttonConfig";
import {ControlPanel} from "@components/features/factory/ControlPanel";
import {tabsAllWorking, WorkTabs} from "@components/features/factory/WorkTabs";
import {WorkGrid} from "@components/features/factory/WorkGrid";
import {AssemblyClientProps} from "@/app/(factory)/assembly/AssemblyClient.types";
import {WorkTable} from "@components/features/WorkTable";
import {useAssemblyTable} from "./useAssemblyTable";
import PDFViewer from "@components/features/PDFViewer";
import {usePDFViewer} from "./usePDFViewer";
import {columnsAssembly} from "@components/features/WorkTable/WorkTable.columns";

export type AssemblyRow = {
    isoId: string;
    internalId: string;
    sheetNumber: number;
    revId: number;
    spoolId: number;
    spoolInternalId: string;
    weldCount: number;
    spools: {
        id: number;
        internalId: string;
        welds: { id: number }[];
    }[];
};

function AssemblyClient({initialItems}: AssemblyClientProps) {
    const [activeTab, setActiveTab] = useState<'all' | 'working'>('all');
    const [search, setSearch] = useState<string>('');
    const {isometricItems, selectedIso, handleSelectIso} = useAssemblyTable(initialItems);
    const [sheetNumber, setSheetNumber] = useState<number | null>(null);

    const revId = selectedIso && sheetNumber != null
        ? selectedIso.sheets.find(s => s.number === sheetNumber)?.revId || 0
        : null;

    const {pdfFile, loading, error} = usePDFViewer(revId);

    const assemblyRows: AssemblyRow[] = isometricItems.flatMap(item =>
        item.sheets.flatMap(sheet =>
            sheet.spools.map(spool => ({
                isoId: item.id,
                internalId: item.internalId,
                sheetNumber: sheet.number,
                revId: sheet.revId,
                spoolId: spool.id,
                spoolInternalId: spool.internalId,
                weldCount: spool.welds.length,
                spools: sheet.spools
            }))
        )
    );

    const handleSelectRow = (row: AssemblyRow) => {
        const iso = isometricItems.find(i => i.id === row.isoId)!;
        handleSelectIso(iso);
        setSheetNumber(row.sheetNumber);
        setActiveTab('working');
    };

    const weldItems = selectedIso && sheetNumber != null
        ? selectedIso.sheets.find(s => s.number === sheetNumber)?.spools.flatMap(spool =>
        spool.welds.map(weld => ({
            ...weld,
            spoolInternalId: spool.internalId
        }))
    ) || []
        : [];

    const controlButtons = assemblyButtonConfig(
        {
            onIsometricClick: () => {
            },
            onListClick: () => {
            },
            onNoteClick: () => {
            },
            onReportClick: () => {
            },
            onNextClick: () => {
            }
        }
    )

    return (
        <>
            <NavBar title="Assembling"/>
            <div
                className="d-flex justify-content-center align-items-center"
                style={{height: 'calc(100vh - 56px)'}}
            >
                <Container fluid className="mx-4">
                    <Row className="g-4">
                        <Col md={8} className="d-flex flex-column gap-3">
                            <PDFViewer pdfFile={pdfFile} loading={loading} error={error}/>
                            <ControlPanel search={search} setSearch={setSearch} buttons={controlButtons} tag="ISO"/>
                        </Col>
                        <Col md={4} className="d-flex flex-column gap-3">
                            <WorkTabs
                                tabs={tabsAllWorking}
                                activeTab={activeTab}
                                setActiveTab={(tab: string) => setActiveTab(tab as 'all' | 'working')}
                            />
                            {activeTab === 'all' ? (
                                <WorkTable
                                    items={assemblyRows}
                                    columns={columnsAssembly}
                                    handleRowClick={row => handleSelectRow(row)}
                                    defaultSortColumn="internalId"
                                    hover
                                />
                            ) : (
                                <WorkGrid
                                    items={weldItems}
                                    accessor={item => `W.${item.id}`}
                                    handleItemClick={item => console.log('Weld click:', item)}
                                    columns={3}
                                    groupBy={item => item.spoolInternalId}
                                    renderGroupTitle={(groupItems, gi) => (
                                        <div key={gi} className="text-white mb-3">
                                            <h4>{groupItems[0].spoolInternalId}</h4>
                                        </div>
                                    )}
                                />
                            )}
                        </Col>
                    </Row>
                </Container>
            </div>
        </>
    )
}

export default AssemblyClient;
