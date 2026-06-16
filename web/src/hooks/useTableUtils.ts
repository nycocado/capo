import { useMemo } from "react";
import { Column } from "@components/features/WorkTable/WorkTable";
import { RowStateConfig } from "@components/features/WorkTable/WorkTableRow";
import { TabType } from "@components/features/WorkTabs";

/**
 * Reordena a lista mantendo os itens finished no final, preservando a ordem
 * relativa dos demais.
 *
 * @param items Lista original.
 * @param finishedIds Ids dos itens em estado finished.
 */
export const sortFinishedLast = <T extends { id: number }>(
  items: T[],
  finishedIds: number[],
): T[] => {
  return [...items].sort((a, b) => {
    const aFinished = finishedIds.includes(a.id);
    const bFinished = finishedIds.includes(b.id);
    if (aFinished && !bFinished) return 1;
    if (!aFinished && bFinished) return -1;
    return 0;
  });
};

/**
 * Filtra uma lista pelo texto de busca no campo indicado, usando o accessor
 * da coluna quando disponível ou acesso por caminho pontilhado como fallback.
 *
 * @param items Lista a filtrar.
 * @param search Texto de busca; retorna a lista intacta se vazio.
 * @param searchField Id do campo/coluna de busca (padrão: "id").
 * @param columns Definições de coluna com accessors tipados.
 */
export const filterBySearch = <T>(
  items: T[],
  search: string,
  searchField: string = "id",
  columns?: Column<T>[],
): T[] => {
  if (!search) return items;
  const lowerSearch = search.toLowerCase();
  const column = columns?.find((col) => col.id === searchField);

  return items.filter((item) => {
    let value: unknown;
    if (column) {
      value =
        typeof column.accessor === "function"
          ? column.accessor(item)
          : item[column.accessor];
    } else {
      // Acesso por caminho pontilhado (ex.: "isometric.internalId")
      value = searchField
        .split(".")
        .reduce<unknown>(
          (obj, key) => (obj as Record<string, unknown> | undefined)?.[key],
          item,
        );
    }
    return String(value ?? "")
      .toLowerCase()
      .includes(lowerSearch);
  });
};

export interface PaginationOptions {
  page: number; // 1-based
  pageSize: number;
}

export const paginate = <T,>(items: T[], { page, pageSize }: PaginationOptions) => {
  if (!pageSize || pageSize <= 0) return { items, totalPages: 1, total: items.length };
  const total = items.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const p = Math.min(Math.max(1, page), totalPages);
  const start = (p - 1) * pageSize;
  const end = start + pageSize;
  return { items: items.slice(start, end), totalPages, total };
};

/** Pipeline de transformações compostas em sequência sobre uma lista. */
export type TableTransform<T> = (data: T[]) => T[];

export const composeTransforms = <T>(...transforms: TableTransform<T>[]) => {
  return (data: T[]) => transforms.reduce((acc, fn) => fn(acc), data);
};

export const makeSearchTransform =
  <T>(
    search: string,
    searchField: string,
    columns?: Column<T>[],
  ): TableTransform<T> =>
  (data) =>
    filterBySearch(data, search, searchField, columns);

export const makeSortFinishedLastTransform = <T extends { id: number }>(
  finishedIds: number[],
): TableTransform<T> => (data) => sortFinishedLast(data, finishedIds);

/**
 * Produz o mapa memoizado de estados de linha para o WorkTable/WorkTableRow,
 * associando cada estado a uma classe CSS e ao handler de clique.
 *
 * @param activeTab Aba ativa (usada para compor a chave de memoização via handleRowClick).
 * @param handleRowClick Handler chamado ao clicar em qualquer linha clicável.
 * @param customStates Estados adicionais ou sobrepostos ao conjunto padrão.
 */
export const useRowStates = <T>(
  activeTab: TabType,
  handleRowClick: (item: T) => void,
  customStates?: Record<string, RowStateConfig<T>>,
) => {
  return useMemo(() => {
    return {
      initial: {
        className: "bg-secondary text-white",
        onClick: handleRowClick,
      },
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
        onClick: handleRowClick,
      },
      finished: {
        className: "bg-success text-white",
        // Clique sempre permitido; a implementação específica decide a ação.
        onClick: handleRowClick,
      },
      danger: {
        className: "bg-danger text-white",
        onClick: undefined,
      },
      ...customStates,
    };
  }, [handleRowClick, customStates]);
};
