import { applyDecorators } from '@nestjs/common';
import { Transform } from 'class-transformer';

/**
 * Normalizes a form-data field that should be a boolean.
 * Multipart/form-data delivers booleans as strings ('true'/'false').
 * Note: enableImplicitConversion alone is not sufficient because
 * Boolean('false') === true in JavaScript.
 */
export function ToBoolean(): PropertyDecorator {
  return applyDecorators(
    // Use obj[key] to get the original plain value before class-transformer's
    // implicit conversion runs Boolean('false') === true incorrectly
    Transform(({ value, obj, key }) => {
      const raw = obj && key in obj ? obj[key] : value;
      if (raw === 'true' || raw === '1') return true;
      if (raw === 'false' || raw === '0') return false;
      if (typeof raw === 'boolean') return raw;
      return value;
    }),
  );
}
