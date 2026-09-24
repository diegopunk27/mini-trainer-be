import { applyDecorators } from '@nestjs/common';
import { Transform } from 'class-transformer';

/**
 * Validates a boolean field that can also be explicitly null.
 * Designed for multipart/form-data where null is serialized as an empty string.
 *
 * Accepted values:
 *   - true / 'true' / '1'  → true
 *   - null / '' / 'null'   → null
 *   - undefined            → skipped (field is optional)
 */
export function IsNullableBoolean(): PropertyDecorator {
  return applyDecorators(
    Transform(({ value }) => {
      if (value === '' || value === 'null' || value === null || value === undefined) return null;
      if (value === 'true' || value === '1' || value === true) return true;
      return value;
    }),
  );
}
