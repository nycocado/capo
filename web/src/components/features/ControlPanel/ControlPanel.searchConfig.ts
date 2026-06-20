import {
  columnsCutList,
  columnsPipeLengthDto,
  columnsAssemblyList,
  columnsWeldList,
} from "@components/features/WorkTable/WorkTable.columns";
import * as React from "react";
import { Column } from "@components/features/WorkTable/WorkTable";
import { TAB_TYPES, TabType } from "@components/features/WorkTabs";

export interface SearchFieldConfig {
  id: string;
  label: string;
  accessor: PropertyKey | ((item: never) => React.ReactNode);
}

function extractSearchableFields<T>(columns: Column<T>[]): SearchFieldConfig[] {
  return columns
    .filter((col) => col.searchable === true)
    .map((col) => ({
      id: col.id,
      label: col.header,
      accessor: col.accessor,
    }));
}

export const searchFieldConfigs = {
  cutList: extractSearchableFields(columnsCutList),
  pipeLength: extractSearchableFields(columnsPipeLengthDto),
  assemblyList: extractSearchableFields(columnsAssemblyList),
  weld: extractSearchableFields(columnsWeldList),
};

export const tabSearchFieldMapping = {
  cut: {
    [TAB_TYPES.ALL]: searchFieldConfigs.cutList,
    [TAB_TYPES.WORKING]: searchFieldConfigs.pipeLength,
  },
  assembly: {
    [TAB_TYPES.ALL]: searchFieldConfigs.assemblyList,
    [TAB_TYPES.WORKING]: searchFieldConfigs.assemblyList,
  },
  weld: {
    [TAB_TYPES.ALL]: searchFieldConfigs.weld,
    [TAB_TYPES.WORKING]: searchFieldConfigs.weld,
  },
};

export function getSearchFields(
  context: keyof typeof tabSearchFieldMapping,
  activeTab: TabType,
): SearchFieldConfig[] {
  return tabSearchFieldMapping[context]?.[activeTab] || [];
}

export function getSearchFieldLabel(
  context: keyof typeof tabSearchFieldMapping,
  activeTab: TabType,
  fieldId: string,
): string {
  const fields = getSearchFields(context, activeTab);
  return fields.find((field) => field.id === fieldId)?.label || fieldId;
}
