import { AssemblyListDto } from "@/dtos";
import { TAB_TYPES, TabType } from "@components/features/factory/WorkTabs";
import { useMemo } from "react";

// Sort finished items to end of list
export const sortFinishedLast = (
  items: AssemblyListDto[],
  finishedIds: number[],
): AssemblyListDto[] => {
  return [...items].sort((a, b) => {
    const aFinished = finishedIds.includes(a.id);
    const bFinished = finishedIds.includes(b.id);
    if (aFinished && !bFinished) return 1;
    if (!aFinished && bFinished) return -1;
    return 0;
  });
};

// Filter items by search term
export const filterBySearch = (
  items: AssemblyListDto[],
  search: string,
): AssemblyListDto[] => {
  const searchTerm = search.replace(/^0+/, "");
  return items.filter(
    (item) =>
      item.internalId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.id.toString().includes(searchTerm),
  );
};

// Row state configurations for table
export const useRowStates = (
  activeTab: TabType,
  handleRowClick: (item: AssemblyListDto) => void,
) => {
  return useMemo(() => {
    const baseStates = {
      "to-do": {
        className: "bg-dark text-white",
        onClick: handleRowClick,
      },
      information: {
        className: "bg-tertiary text-white",
        onClick: handleRowClick,
      },
      working: {
        className: "bg-primary text-white",
        onClick: handleRowClick, // ✅ HABILITADO para permitir seleção
      },
      finished: {
        className: "bg-success text-white",
        onClick: handleRowClick, // ✅ HABILITADO para permitir seleção
      },
      danger: {
        className: "bg-danger text-white",
        // No onClick for danger state - blocks interaction
      },
    };

    // CORREÇÃO: Assembly permite seleção em TODOS os estados na tab ALL
    // Diferente do Cut que desabilita por segurança
    return baseStates;
  }, [activeTab, handleRowClick]);
};
