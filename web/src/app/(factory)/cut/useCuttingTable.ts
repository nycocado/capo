import {useState, useEffect} from 'react';
import {PipeLength} from '@models/pipe-length.interface';
import {AllState, RowState, WorkState} from "./CutClient.types";

function sortFinishedLast(items: PipeLength[], finishedIds: number[]): PipeLength[] {
    return [...items].sort((a, b) => {
        const aFin = finishedIds.includes(a.id);
        const bFin = finishedIds.includes(b.id);
        if (aFin && !bFin) return 1;
        if (!aFin && bFin) return -1;
        return 0;
    });
}

export function useCuttingTable(
    items: PipeLength[],
    activeTab: 'all' | 'working',
    search: string,
) {
    const [allState, setAllState] = useState<Record<number, AllState>>({});
    const [workState, setWorkState] = useState<Record<number, WorkState>>({});
    const [movedIds, setMovedIds] = useState<number[]>([]);
    const [selectedItem, setSelectedItem] = useState<PipeLength | null>(null);
    const [, setSelectionHistory] = useState<PipeLength[]>([]);

    const handleAllClick = (item: PipeLength) => {
        setAllState(prev => ({...prev, [item.id]: prev[item.id] === 'information' ? 'initial' : 'information'}));
    };

    const handleWorkClick = (item: PipeLength) => {
        setWorkState(prev => {
            const cur = prev[item.id] || 'initial';
            if (cur === 'initial') {
                const workingCount = Object.values(prev).filter(s => s === 'working').length;
                if (workingCount) return prev;
                setAllState(a => (a[item.id] === 'information' ? {...a, [item.id]: 'initial'} : a));
                return {...prev, [item.id]: 'working'};
            }
            if (cur === 'working') {
                setAllState(a => ({...a, [item.id]: 'finished'}));
                return {...prev, [item.id]: 'finished'};
            }
            return prev;
        });
    };

    const finishedIds = Object.entries(workState)
        .filter(([, s]) => s === 'finished')
        .map(([id]) => Number(id));

    useEffect(() => {
        finishedIds.forEach(id => {
            if (!movedIds.includes(id)) {
                const timer = setTimeout(() => setMovedIds(prev => [...prev, id]), 2000);
                return () => clearTimeout(timer);
            }
        });
    }, [finishedIds, movedIds]);

    const workingIds = Object.entries(workState)
        .filter(([, s]) => s === 'working')
        .map(([id]) => Number(id));

    const filterBySearch = (list: PipeLength[]) => {
        const effectiveSearch = search.replace(/^0+/, '');
        return list.filter(i => i.id.toString().includes(effectiveSearch));
    };

    const allItems = filterBySearch(sortFinishedLast(items, movedIds));

    const workingItems = filterBySearch(
        sortFinishedLast(
            items.filter(i => allState[i.id] === 'information' || workingIds.includes(i.id) || finishedIds.includes(i.id)),
            movedIds,
        ),
    );

    const tableItems = activeTab === 'all' ? allItems : workingItems;

    const rowStatesAll: Record<AllState | 'working', RowState> = {
        initial: {className: 'bg-dark text-light', onClick: handleAllClick},
        information: {className: 'bg-tertiary text-white', onClick: handleAllClick},
        working: {className: 'bg-primary text-white'},
        finished: {className: 'bg-success text-white'},
    };

    const rowStatesWork: Record<'initial' | 'working' | 'finished', RowState> = {
        initial: {className: 'bg-dark text-light', onClick: handleWorkClick},
        working: {className: 'bg-primary text-white', onClick: handleWorkClick},
        finished: {className: 'bg-success text-white'},
    };

    const rowStates = activeTab === 'all' ? rowStatesAll : rowStatesWork;

    const rowStateAccessor = (item: PipeLength) => {
        if (activeTab === 'all') {
            if (workingIds.includes(item.id)) return 'working';
            if (finishedIds.includes(item.id)) return 'finished';
            return allState[item.id] || 'initial';
        }
        return workState[item.id] || 'initial';
    };

    useEffect(() => {
        setSelectionHistory([]);
        setSelectedItem(null);
    }, [activeTab]);

    useEffect(() => {
        if (activeTab === 'working') {
            const wId = workingIds[0];
            const wItem = items.find(i => i.id === wId) || null;
            setSelectedItem(wItem);
        }
    }, [activeTab, workingIds, items]);

    const handleRowClick = (item: PipeLength) => {
        if (activeTab === 'working') {
            return;
        }
        const currentState = rowStateAccessor(item);
        if (activeTab === 'all' && currentState === 'information') {
            setSelectionHistory(prev => {
                const newHist = prev.filter(i => i.id !== item.id);
                // select last item not in 'working' or 'finished'
                const validItems = newHist.filter(i => {
                    const state = rowStateAccessor(i);
                    return state !== 'working' && state !== 'finished';
                });
                const last = validItems[validItems.length - 1] || null;
                setSelectedItem(last);
                return newHist;
            });
        } else {
            setSelectionHistory(prev => {
                const filtered = prev.filter(i => i.id !== item.id);
                return [...filtered, item];
            });
            setSelectedItem(item);
        }
    };

    return {tableItems, rowStates, rowStateAccessor, selectedItem, handleRowClick};
}
