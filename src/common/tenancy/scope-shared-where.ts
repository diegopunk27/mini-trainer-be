import { IsNull } from 'typeorm';

type Clause = Record<string, unknown>;

export function scopeSharedWhere(where: Clause | Clause[] | undefined, organizationId: number): Clause[] {
  const clauses = Array.isArray(where) ? where : [where ?? {}];
  const source = clauses.length === 0 ? [{}] : clauses;
  return source.flatMap((clause) => [
    { ...clause, organizationId },
    { ...clause, organizationId: IsNull() },
  ]);
}
