import React from "react";
import { TabType } from "@components/features/factory/WorkTabs";
import { tabSearchFieldMapping } from "./ControlPanel.searchConfig";

export interface ControlButtonConfig {
  variant: string;
  label: string;
  onClick?: () => void;
  className?: string;
  style?: React.CSSProperties;
}

export interface ControlPanelProps {
  search: string;
  setSearch: (value: string) => void;
  buttons: ControlButtonConfig[];
  searchField: string;
  setSearchField: (value: string) => void;
  activeTab: TabType;
  context: keyof typeof tabSearchFieldMapping;
}
