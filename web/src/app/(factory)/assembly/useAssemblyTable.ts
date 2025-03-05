import {useState, useMemo, useReducer, useCallback, useEffect} from 'react';
import {Joint} from '@models/joint.interface';
import {IsoItem, SheetSpools, SpoolData, AssemblyRow} from './useAssemblyTable.types';
import {useMaterialVerification} from './useMaterialVerification';
import {useAssemblyOperations} from './useAssemblyOperations';

type AssemblyRowState = 'initial' | 'working' | 'finished';
type AssemblyItemState = 'initial' | 'finished';

type AssemblyAction =
    | { type: 'setRowWorking'; rowKey: string }
    | { type: 'setRowFinished'; rowKey: string }
    | { type: 'setWeldFinished'; weldId: number; finished: boolean };

interface AssemblyStateManagement {
    rowStates: Record<string, AssemblyRowState>;
    weldStates: Record<number, AssemblyItemState>;
}

// Interface for assembly table callbacks
interface UseAssemblyTableCallbacks {
    onWeldProcessed?: (weldId: number) => void;
    onError?: (error: string) => void;
}

const assemblyReducer = (state: AssemblyStateManagement, action: AssemblyAction): AssemblyStateManagement => {
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
        default:
            return state;
    }
};

const generateRowKey = (isoId: string, sheetNumber: number): string =>
    `${isoId}-${sheetNumber}`;

// Utility function to sort finished rows last
const sortFinishedLast = (rows: AssemblyRow[], movedRowKeys: string[]): AssemblyRow[] => {
    return [...rows].sort((a, b) => {
        const aRowKey = generateRowKey(a.isoId, a.sheetNumber);
        const bRowKey = generateRowKey(b.isoId, b.sheetNumber);
        const aMoved = movedRowKeys.includes(aRowKey);
        const bMoved = movedRowKeys.includes(bRowKey);

        if (aMoved && !bMoved) return 1;
        if (!aMoved && bMoved) return -1;
        return 0;
    });
};

// Utility function to filter by search
const filterBySearch = (rows: AssemblyRow[], search: string): AssemblyRow[] => {
    if (!search.trim()) return rows;

    const searchLower = search.toLowerCase();
    return rows.filter(row =>
        row.internalId.toLowerCase().includes(searchLower) ||
        row.sheetNumber.toString().includes(searchLower)
    );
};

export function useAssemblyTable(initialItems: Joint[], callbacks?: UseAssemblyTableCallbacks) {
    // UI State
    const [activeTab, setActiveTab] = useState<'all' | 'working'>('all');
    const [search, setSearch] = useState<string>('');
    const [selectedIso, setSelectedIso] = useState<IsoItem | null>(null);
    const [sheetNumber, setSheetNumber] = useState<number | null>(null);
    const [selectedWeld, setSelectedWeld] = useState<{
        id: number;
        spoolInternalId: string;
    } | null>(null);

    // State for moving finished rows to bottom
    const [movedRowKeys, setMovedRowKeys] = useState<string[]>([]);

    // State management
    const [stateManagement, dispatch] = useReducer(assemblyReducer, {
        rowStates: {},
        weldStates: {}
    });

    const materialVerification = useMaterialVerification();

    // Assembly operations hook following cutting pattern
    const { processWeld, isSubmitting } = useAssemblyOperations({
        onSuccess: (weldId) => {
            // Mark the weld as finished after successful API call
            dispatch({
                type: 'setWeldFinished',
                weldId: weldId,
                finished: true
            });

            // Update selected weld
            const weld = weldItems.find(w => w.id === weldId);
            if (weld) {
                setSelectedWeld(weld);
            }

            callbacks?.onWeldProcessed?.(weldId);
        },
        onError: (error) => {
            callbacks?.onError?.(error);
        }
    });

    // Function to find jointId for a given weldId
    const findJointIdForWeld = useCallback((weldId: number): number | null => {
        for (const joint of initialItems) {
            const weld = joint.welds.find(w => w.id === weldId);
            if (weld) {
                return joint.id;
            }
        }
        return null;
    }, [initialItems]);

    // Build isometric items from joints
    const isometricItems = useMemo(() => {
        const spoolsMap = buildSpoolsMap(initialItems);
        const hierarchyMap = buildHierarchyMap(initialItems);
        return buildIsometricItems(hierarchyMap, spoolsMap);
    }, [initialItems]);

    // Create assembly rows
    const assemblyRows = useMemo(() =>
        isometricItems.flatMap(item =>
            item.sheets.map(sheet => ({
                id: `${item.id}-${sheet.number}`,
                isoId: item.id,
                internalId: item.internalId,
                sheetNumber: sheet.number,
                revId: sheet.revId,
                spoolCount: sheet.spools.length,
                weldCount: sheet.spools.reduce((total, spool) => total + spool.welds.length, 0),
                spools: sheet.spools
            }))
        ), [isometricItems]
    );

    // Get working rows
    const workingRows = useMemo(() => {
        return Object.entries(stateManagement.rowStates)
            .filter(([_, state]) => state === 'working' || state === 'finished')
            .map(([rowKey, _]) => {
                const [isoId, sheetNumber] = rowKey.split('-');
                return {isoId, sheetNumber: parseInt(sheetNumber)};
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
            ? assemblyRows
            : assemblyRows.filter(row =>
                workingRows.some(wr =>
                    wr.isoId === row.isoId && wr.sheetNumber === row.sheetNumber
                )
            );

        // Apply sorting first (move finished to bottom)
        filtered = sortFinishedLast(filtered, movedRowKeys);

        // Then apply search filter
        filtered = filterBySearch(filtered, search);

        return filtered;
    }, [activeTab, assemblyRows, workingRows, search, movedRowKeys]);

    // Get weld items for current selection
    const weldItems = useMemo(() => {
        if (!selectedIso || sheetNumber === null) return [];

        const sheet = selectedIso.sheets.find(s => s.number === sheetNumber);
        if (!sheet) return [];

        return sheet.spools.flatMap(spool =>
            spool.welds.map(weld => ({
                spoolInternalId: spool.internalId,
                ...weld  // This already includes the id property
            }))
        ).filter(item => item.id !== undefined);
    }, [selectedIso, sheetNumber]);

    // Get current selected row
    const selectedRow = useMemo(() => {
        if (!selectedIso || sheetNumber === null) return null;
        return assemblyRows.find(row =>
            row.isoId === selectedIso.id && row.sheetNumber === sheetNumber
        ) || null;
    }, [selectedIso, sheetNumber, assemblyRows]);

    // State getters
    const getRowState = useCallback((isoId: string, sheetNumber: number): AssemblyRowState => {
        const rowKey = generateRowKey(isoId, sheetNumber);
        return stateManagement.rowStates[rowKey] || 'initial';
    }, [stateManagement.rowStates]);

    const getWeldState = useCallback((weldId: number): AssemblyItemState => {
        return stateManagement.weldStates[weldId] || 'initial';
    }, [stateManagement.weldStates]);

    // Check if all welds are finished for a specific row
    const areAllWeldsFinished = useCallback((isoId: string, sheetNumber: number): boolean => {
        const item = isometricItems.find(i => i.id === isoId);
        if (!item) return false;

        const sheet = item.sheets.find(s => s.number === sheetNumber);
        if (!sheet) return false;

        const allWeldIds = sheet.spools.flatMap(spool => spool.welds.map(weld => weld.id));
        return allWeldIds.length > 0 && allWeldIds.every(weldId =>
            stateManagement.weldStates[weldId] === 'finished'
        );
    }, [isometricItems, stateManagement.weldStates]);

    // Check if all working rows are finished
    const areAllWorkingRowsFinished = useCallback(() => {
        // Get all rows that appear in the working tab
        const workingTabRows = assemblyRows.filter(row =>
            workingRows.some(wr => wr.isoId === row.isoId && wr.sheetNumber === row.sheetNumber)
        );

        // If there are no rows in working tab, return false
        if (workingTabRows.length === 0) return false;

        // Check if ALL rows in working tab are finished
        return workingTabRows.every(row => {
            const rowState = getRowState(row.isoId, row.sheetNumber);
            return rowState === 'finished';
        });
    }, [assemblyRows, workingRows, getRowState]);

    // Check if a row can be selected
    const canSelectRow = useCallback((isoId: string, sheetNumber: number): boolean => {
        const hasWorkingRow = Object.values(stateManagement.rowStates).some(state => state === 'working');
        if (!hasWorkingRow) return true;

        const rowState = getRowState(isoId, sheetNumber);
        return rowState === 'working' || rowState === 'finished';
    }, [stateManagement.rowStates, getRowState]);

    // Find isometric ID for verification
    const findIsometricId = useCallback((isoId: string, sheetNumber: number): number | null => {
        const relevantJoint = initialItems.find(joint =>
            joint.spool.revs.some(rev =>
                rev.sheet.isometric.internalId === isoId &&
                rev.sheet.number === sheetNumber
            )
        );

        return relevantJoint?.spool.revs.find(rev =>
            rev.sheet.isometric.internalId === isoId &&
            rev.sheet.number === sheetNumber
        )?.sheet.isometric.id || null;
    }, [initialItems]);

    // Handle next button workflow with API call
    const handleNextWorkflow = useCallback(async () => {
        if (!selectedIso || sheetNumber === null || isSubmitting) return;

        const rowState = getRowState(selectedIso.id, sheetNumber);

        // Only allow next action if row is working
        if (rowState !== 'working') return;

        // Get all weld items sorted by ID to ensure consistent order
        const sortedWeldItems = [...weldItems].sort((a, b) => a.id - b.id);

        // Find the first weld that is not finished
        const nextWeldToFinish = sortedWeldItems.find(weld =>
            getWeldState(weld.id) === 'initial'
        );

        if (nextWeldToFinish) {
            // Find the jointId for this weld
            const jointId = findJointIdForWeld(nextWeldToFinish.id);

            if (jointId) {
                // Make API call to process the weld
                await processWeld(nextWeldToFinish.id, jointId);
            } else {
                callbacks?.onError?.('Could not find joint information for this weld');
            }
        }
    }, [selectedIso, sheetNumber, getRowState, weldItems, getWeldState, findJointIdForWeld, processWeld, isSubmitting, callbacks]);

    // Main Next button handler
    const handleNext = useCallback(() => {
        if (activeTab === 'all') {
            // If on 'all' tab and has selected row, go to 'working' tab
            if (selectedRow) {
                setActiveTab('working');
            }
        } else if (activeTab === 'working') {
            // Check if all working rows are finished
            if (areAllWorkingRowsFinished()) {
                // If all working rows are finished, return to 'all' tab
                setActiveTab('all');
                // Clear selection
                setSelectedIso(null);
                setSheetNumber(null);
                setSelectedWeld(null);
            } else {
                // If not all finished, execute next workflow step
                handleNextWorkflow();
            }
        }
    }, [activeTab, selectedRow, areAllWorkingRowsFinished, handleNextWorkflow]);

    // Handle row selection
    const handleSelectRow = useCallback(async (row: AssemblyRow) => {
        if (!canSelectRow(row.isoId, row.sheetNumber)) return;

        const rowKey = generateRowKey(row.isoId, row.sheetNumber);
        const currentState = stateManagement.rowStates[rowKey] || 'initial';

        if (currentState === 'initial') {
            const isometricId = findIsometricId(row.isoId, row.sheetNumber);
            if (!isometricId) return;

            try {
                await materialVerification.startVerification(isometricId, () => {
                    const iso = isometricItems.find(i => i.id === row.isoId);
                    if (iso) {
                        setSelectedIso(iso);
                        setSheetNumber(row.sheetNumber);
                        dispatch({type: 'setRowWorking', rowKey});
                        // Switch to working tab when row becomes working
                        setActiveTab('working');
                    }
                });
            } catch (error) {
                console.error('Material verification failed:', error);
            }
        } else {
            // Row already working/finished, just select it
            const iso = isometricItems.find(i => i.id === row.isoId);
            if (iso) {
                setSelectedIso(iso);
                setSheetNumber(row.sheetNumber);
                // If selecting a working/finished row, also switch to working tab
                if (currentState === 'working' || currentState === 'finished') {
                    setActiveTab('working');
                }
            }
        }
    }, [canSelectRow, materialVerification, isometricItems, findIsometricId, stateManagement.rowStates]);

    // Handle list consultation
    const handleListConsultation = useCallback(async () => {
        if (!selectedRow) return;

        const isometricId = findIsometricId(selectedRow.isoId, selectedRow.sheetNumber);
        if (!isometricId) return;

        const rowState = getRowState(selectedRow.isoId, selectedRow.sheetNumber);

        // Only allow consultation for working or finished rows
        if (rowState === 'working' || rowState === 'finished') {
            try {
                await materialVerification.openMaterialsConsultation(isometricId);
            } catch (error) {
                console.error('Failed to open materials consultation:', error);
            }
        }
    }, [selectedRow, findIsometricId, getRowState, materialVerification]);

    // Handle weld click with API call
    const handleWeldClick = useCallback(async (item: any) => {
        if (!item?.id || !selectedIso || sheetNumber === null || isSubmitting) return;

        const rowState = getRowState(selectedIso.id, sheetNumber);
        if (rowState !== 'working') {
            // Allow viewing finished welds
            if (rowState === 'finished') {
                const clickedWeld = weldItems.find(weld => weld.id === item.id);
                if (clickedWeld) setSelectedWeld(clickedWeld);
            }
            return;
        }

        const currentState = stateManagement.weldStates[item.id] || 'initial';

        if (currentState === 'initial') {
            // Find the jointId for this weld
            const jointId = findJointIdForWeld(item.id);

            if (jointId) {
                // Make API call to process the weld
                await processWeld(item.id, jointId);
            } else {
                callbacks?.onError?.('Could not find joint information for this weld');
            }
        } else {
            // Finished weld: do not toggle back to initial, only select it
            // removed dispatch to prevent reverting state
        }

        // Update selected weld
        const clickedWeld = weldItems.find(weld => weld.id === item.id);
        if (clickedWeld) setSelectedWeld(clickedWeld);
    }, [selectedIso, sheetNumber, getRowState, stateManagement.weldStates, weldItems, findJointIdForWeld, processWeld, isSubmitting, callbacks]);

    // Auto-complete row when all welds are finished
    useEffect(() => {
        isometricItems.forEach(item => {
            item.sheets.forEach(sheet => {
                const rowKey = generateRowKey(item.id, sheet.number);
                const currentRowState = stateManagement.rowStates[rowKey];

                if (currentRowState === 'working') {
                    const allWeldIds = sheet.spools.flatMap(spool =>
                        spool.welds.map(weld => weld.id)
                    );

                    const allWeldsFinished = allWeldIds.every(weldId =>
                        stateManagement.weldStates[weldId] === 'finished'
                    );

                    if (allWeldsFinished && allWeldIds.length > 0) {
                        dispatch({type: 'setRowFinished', rowKey});
                    }
                }
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

    // Update selected weld when state changes
    useEffect(() => {
        if (!selectedRow) {
            setSelectedWeld(null);
            return;
        }

        const rowState = getRowState(selectedRow.isoId, selectedRow.sheetNumber);

        if (rowState === 'working') {
            const availableWeld = weldItems.find(weld => getWeldState(weld.id) === 'initial');
            setSelectedWeld(availableWeld || (weldItems.length > 0 ? weldItems[0] : null));
        } else if (rowState === 'finished') {
            setSelectedWeld(weldItems[weldItems.length - 1] || null);
        }
    }, [selectedRow, weldItems, getRowState, getWeldState]);

    // Row states for WorkTable
    const rowStates = useMemo(() => ({
        initial: {className: 'bg-dark text-light'},
        working: {className: 'bg-primary text-white'},
        finished: {className: 'bg-success text-white'},
    }), []);

    const rowStateAccessor = useCallback((item: any) =>
        getRowState(item.isoId, item.sheetNumber), [getRowState]
    );

    // Item states for WorkGrid with loading support
    const itemStates = useMemo(() => ({
        initial: {
            className: isSubmitting ? 'bg-secondary text-white' : 'bg-dark text-light',
            onClick: (item: any) => {
                if (selectedIso && sheetNumber !== null && !isSubmitting) {
                    const rowState = getRowState(selectedIso.id, sheetNumber);
                    if (rowState === 'working') {
                        handleWeldClick(item);
                    }
                }
            }
        },
        finished: {
            className: 'bg-success text-white',
            onClick: (item: any) => {
                if (selectedIso && sheetNumber !== null && !isSubmitting) {
                    const rowState = getRowState(selectedIso.id, sheetNumber);
                    const allFinished = areAllWeldsFinished(selectedIso.id, sheetNumber);

                    if (rowState === 'working' && !allFinished) {
                        handleWeldClick(item);
                    } else {
                        // Allow viewing finished welds
                        const clickedWeld = weldItems.find(weld => weld.id === item.id);
                        if (clickedWeld) setSelectedWeld(clickedWeld);
                    }
                }
            }
        },
    }), [handleWeldClick, selectedIso, sheetNumber, getRowState, areAllWeldsFinished, weldItems, isSubmitting]);

    const itemStateAccessor = useCallback((item: any) => {
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
        handleListConsultation,
        handleNext,

        // Configuration
        rowStates,
        rowStateAccessor,
        itemStates,
        itemStateAccessor,

        // Loading state
        isSubmitting,

        // Material verification
        materialVerification
    };
}

// Helper functions remain the same...
function buildSpoolsMap(joints: Joint[]): Map<number, SpoolData> {
    const spoolsMap = new Map<number, SpoolData>();

    joints.forEach(joint => {
        const spoolId = joint.spool.id;

        if (!spoolsMap.has(spoolId)) {
            spoolsMap.set(spoolId, {
                id: joint.spool.id,
                internalId: joint.spool.internalId,
                welds: new Set()
            });
        }

        joint.welds.forEach(weld => {
            spoolsMap.get(spoolId)!.welds.add(weld.id);
        });
    });

    return spoolsMap;
}

function buildHierarchyMap(joints: Joint[]): Map<string, Map<number, SheetSpools>> {
    const hierarchyMap = new Map<string, Map<number, SheetSpools>>();

    joints.forEach(joint => {
        joint.spool.revs.forEach(rev => {
            const isoId = rev.sheet.isometric.internalId;
            const sheetNumber = rev.sheet.number;
            const spoolId = joint.spool.id;

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
                welds: Array.from(spoolData.welds)
                    .sort((a, b) => a - b)
                    .map(weldId => ({id: weldId}))
            };
        })
        .sort((a, b) => a.id - b.id);
}

