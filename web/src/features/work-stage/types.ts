import type { QueryKey } from "@tanstack/react-query";
import type { Identifiable } from "@/domain/logic/upsertById";
import type { tabSearchFieldMapping } from "@components/features/ControlPanel/ControlPanel.searchConfig";

/**
 * Item de lista de etapa: identificável por id. Os campos derivados
 * (progress/available) e o claim (claimedBy/claimedAt) vivem no próprio DTO.
 */
export type StageListItem = Identifiable;

/** Contexto da etapa (define colunas/campos de busca por aba). */
export type StageContext = keyof typeof tabSearchFieldMapping;

/**
 * Contrato genérico de uma etapa (cut/assembly/weld) para o núcleo
 * {@link useWorkStage}: como buscar a lista, reivindicar/libertar o claim e
 * como sincronizá-la em tempo real.
 */
export interface WorkStageConfig<TList extends StageListItem> {
  /** Contexto usado pelos campos de busca e pelos labels da etapa. */
  context: StageContext;
  /** Query key da lista mantida em cache. */
  queryKey: QueryKey;
  /** Busca a lista no browser (queryFn da lista). */
  fetchList: () => Promise<TList[]>;
  /**
   * Busca o detalhe completo de uma ordem no browser (árvore completa com a
   * hierarquia de itens de trabalho).
   *
   * @param id Id da ordem.
   */
  fetchById: (id: number) => Promise<TList>;
  /** Reivindica (claim) uma ordem para o utilizador atual. */
  claim: (id: number) => Promise<TList>;
  /** Liberta (release) o claim de uma ordem. */
  release: (id: number) => Promise<TList>;
  /** Namespace e nomes de evento do gateway que revalidam o cache. */
  ws: { route: string; eventNames: string[] };
}
