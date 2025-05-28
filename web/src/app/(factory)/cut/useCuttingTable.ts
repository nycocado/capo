import {useReducer, useState, useEffect, useMemo, useCallback} from 'react';
import {PipeLength} from '@models/pipe-length.interface';
import {AllState, WorkState} from './CutClient.types';

// Types
type CuttingAction =
    | { type: 'toggleInfo'; id: number }
    | { type: 'workClick'; id: number }
    | { type: 'resetInfo'; id: number };

interface CuttingState {
    allState: Record<number, AllState>;
    workState: Record<number, WorkState>;
}

// Utility functions
const sortFinishedLast = (items: PipeLength[], finishedIds: number[]): PipeLength[] => {
    return [...items].sort((a, b) => {
        const aFinished = finishedIds.includes(a.id);
        const bFinished = finishedIds.includes(b.id);
        if (aFinished && !bFinished) return 1;
        if (!aFinished && bFinished) return -1;
        return 0;
    });
};

const filterBySearch = (items: PipeLength[], search: string): PipeLength[] => {
    const searchTerm = search.replace(/^0+/, '');
    return items.filter(item => item.id.toString().includes(searchTerm));
};

// Reducer
const cuttingReducer = (state: CuttingState, action: CuttingAction): CuttingState => {
    const {id} = action;

    switch (action.type) {
        case 'toggleInfo': {
            const currentState = state.allState[id];
            const newAllState = currentState === 'information' ? 'initial' : 'information';

            const updatedAllState = {
                ...state.allState,
                [id]: newAllState as AllState
            };

            const updatedWorkState = currentState === 'information'
                ? Object.fromEntries(Object.entries(state.workState).filter(([key]) => Number(key) !== id))
                : state.workState;

            return {
                allState: updatedAllState,
                workState: updatedWorkState
            };
        }

        case 'workClick': {
            const currentWorkState = state.workState[id] || 'initial';

            // Prevent multiple active items
            if (currentWorkState === 'initial' || currentWorkState === 'information') {
                const hasOtherActive = Object.entries(state.workState)
                    .some(([key, state]) =>
                        (state === 'information' || state === 'working') && Number(key) !== id
                    );
                if (hasOtherActive) return state;
            }

            const nextWorkState: WorkState = getNextWorkState(currentWorkState);

            const updatedAllState = currentWorkState === 'working'
                ? {...state.allState, [id]: 'finished' as AllState}
                : state.allState;

            return {
                allState: updatedAllState,
                workState: {...state.workState, [id]: nextWorkState}
            };
        }

        case 'resetInfo': {
            return {
                ...state,
                workState: {...state.workState, [id]: 'initial'}
            };
        }

        default:
            return state;
    }
};

const getNextWorkState = (current: WorkState): WorkState => {
    switch (current) {
        case 'initial':
            return 'information';
        case 'information':
            return 'working';
        case 'working':
            return 'finished';
        default:
            return current;
    }
};

// Custom hooks for state derivation
const useStateIds = (workState: Record<number, WorkState>) => {
    return useMemo(() => {
        const infoIds: number[] = [];
        const workingIds: number[] = [];
        const finishedIds: number[] = [];

        Object.entries(workState).forEach(([id, state]) => {
            const numId = Number(id);
            switch (state) {
                case 'information':
                    infoIds.push(numId);
                    break;
                case 'working':
                    workingIds.push(numId);
                    break;
                case 'finished':
                    finishedIds.push(numId);
                    break;
            }
        });

        return {infoIds, workingIds, finishedIds};
    }, [workState]);
};

const useRowStateAccessor = (
    activeTab: 'all' | 'working',
    allState: Record<number, AllState>,
    workState: Record<number, WorkState>,
    workingIds: number[],
    finishedIds: number[]
) => {
    return useCallback((item: PipeLength) => {
        if (activeTab === 'all') {
            if (workingIds.includes(item.id)) return 'working';
            if (finishedIds.includes(item.id)) return 'finished';
            return allState[item.id] || 'initial';
        }
        return workState[item.id] || 'initial';
    }, [activeTab, allState, workState, workingIds, finishedIds]);
};

// Event handlers
const useEventHandlers = (
    dispatch: React.Dispatch<CuttingAction>,
    activeTab: 'all' | 'working',
    workState: Record<number, WorkState>,
    infoIds: number[],
    workingIds: number[],
    rowStateAccessor: (item: PipeLength) => string,
    setSelectedItem: React.Dispatch<React.SetStateAction<PipeLength | null>>,
    setSelectionHistory: React.Dispatch<React.SetStateAction<PipeLength[]>>
) => {
    const handleAllClick = useCallback((item: PipeLength) => {
        dispatch({type: 'toggleInfo', id: item.id});
    }, [dispatch]);

    const handleWorkClick = useCallback((item: PipeLength) => {
        if (activeTab === 'working') {
            const currentState = workState[item.id] || 'initial';

            // Block if another item is working
            const otherWorking = workingIds.some(id => id !== item.id);
            if (otherWorking && currentState !== 'finished') return;

            // Handle information state switching
            const otherInfoId = infoIds.find(id => id !== item.id);
            if (otherInfoId !== undefined && currentState === 'initial') {
                dispatch({type: 'resetInfo', id: otherInfoId});
                dispatch({type: 'workClick', id: item.id});
                setSelectedItem(item);
                return;
            }
        }

        dispatch({type: 'workClick', id: item.id});
        setSelectedItem(item);
    }, [activeTab, workState, infoIds, workingIds, dispatch, setSelectedItem]);

    const handleRowClick = useCallback((item: PipeLength) => {
        if (activeTab === 'working') {
            const state = rowStateAccessor(item);
            if (state === 'finished') {
                setSelectedItem(item);
            }
            return;
        }

        // Handle selection history for 'all' tab
        const state = rowStateAccessor(item);
        if (state === 'information') {
            setSelectionHistory(prev => {
                const filtered = prev.filter(i => i.id !== item.id);
                const lastItem = filtered[filtered.length - 1] || null;
                setSelectedItem(lastItem);
                return filtered;
            });
        } else {
            setSelectionHistory(prev => {
                const filtered = prev.filter(i => i.id !== item.id);
                return [...filtered, item];
            });
            setSelectedItem(item);
        }
    }, [activeTab, rowStateAccessor, setSelectedItem, setSelectionHistory]);

    return {handleAllClick, handleWorkClick, handleRowClick};
};

// Row states configuration
const useRowStates = (
    activeTab: 'all' | 'working',
    handleAllClick: (item: PipeLength) => void,
    handleWorkClick: (item: PipeLength) => void,
    handleRowClick: (item: PipeLength) => void
) => {
    const rowStatesAll = useMemo(() => ({
        initial: {className: 'bg-dark text-light', onClick: handleAllClick},
        information: {className: 'bg-tertiary text-white', onClick: handleAllClick},
        working: {className: 'bg-primary text-white'},
        finished: {className: 'bg-success text-white'},
    }), [handleAllClick]);

    const rowStatesWork = useMemo(() => ({
        initial: {className: 'bg-dark text-light', onClick: handleWorkClick},
        information: {className: 'bg-tertiary text-white', onClick: handleWorkClick},
        working: {className: 'bg-primary text-white', onClick: handleWorkClick},
        finished: {className: 'bg-success text-white', onClick: handleRowClick},
    }), [handleWorkClick, handleRowClick]);

    return activeTab === 'all' ? rowStatesAll : rowStatesWork;
};

// Main hook
export function useCuttingTable(
    items: PipeLength[],
    activeTab: 'all' | 'working',
    search: string
) {
    // State management
    const [{allState, workState}, dispatch] = useReducer(cuttingReducer, {
        allState: {},
        workState: {}
    });

    const [selectionHistory, setSelectionHistory] = useState<PipeLength[]>([]);
    const [movedIds, setMovedIds] = useState<number[]>([]);
    const [selectedItem, setSelectedItem] = useState<PipeLength | null>(null);

    // Derived state
    const {infoIds, workingIds, finishedIds} = useStateIds(workState);
    const rowStateAccessor = useRowStateAccessor(activeTab, allState, workState, workingIds, finishedIds);

    // Event handlers
    const {handleAllClick, handleWorkClick, handleRowClick} = useEventHandlers(
        dispatch,
        activeTab,
        workState,
        infoIds,
        workingIds,
        rowStateAccessor,
        setSelectedItem,
        setSelectionHistory
    );

    // Row states
    const rowStates = useRowStates(activeTab, handleAllClick, handleWorkClick, handleRowClick);

    // Computed items
    const allItems = useMemo(() =>
            filterBySearch(sortFinishedLast(items, movedIds), search),
        [items, movedIds, search]
    );

    const workingItems = useMemo(() => {
        const filteredItems = items.filter(item =>
            allState[item.id] === 'information' || workState[item.id] !== undefined
        );
        return filterBySearch(sortFinishedLast(filteredItems, movedIds), search);
    }, [items, allState, workState, movedIds, search]);

    const tableItems = activeTab === 'all' ? allItems : workingItems;

    // Effects
    useEffect(() => {
        const timeouts: NodeJS.Timeout[] = [];

        finishedIds.forEach(id => {
            if (!movedIds.includes(id)) {
                const timeout = setTimeout(() => {
                    setMovedIds(prev => [...prev, id]);
                }, 2000);
                timeouts.push(timeout);
            }
        });

        return () => {
            timeouts.forEach(clearTimeout);
        };
    }, [finishedIds, movedIds]);

    useEffect(() => {
        setSelectionHistory([]);
        setSelectedItem(null);
    }, [activeTab]);

    return {
        tableItems,
        rowStates,
        rowStateAccessor,
        selectedItem,
        handleRowClick
    };
}