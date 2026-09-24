import { NotContainOnlyWhiteSpacesStringConstraint } from '../validator-string-only-white-spaces';

describe('NotContainOnlyWhiteSpacesStringConstraint', () => {
  it('should return true when the string is non-empty', () => {
    const constraint = new NotContainOnlyWhiteSpacesStringConstraint();
    const result = constraint.validate('  Hello, World!  ');
    expect(result).toBe(true);
  });
  it('should return false when the string contains only spaces', () => {
    const constraint = new NotContainOnlyWhiteSpacesStringConstraint();
    const result = constraint.validate('     ');
    expect(result).toBe(false);
  });
  it('should return true when the string is undefined', () => {
    const constraint = new NotContainOnlyWhiteSpacesStringConstraint();
    const result = constraint.validate(undefined);
    expect(result).toBe(true);
  });
  it('should return false when the string is null', () => {
    const constraint = new NotContainOnlyWhiteSpacesStringConstraint();
    const result = constraint.validate(null);
    expect(result).toBe(false);
  });
});
