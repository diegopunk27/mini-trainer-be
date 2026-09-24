export function getEnumOptions<T extends object>(enumObject: T): T {
  const enumKeys = Object.keys(enumObject).filter((key) => isNaN(parseInt(key)));
  const enumObj: Record<string, unknown> = {};
  enumKeys.forEach((x) => {
    enumObj[x] = (enumObject as Record<string, unknown>)[x];
  });
  return enumObj as T;
}
