import { applyDecorators } from '@nestjs/common';
import { ApiBody, ApiConsumes } from '@nestjs/swagger';

interface ApiFileUploadOptions {
  additionalProperties?: Record<string, unknown>;
}

/**
 * Custom decorator for file upload endpoints that combines ApiConsumes and ApiBody
 * @param options Additional properties for the schema
 */
export function apiFileUpload(options?: ApiFileUploadOptions): MethodDecorator & ClassDecorator {
  const additionalProperties = options?.additionalProperties || {};

  return applyDecorators(
    ApiConsumes('multipart/form-data'),
    ApiBody({
      schema: {
        type: 'object',
        properties: {
          files: {
            type: 'array',
            items: {
              type: 'string',
              format: 'binary',
            },
          },
          ...additionalProperties,
        },
      },
    }),
  );
}
