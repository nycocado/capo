/** Item identificável por `id` numérico — base das operações sobre listas em cache. */
export interface Identifiable {
  id: number;
}

/**
 * Substitui o item de mesmo `id` na lista ou, se ele não existir, acrescenta-o
 * ao fim. Não muta a lista recebida.
 *
 * @param list Lista atual.
 * @param item Item a inserir ou atualizar.
 * @returns Nova lista com o item inserido/atualizado.
 */
export function upsertById<T extends Identifiable>(list: T[], item: T): T[] {
  const index = list.findIndex((current) => current.id === item.id);
  if (index === -1) return [...list, item];
  const next = list.slice();
  next[index] = item;
  return next;
}

/**
 * Aplica {@link upsertById} para vários itens, preservando a ordem de chegada.
 *
 * @param list Lista atual.
 * @param items Itens a inserir/atualizar.
 * @returns Nova lista com todos os itens aplicados.
 */
export function upsertManyById<T extends Identifiable>(
  list: T[],
  items: T[],
): T[] {
  return items.reduce<T[]>((acc, item) => upsertById(acc, item), list);
}

/**
 * Substitui o item de mesmo `id`, sem acrescentar caso ele não exista — usado
 * para eventos de atualização, que não devem trazer itens novos para a lista.
 *
 * @param list Lista atual.
 * @param item Item atualizado.
 * @returns Nova lista com o item substituído, ou a mesma referência se ausente.
 */
export function replaceById<T extends Identifiable>(list: T[], item: T): T[] {
  let found = false;
  const next = list.map((current) => {
    if (current.id !== item.id) return current;
    found = true;
    return item;
  });
  return found ? next : list;
}
