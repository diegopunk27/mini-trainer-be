import { applyDecorators, Type } from '@nestjs/common';
import { ApiExtraModels, ApiOkResponse, getSchemaPath } from '@nestjs/swagger';
import { ListResponseDto } from '@persistence/index';

export const ApplySwaggerPaginationResponse = <DataDto extends Type<unknown>>(dataDto: DataDto): MethodDecorator =>
  applyDecorators(
    ApiExtraModels(ListResponseDto, dataDto),
    ApiOkResponse({
      schema: {
        allOf: [
          { $ref: getSchemaPath(ListResponseDto) },
          {
            properties: {
              results: {
                type: 'array',
                items: { $ref: getSchemaPath(dataDto) },
              },
            },
          },
        ],
      },
    }),
  );
