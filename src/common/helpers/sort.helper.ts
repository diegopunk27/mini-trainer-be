export interface SortResolution {
  column: string;
  order: 'ASC' | 'DESC';
}

/**
 * Evita inyección en ORDER BY: solo columnas de la whitelist se aceptan.
 */
export const resolveSort = (
  sortBy: string | undefined,
  sortOrder: 'ASC' | 'DESC' | undefined,
  whitelist: readonly string[],
  fallback: SortResolution,
): SortResolution => {
  const order: 'ASC' | 'DESC' = sortOrder === 'ASC' || sortOrder === 'DESC' ? sortOrder : fallback.order;
  const column = sortBy && whitelist.includes(sortBy) ? sortBy : fallback.column;
  return { column, order };
};

export const resolvePagination = (page?: number, limit?: number): { page: number; limit: number } => {
  const safePage = page && page > 0 ? page : 1;
  const safeLimit = limit && limit > 0 ? Math.min(limit, 100) : 10;
  return { page: safePage, limit: safeLimit };
};
