import type { QueryKey } from "@tanstack/react-query";
import type { WorkStatusDto } from "@/dtos";
import type { StageSocketEvent } from "@/lib/ws/useStageSocket";
import type { Identifiable } from "@/domain/logic/upsertById";
import type { tabSearchFieldMapping } from "@components/features/ControlPanel/ControlPanel.searchConfig";

/** Item de lista de etapa: identificável por id e com status de trabalho. */
export type StageListItem = Identifiable & { workStatus?: WorkStatusDto };

/** Contexto da etapa (define colunas/campos de busca por aba). */
export type StageContext = keyof typeof tabSearchFieldMapping;

/**
 * Contrato genérico de uma etapa (cut/assembly/weld) para o núcleo
 * {@link useWorkStage}: como buscar/avançar a lista e como sincronizá-la em
 * tempo real.
 */
export interface WorkStageConfig<TList extends StageListItem> {
  /** Contexto usado pelos campos de busca e pelos labels da etapa. */
  context: StageContext;
  /** Query key da lista mantida em cache. */
  queryKey: QueryKey;
  /** Busca a lista "to-do" no browser (queryFn da lista). */
  fetchToDo: () => Promise<TList[]>;
  /** Marca uma lista como "working". */
  setWorking: (id: number) => Promise<TList>;
  /** Namespace e eventos do gateway para sincronizar o cache. */
  ws: { route: string; events: StageSocketEvent<TList>[] };
}
