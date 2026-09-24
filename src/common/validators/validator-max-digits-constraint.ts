import {
  ValidationArguments,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
  registerDecorator,
} from 'class-validator';

@ValidatorConstraint({ name: 'maxDigits' })
export class MaxDigitsConstraint implements ValidatorConstraintInterface {
  validate(value: number, args: ValidationArguments): boolean {
    const [max] = args.constraints as [number];
    return typeof value === 'number' && value.toString().length <= max;
  }

  defaultMessage(args: ValidationArguments): string {
    const [max] = args.constraints as [number];
    return `El número de dígitos no puede exceder ${max} caracteres`;
  }
}

export function maxDigits(max: number, validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string): void {
    registerDecorator({
      name: 'maxDigits',
      target: (object as { constructor: new (...args: unknown[]) => unknown }).constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [max],
      validator: MaxDigitsConstraint,
    });
  };
}
