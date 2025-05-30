import {useState, useMemo, useReducer, useCallback, useEffect} from 'react';
import {Weld} from '@models/weld.interface';
import {IsoItem, SheetSpools, SpoolData, WeldRow, WeldItemWithSpool} from './WeldClient.types';
import {useFormModal} from './useFormModal';
import {useWeldOperations} from './useWeldOperations';

type WeldRowState = 'initial' | 'working' | 'finished';
type WeldItemState = 'initial' | 'finished';

type WeldAction =
    | { type: 'setRowWorking'; rowKey: string }
    | { type: 'setRowFinished'; rowKey: string }
    | { type: 'setWeldFinished'; weldId: number; finished: boolean }
    | { type: 'updateWeldData'; weldId: number; filler?: any; wps?: any }
    | { type: 'selectWeld'; weld: WeldItemWithSpool | null };

interface WeldStateManagement {
    rowStates: Record<string, WeldRowState>;
    weldStates: Record<number, WeldItemState>;
    updatedWelds: Record<number, { filler?: any; wps?: any }>;
    selectedWeldId: number | null;
}

interface UseWeldTableCallbacks {
    onWeldProcessed?: (weldId: number) => void;
    onError?: (error: string) => void;
}

const weldReducer = (state: WeldStateManagement, action: WeldAction): WeldStateManagement => {
    switch (action.type) {
        case 'setRowWorking': {
            const hasWorkingRow = Object.values(state.rowStates).some(s => s === 'working');
            if (hasWorkingRow && state.rowStates[action.rowKey] !== 'working') {
                return state;
            }
            return {
                ...state,
                rowStates: {
                    ...state.rowStates,
                    [action.rowKey]: 'working'
                }
            };
        }
        case 'setRowFinished': {
            return {
                ...state,
                rowStates: {
                    ...state.rowStates,
                    [action.rowKey]: 'finished'
                }
            };
        }
        case 'setWeldFinished': {
            return {
                ...state,
                weldStates: {
                    ...state.weldStates,
                    [action.weldId]: action.finished ? 'finished' : 'initial'
                }
            };
        }
        case 'updateWeldData': {
            return {
                ...state,
                updatedWelds: {
                    ...state.updatedWelds,
                    [action.weldId]: {
                        filler: action.filler,
                        wps: action.wps
                    }
                }
            };
        }
        case 'selectWeld': {
            return {
                ...state,
                selectedWeldId: action.weld?.id || null
            };
        }
        default:
            return state;
    }
};

const generateRowKey = (spoolId: number, isoId: string, sheetNumber: number): string =>
    `${spoolId}-${isoId}-${sheetNumber}`;

const sortFinishedLast = (rows: WeldRow[], movedRowKeys: string[]): WeldRow[] => {
    return [...rows].sort((a, b) => {
        const aRowKey = generateRowKey(a.spoolId, a.isoId, a.sheetNumber);
        const bRowKey = generateRowKey(b.spoolId, b.isoId, b.sheetNumber);
        const aMoved = movedRowKeys.includes(aRowKey);
        const bMoved = movedRowKeys.includes(bRowKey);

        if (aMoved && !bMoved) return 1;
        if (!aMoved && bMoved) return -1;
        return 0;
    });
};

const filterBySearch = (rows: WeldRow[], search: string): WeldRow[] => {
    if (!search.trim()) return rows;

    const searchLower = search.toLowerCase();
    return rows.filter(row =>
        row.spoolInternalId.toLowerCase().includes(searchLower) ||
        row.isoInternalId.toLowerCase().includes(searchLower) ||
        row.sheetNumber.toString().includes(searchLower)
    );
};

export function useWeldTable(initialWeldItems: Weld[], callbacks?: UseWeldTableCallbacks) {
    // UI State
    const [activeTab, setActiveTab] = useState<'all' | 'working'>('all');
    const [search, setSearch] = useState<string>('');
    const [selectedSpool, setSelectedSpool] = useState<number | null>(null);
    const [selectedIso, setSelectedIso] = useState<IsoItem | null>(null);
    const [sheetNumber, setSheetNumber] = useState<number | null>(null);
    const [movedRowKeys, setMovedRowKeys] = useState<string[]>([]);

    // State management
    const [stateManagement, dispatch] = useReducer(weldReducer, {
        rowStates: {},
        weldStates: {},
        updatedWelds: {},
        selectedWeldId: null
    });

    // Weld operations hook
    const { processWeld, editWps, editFillerMaterial, isSubmitting } = useWeldOperations({
        onSuccess: (weldId, wpsData, fillerData) => {
            dispatch({
                type: 'updateWeldData',
                weldId,
                filler: fillerData,
                wps: wpsData
            });

            dispatch({
                type: 'setWeldFinished',
                weldId: weldId,
                finished: true
            });

            callbacks?.onWeldProcessed?.(weldId);
        },
        onError: (error) => {
            callbacks?.onError?.(error);
        }
    });

    // Form modal integration
    const formModal = useFormModal({
        processWeld,
        editWps,
        editFillerMaterial,
        onError: callbacks?.onError
    });

    // Build isometric items
    const isometricItems = useMemo(() => {
        const spoolsMap = buildSpoolsMap(initialWeldItems, stateManagement.updatedWelds);
        const hierarchyMap = buildHierarchyMap(initialWeldItems);
        return buildIsometricItems(hierarchyMap, spoolsMap);
    }, [initialWeldItems, stateManagement.updatedWelds]);

    // Create weld rows - ADICIONADO ID ÚNICO
    const weldRows: WeldRow[] = useMemo(() =>
        isometricItems.flatMap(item =>
            item.sheets.flatMap(sheet =>
                sheet.spools.map(spool => ({
                    id: `${spool.id}-${item.id}-${sheet.number}`, // ID único para animações
                    spoolId: spool.id,
                    spoolInternalId: spool.internalId,
                    isoId: item.id,
                    isoInternalId: item.internalId,
                    sheetNumber: sheet.number,
                    revId: sheet.revId,
                    weldCount: spool.welds.length,
                    welds: spool.welds.map(weld => ({
                        ...weld,
                        spoolInternalId: spool.internalId
                    }))
                }))
            )
        ), [isometricItems]
    );

    // Get working rows
    const workingRows = useMemo(() => {
        return Object.entries(stateManagement.rowStates)
            .filter(([_, state]) => state === 'working' || state === 'finished')
            .map(([rowKey, _]) => {
                const [spoolId, isoId, sheetNumber] = rowKey.split('-');
                return {spoolId: parseInt(spoolId), isoId, sheetNumber: parseInt(sheetNumber)};
            });
    }, [stateManagement.rowStates]);

    // Get finished row keys for moving to bottom
    const finishedRowKeys = useMemo(() => {
        return Object.entries(stateManagement.rowStates)
            .filter(([_, state]) => state === 'finished')
            .map(([rowKey, _]) => rowKey);
    }, [stateManagement.rowStates]);

    // Filter rows based on search and active tab with sorting
    const filteredRows = useMemo(() => {
        let filtered = activeTab === 'all'
            ? weldRows
            : weldRows.filter(row =>
                workingRows.some(wr =>
                    wr.spoolId === row.spoolId &&
                    wr.isoId === row.isoId &&
                    wr.sheetNumber === row.sheetNumber
                )
            );

        filtered = sortFinishedLast(filtered, movedRowKeys);
        filtered = filterBySearch(filtered, search);

        return filtered;
    }, [activeTab, weldRows, workingRows, search, movedRowKeys]);

    // Get weld items for current selection
    const weldItems = useMemo(() => {
        if (selectedSpool === null || !selectedIso || sheetNumber === null) return [];

        const sheet = selectedIso.sheets.find(s => s.number === sheetNumber);
        if (!sheet) return [];

        const spool = sheet.spools.find(s => s.id === selectedSpool);
        if (!spool) return [];

        return spool.welds.map(weld => ({
            ...weld,
            spoolInternalId: spool.internalId
        }));
    }, [selectedSpool, selectedIso, sheetNumber]);

    // Get current selected row
    const selectedRow = useMemo(() => {
        if (selectedSpool === null || !selectedIso || sheetNumber === null) return null;
        return weldRows.find(row =>
            row.spoolId === selectedSpool &&
            row.isoId === selectedIso.id &&
            row.sheetNumber === sheetNumber
        ) || null;
    }, [selectedSpool, selectedIso, sheetNumber, weldRows]);

    // Get updated weld data
    const getUpdatedWeldData = useCallback((weldId: number): WeldItemWithSpool | null => {
        const baseWeld = weldItems.find(w => w.id === weldId);
        if (!baseWeld) return null;

        const updatedData = stateManagement.updatedWelds[weldId];
        if (updatedData) {
            return {
                ...baseWeld,
                filler: updatedData.filler || baseWeld.filler,
                wps: updatedData.wps || baseWeld.wps
            };
        }
        return baseWeld;
    }, [weldItems, stateManagement.updatedWelds]);

    // Selected weld with updated data
    const selectedWeld = useMemo(() => {
        if (!stateManagement.selectedWeldId) return null;
        return getUpdatedWeldData(stateManagement.selectedWeldId);
    }, [stateManagement.selectedWeldId, getUpdatedWeldData]);

    // State getters
    const getRowState = useCallback((spoolId: number, isoId: string, sheetNumber: number): WeldRowState => {
        const rowKey = generateRowKey(spoolId, isoId, sheetNumber);
        return stateManagement.rowStates[rowKey] || 'initial';
    }, [stateManagement.rowStates]);

    const getWeldState = useCallback((weldId: number): WeldItemState => {
        return stateManagement.weldStates[weldId] || 'initial';
    }, [stateManagement.weldStates]);

    // Check if all working rows are finished
    const areAllWorkingRowsFinished = useCallback(() => {
        const workingTabRows = weldRows.filter(row =>
            workingRows.some(wr =>
                wr.spoolId === row.spoolId &&
                wr.isoId === row.isoId &&
                wr.sheetNumber === row.sheetNumber
            )
        );

        if (workingTabRows.length === 0) return false;

        return workingTabRows.every(row => {
            const rowState = getRowState(row.spoolId, row.isoId, row.sheetNumber);
            return rowState === 'finished';
        });
    }, [weldRows, workingRows, getRowState]);

    // Check if a row can be selected
    const canSelectRow = useCallback((spoolId: number, isoId: string, sheetNumber: number): boolean => {
        const hasWorkingRow = Object.values(stateManagement.rowStates).some(state => state === 'working');
        if (!hasWorkingRow) return true;

        const rowState = getRowState(spoolId, isoId, sheetNumber);
        return rowState === 'working' || rowState === 'finished';
    }, [stateManagement.rowStates, getRowState]);

    // Handle next button workflow with API call
    const handleNextWorkflow = useCallback(async () => {
        if (!selectedSpool || !selectedIso || sheetNumber === null || isSubmitting) return;

        const rowState = getRowState(selectedSpool, selectedIso.id, sheetNumber);
        if (rowState !== 'working') return;

        const sortedWeldItems = [...weldItems].sort((a, b) => a.id - b.id);
        const nextWeldToFinish = sortedWeldItems.find(weld =>
            getWeldState(weld.id) === 'initial'
        );

        if (nextWeldToFinish) {
            formModal.openProcess(nextWeldToFinish.id);
        }
    }, [selectedSpool, selectedIso, sheetNumber, getRowState, weldItems, getWeldState, formModal, isSubmitting]);

    // Main Next button handler
    const handleNext = useCallback(() => {
        if (activeTab === 'all') {
            if (selectedRow) {
                setActiveTab('working');
            }
        } else if (activeTab === 'working') {
            if (areAllWorkingRowsFinished()) {
                setActiveTab('all');
                setSelectedSpool(null);
                setSelectedIso(null);
                setSheetNumber(null);
                dispatch({ type: 'selectWeld', weld: null });
            } else {
                handleNextWorkflow();
            }
        }
    }, [activeTab, selectedRow, areAllWorkingRowsFinished, handleNextWorkflow]);

    // Handle row selection
    const handleSelectRow = useCallback((row: WeldRow) => {
        if (!canSelectRow(row.spoolId, row.isoId, row.sheetNumber)) return;

        const rowKey = generateRowKey(row.spoolId, row.isoId, row.sheetNumber);
        const currentState = stateManagement.rowStates[rowKey] || 'initial';

        if (currentState === 'initial') {
            const iso = isometricItems.find(i => i.id === row.isoId);
            if (iso) {
                setSelectedSpool(row.spoolId);
                setSelectedIso(iso);
                setSheetNumber(row.sheetNumber);
                dispatch({type: 'setRowWorking', rowKey});
                setActiveTab('working');
            }
        } else {
            const iso = isometricItems.find(i => i.id === row.isoId);
            if (iso) {
                setSelectedSpool(row.spoolId);
                setSelectedIso(iso);
                setSheetNumber(row.sheetNumber);
                if (currentState === 'working' || currentState === 'finished') {
                    setActiveTab('working');
                }
            }
        }
    }, [canSelectRow, isometricItems, stateManagement.rowStates]);

    // Handle weld click
    const handleWeldClick = useCallback(async (item: WeldItemWithSpool) => {
        if (!item?.id || !selectedSpool || !selectedIso || sheetNumber === null || isSubmitting) return;

        const rowState = getRowState(selectedSpool, selectedIso.id, sheetNumber);
        dispatch({ type: 'selectWeld', weld: item });

        if (rowState !== 'working') {
            return;
        }

        const currentState = stateManagement.weldStates[item.id] || 'initial';

        if (currentState === 'initial') {
            formModal.openProcess(item.id);
        }
    }, [selectedSpool, selectedIso, sheetNumber, getRowState, stateManagement.weldStates, formModal, isSubmitting]);

    // Auto-complete row when all welds are finished
    useEffect(() => {
        isometricItems.forEach(item => {
            item.sheets.forEach(sheet => {
                sheet.spools.forEach(spool => {
                    const rowKey = generateRowKey(spool.id, item.id, sheet.number);
                    const currentRowState = stateManagement.rowStates[rowKey];

                    if (currentRowState === 'working') {
                        const allWeldIds = spool.welds.map(weld => weld.id);

                        const allWeldsFinished = allWeldIds.every(weldId =>
                            stateManagement.weldStates[weldId] === 'finished'
                        );

                        if (allWeldsFinished && allWeldIds.length > 0) {
                            dispatch({type: 'setRowFinished', rowKey});
                        }
                    }
                });
            });
        });
    }, [stateManagement.weldStates, stateManagement.rowStates, isometricItems]);

    // Effect to move finished rows to bottom after 2 seconds
    useEffect(() => {
        const timeouts: NodeJS.Timeout[] = [];

        finishedRowKeys.forEach(rowKey => {
            if (!movedRowKeys.includes(rowKey)) {
                const timeout = setTimeout(() => {
                    setMovedRowKeys(prev => [...prev, rowKey]);
                }, 2000);
                timeouts.push(timeout);
            }
        });

        return () => {
            timeouts.forEach(clearTimeout);
        };
    }, [finishedRowKeys, movedRowKeys]);

    // Auto-select weld when row changes
    useEffect(() => {
        if (!selectedRow) {
            dispatch({ type: 'selectWeld', weld: null });
            return;
        }

        const rowState = getRowState(selectedRow.spoolId, selectedRow.isoId, selectedRow.sheetNumber);

        if (rowState === 'working') {
            if (!selectedWeld || !weldItems.find(w => w.id === selectedWeld.id)) {
                const availableWeld = weldItems.find(weld =>
                    getWeldState(weld.id) === 'initial'
                );
                if (availableWeld) {
                    dispatch({ type: 'selectWeld', weld: availableWeld });
                } else if (weldItems.length > 0) {
                    dispatch({ type: 'selectWeld', weld: weldItems[0] });
                }
            }
        } else if (rowState === 'finished') {
            if (!selectedWeld && weldItems.length > 0) {
                dispatch({ type: 'selectWeld', weld: weldItems[weldItems.length - 1] });
            }
        }
    }, [selectedRow, weldItems, getRowState, getWeldState, selectedWeld]);

    // Row states configuration - CORRIGIDO PARA WORKTABLE
    const rowStates = useMemo(() => ({
        initial: {
            className: 'bg-dark text-light'
        },
        working: {
            className: 'bg-primary text-white'
        },
        finished: {
            className: 'bg-success text-white'
        },
    }), []);

    const rowStateAccessor = useCallback((item: WeldRow): WeldRowState => {
        return getRowState(item.spoolId, item.isoId, item.sheetNumber);
    }, [getRowState]);

    // Item states configuration
    const itemStates = useMemo(() => ({
        initial: {
            className: isSubmitting ? 'bg-secondary text-white' : 'bg-dark text-light',
            onClick: (item: WeldItemWithSpool) => {
                handleWeldClick(item);
            }
        },
        finished: {
            className: 'bg-success text-white',
            onClick: (item: WeldItemWithSpool) => {
                dispatch({ type: 'selectWeld', weld: item });
            }
        },
    }), [handleWeldClick, isSubmitting]);

    const itemStateAccessor = useCallback((item: WeldItemWithSpool): WeldItemState => {
        if (!item?.id) return 'initial';
        return getWeldState(item.id);
    }, [getWeldState]);

    return {
        // UI State
        activeTab,
        setActiveTab,
        search,
        setSearch,

        // Data
        filteredRows,
        weldItems,
        selectedRow,
        selectedWeld,

        // Handlers
        handleSelectRow,
        handleWeldClick,
        handleNext,

        // Configuration
        rowStates,
        rowStateAccessor,
        itemStates,
        itemStateAccessor,

        // Loading state
        isSubmitting,

        // Form modal
        formModal
    };
}

// Helper functions
function buildSpoolsMap(weldItems: Weld[], updatedWelds: Record<number, {
    filler?: any;
    wps?: any
}> = {}): Map<number, SpoolData> {
    const spoolsMap = new Map<number, SpoolData>();

    weldItems.forEach(weldItem => {
        const spoolId = weldItem.joint.spool.id;

        if (!spoolsMap.has(spoolId)) {
            spoolsMap.set(spoolId, {
                id: weldItem.joint.spool.id,
                internalId: weldItem.joint.spool.internalId,
                welds: new Map()
            });
        }

        const weldData = updatedWelds[weldItem.id] ? {
            filler: updatedWelds[weldItem.id].filler,
            wps: updatedWelds[weldItem.id].wps
        } : {
            filler: weldItem.filler,
            wps: weldItem.wps
        };

        spoolsMap.get(spoolId)!.welds.set(weldItem.id, weldData);
    });

    return spoolsMap;
}

function buildHierarchyMap(weldItems: Weld[]): Map<string, Map<number, SheetSpools>> {
    const hierarchyMap = new Map<string, Map<number, SheetSpools>>();

    weldItems.forEach(weldItem => {
        weldItem.joint.spool.revs.forEach(rev => {
            const isoId = rev.sheet.isometric.internalId;
            const sheetNumber = rev.sheet.number;
            const spoolId = weldItem.joint.spool.id;

            if (!hierarchyMap.has(isoId)) {
                hierarchyMap.set(isoId, new Map());
            }

            const isoMap = hierarchyMap.get(isoId)!;
            if (!isoMap.has(sheetNumber)) {
                isoMap.set(sheetNumber, {spoolIds: new Set(), revIds: []});
            }

            const sheetData = isoMap.get(sheetNumber)!;
            sheetData.spoolIds.add(spoolId);
            sheetData.revIds.push(rev.id);
        });
    });

    return hierarchyMap;
}

function buildIsometricItems(
    hierarchyMap: Map<string, Map<number, SheetSpools>>,
    spoolsMap: Map<number, SpoolData>
): IsoItem[] {
    return Array.from(hierarchyMap.entries())
        .map(([isoId, sheetsMap]) => ({
            id: isoId,
            internalId: isoId,
            sheets: buildSheets(sheetsMap, spoolsMap)
        }))
        .sort((a, b) => a.id.localeCompare(b.id));
}

function buildSheets(
    sheetsMap: Map<number, SheetSpools>,
    spoolsMap: Map<number, SpoolData>
) {
    return Array.from(sheetsMap.entries())
        .map(([sheetNumber, sheetData]) => ({
            number: sheetNumber,
            revId: Math.max(...sheetData.revIds),
            spools: buildSpools(sheetData.spoolIds, spoolsMap)
        }))
        .sort((a, b) => a.number - b.number);
}

function buildSpools(spoolIds: Set<number>, spoolsMap: Map<number, SpoolData>) {
    return Array.from(spoolIds)
        .map(spoolId => {
            const spoolData = spoolsMap.get(spoolId)!;
            return {
                id: spoolData.id,
                internalId: spoolData.internalId,
                welds: Array.from(spoolData.welds.entries())
                    .sort(([a], [b]) => a - b)
                    .map(([weldId, weldData]) => ({
                        id: weldId,
                        filler: weldData.filler,
                        wps: weldData.wps
                    }))
            };
        })
        .sort((a, b) => a.id - b.id);
}