type Where<T> = Record<string, unknown> | Array<Record<string, unknown>> | undefined;

export function scopeWhere<T>(where: Where<T>, organizationId: number): Where<T> {
  if (Array.isArray(where)) {
    if (where.length === 0) {
      return [{ organizationId }];
    }
    return where.map((clause) => ({ ...clause, organizationId }));
  }
  return { ...(where ?? {}), organizationId };
}
