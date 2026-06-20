import type { QueryKey } from "@tanstack/react-query";
import type { Identifiable } from "@/domain/logic/upsertById";
import type { tabSearchFieldMapping } from "@components/features/ControlPanel/ControlPanel.searchConfig";

export type StageListItem = Identifiable;

export type StageContext = keyof typeof tabSearchFieldMapping;

export interface WorkStageConfig<TList extends StageListItem> {
  context: StageContext;
  queryKey: QueryKey;
  fetchList: () => Promise<TList[]>;
  fetchById: (id: number) => Promise<TList>;
  claim: (id: number) => Promise<TList>;
  release: (id: number) => Promise<TList>;
  ws: { route: string; eventNames: string[] };
}
