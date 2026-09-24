/* eslint-disable @typescript-eslint/no-explicit-any */
import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, ValidationOptions } from 'class-validator';

export function IsEnumSwagger(enumObject: Record<string, any>, validationOptions?: ValidationOptions) {
  return function (object: Record<string, any>, propertyName: string): void {
    IsEnum(enumObject, validationOptions)(object, propertyName);

    ApiProperty({
      enum: enumObject,
      enumName: Object.keys(enumObject)
        .filter((key) => isNaN(parseInt(key)))
        .join(', '),
      description: generateEnumDescription(enumObject),
    })(object, propertyName);
  };
}

function generateEnumDescription(enumObject: Record<string, any>): string {
  const enumKeys = Object.keys(enumObject).filter((key) => isNaN(parseInt(key)));
  const enumValues = enumKeys.map((key) => `${key}: ${enumObject[key]}`);
  return enumValues.join(', ');
}
