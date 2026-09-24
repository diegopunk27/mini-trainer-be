/**
 * Postgres + TypeORM devuelve `numeric` como string. Sin este transformer
 * los totales se concatenan ("10" + "5" = "105") en vez de sumarse.
 */
export class ColumnNumericTransformer {
  to(value: number | null | undefined): number | null {
    if (value === null || value === undefined) {
      return null;
    }
    return value;
  }

  from(value: string | number | null | undefined): number | null {
    if (value === null || value === undefined || value === '') {
      return null;
    }
    if (typeof value === 'number') {
      return value;
    }
    const parsed = Number(value);
    return Number.isNaN(parsed) ? null : parsed;
  }
}

export const columnNumericTransformer = new ColumnNumericTransformer();
