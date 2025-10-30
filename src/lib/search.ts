// lib/search.ts
export function filterList<T extends Record<string, any>>(list: T[], search: string) {
  const term = search.toLowerCase();
  return list.filter((item) =>
    Object.values(item).some((val) =>
      String(val).toLowerCase().includes(term)
    )
  );
}