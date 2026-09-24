export function parseWorkItemId(value, prefix = 'MT') {
  if (typeof value === 'number' && Number.isInteger(value) && value > 0) return value;
  const text = String(value ?? '').trim();
  const prefixed = new RegExp(`^${prefix}-(\\d+)$`, 'i');
  const match = text.match(prefixed) || text.match(/^(\d+)$/);
  if (!match) throw new Error(`Invalid work item id: ${value}`);
  return Number(match[1]);
}

export function publicId(number, prefix = 'MT') {
  return `${prefix}-${number}`;
}
