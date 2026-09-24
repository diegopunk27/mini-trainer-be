import { ValidationArguments, ValidatorConstraint, ValidatorConstraintInterface } from 'class-validator';

@ValidatorConstraint({ name: 'notContainOnlyWhiteSpacesString', async: false })
export class NotContainOnlyWhiteSpacesStringConstraint implements ValidatorConstraintInterface {
  validate(text: string | null | undefined): boolean {
    if (text === undefined) {
      return true;
    }

    if (text === null) {
      return false;
    }

    return text.trim().length > 0;
  }

  defaultMessage(args: ValidationArguments): string {
    return `The field ${args.property} should not contain only white spaces`;
  }
}
