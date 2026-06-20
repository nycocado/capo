export interface Identifiable {
  id: number;
}

export function upsertById<T extends Identifiable>(list: T[], item: T): T[] {
  const index = list.findIndex((current) => current.id === item.id);
  if (index === -1) return [...list, item];
  const next = list.slice();
  next[index] = item;
  return next;
}

export function upsertManyById<T extends Identifiable>(
  list: T[],
  items: T[],
): T[] {
  return items.reduce<T[]>((acc, item) => upsertById(acc, item), list);
}

export function replaceById<T extends Identifiable>(list: T[], item: T): T[] {
  let found = false;
  const next = list.map((current) => {
    if (current.id !== item.id) return current;
    found = true;
    return item;
  });
  return found ? next : list;
}
