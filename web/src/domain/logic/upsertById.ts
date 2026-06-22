export interface Identifiable {
  id: number;
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
