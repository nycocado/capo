import {
  columnsCutList,
  columnsPipeLengthDto,
  columnsAssemblyList,
  columnsWeld,
} from "@components/features/WorkTable/WorkTable.columns";
import * as React from "react";
import { Column } from "@components/features/WorkTable/WorkTable";
import { TAB_TYPES, TabType } from "@components/features/WorkTabs";

export interface SearchFieldConfig {
  id: string;
  label: string;
  accessor: keyof any | ((item: any) => React.ReactNode);
}

// Função para extrair campos de busca das configurações das colunas
function extractSearchableFields(columns: Column<any>[]): SearchFieldConfig[] {
  return columns
    .filter((col) => col.searchable === true) // Só campos marcados como searchable
    .map((col) => ({
      id: col.id,
      label: col.header,
      accessor: col.accessor,
    }));
}

// Configurações de campos de busca por tipo de conteúdo
export const searchFieldConfigs = {
  cutList: extractSearchableFields(columnsCutList),
  pipeLength: extractSearchableFields(columnsPipeLengthDto),
  assemblyList: extractSearchableFields(columnsAssemblyList),
  weld: extractSearchableFields(columnsWeld),
};

// Mapeamento de tabs para configurações de busca por contexto/página
export const tabSearchFieldMapping = {
  // Para página de Cut
  cut: {
    [TAB_TYPES.ALL]: searchFieldConfigs.cutList,
    [TAB_TYPES.WORKING]: searchFieldConfigs.pipeLength,
  },
  // Para página de Assembly
  assembly: {
    [TAB_TYPES.ALL]: searchFieldConfigs.assemblyList,
    [TAB_TYPES.WORKING]: searchFieldConfigs.assemblyList,
  },
  // Para página de Weld
  weld: {
    [TAB_TYPES.ALL]: searchFieldConfigs.weld,
    [TAB_TYPES.WORKING]: searchFieldConfigs.weld,
  },
};

// Função para obter campos de busca baseado no contexto e tab ativa
export function getSearchFields(
  context: keyof typeof tabSearchFieldMapping,
  activeTab: TabType,
): SearchFieldConfig[] {
  return tabSearchFieldMapping[context]?.[activeTab] || [];
}

// Função para obter o label de um campo de busca
export function getSearchFieldLabel(
  context: keyof typeof tabSearchFieldMapping,
  activeTab: TabType,
  fieldId: string,
): string {
  const fields = getSearchFields(context, activeTab);
  return fields.find((field) => field.id === fieldId)?.label || fieldId;
}
