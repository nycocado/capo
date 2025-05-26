import { useState } from 'react';
import { PipeLength } from '@models/PipeLenght';

type AllState = 'initial' | 'information' | 'finished';
type WorkState = 'initial' | 'working' | 'finished';

interface RowState {
  className: string;
  onClick?: (item: PipeLength) => void;
}

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

  const handleAllClick = (item: PipeLength) => {
    setAllState(prev => ({ ...prev, [item.id]: prev[item.id] === 'information' ? 'initial' : 'information' }));
  };

  const handleWorkClick = (item: PipeLength) => {
    setWorkState(prev => {
      const cur = prev[item.id] || 'initial';
      if (cur === 'initial') {
        const workingCount = Object.values(prev).filter(s => s === 'working').length;
        if (workingCount) return prev;
        setAllState(a => (a[item.id] === 'information' ? { ...a, [item.id]: 'initial' } : a));
        return { ...prev, [item.id]: 'working' };
      }
      if (cur === 'working') {
        setAllState(a => ({ ...a, [item.id]: 'finished' }));
        return { ...prev, [item.id]: 'finished' };
      }
      return prev;
    });
  };

  const finishedIds = Object.entries(workState)
    .filter(([, s]) => s === 'finished')
    .map(([id]) => Number(id));

  const workingIds = Object.entries(workState)
    .filter(([, s]) => s === 'working')
    .map(([id]) => Number(id));

  const filterBySearch = (list: PipeLength[]) => list.filter(i => i.id.toString().includes(search));

  const allItems = filterBySearch(sortFinishedLast(items, finishedIds));

  const workingItems = filterBySearch(
    sortFinishedLast(
      items.filter(i => allState[i.id] === 'information' || workingIds.includes(i.id) || finishedIds.includes(i.id)),
      finishedIds,
    ),
  );

  const tableItems = activeTab === 'all' ? allItems : workingItems;

  const rowStatesAll: Record<AllState | 'working', RowState> = {
    initial: { className: 'bg-dark text-light', onClick: handleAllClick },
    information: { className: 'bg-tertiary text-white', onClick: handleAllClick },
    working: { className: 'bg-primary text-white' },
    finished: { className: 'bg-success text-white' },
  };

  const rowStatesWork: Record<'initial' | 'working' | 'finished', RowState> = {
    initial: { className: 'bg-dark text-light', onClick: handleWorkClick },
    working: { className: 'bg-primary text-white', onClick: handleWorkClick },
    finished: { className: 'bg-success text-white' },
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

  return { tableItems, rowStates, rowStateAccessor };
}
