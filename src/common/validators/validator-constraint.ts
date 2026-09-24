import { ValidatorConstraint, ValidatorConstraintInterface } from 'class-validator';

@ValidatorConstraint({ name: 'isPositiveNumberString', async: false })
export class IsPositiveNumberStringConstraint implements ValidatorConstraintInterface {
  validate(value: string): boolean {
    const numericValue = parseFloat(value);
    return !isNaN(numericValue) && numericValue > 0;
  }
}
