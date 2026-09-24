import { ApiProperty } from '@nestjs/swagger';

/**
 * Standard paginated payload used by list endpoints and Swagger.
 */
export class ListResponseDto<T> {
  @ApiProperty({ isArray: true })
  results: T[];

  @ApiProperty()
  count: number;

  @ApiProperty()
  page: number;

  @ApiProperty()
  limit: number;
}
