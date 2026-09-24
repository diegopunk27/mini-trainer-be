import { applyDecorators } from '@nestjs/common';
import { Transform } from 'class-transformer';

/**
 * Normalizes a form-data field that should be an array.
 * Multer delivers a single-value field as a plain string, not an array.
 * This decorator wraps strings into a single-element array so that
 * class-validator's @IsArray() and related validators work correctly.
 */
export function ToArray(): PropertyDecorator {
  return applyDecorators(
    Transform(({ value }) => {
      if (value === null || value === undefined) return value;
      return Array.isArray(value) ? value : [value];
    }),
  );
}
