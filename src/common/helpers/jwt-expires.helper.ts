export const resolveJwtExpiresInSeconds = (value?: string): number => {
  if (!value) {
    return 604800;
  }
  if (/^\d+$/.test(value)) {
    return Number(value);
  }
  const match = /^(\d+)([smhd])$/.exec(value);
  if (!match) {
    return 604800;
  }
  const amount = Number(match[1]);
  const unit = match[2];
  if (unit === 's') {
    return amount;
  }
  if (unit === 'm') {
    return amount * 60;
  }
  if (unit === 'h') {
    return amount * 3600;
  }
  return amount * 86400;
};
