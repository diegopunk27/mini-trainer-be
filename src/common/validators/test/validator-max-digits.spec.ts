import { validate } from 'class-validator';
import { maxDigits } from '../validator-max-digits-constraint';

class TestDto {
  @maxDigits(5)
  myNumber: number;
}

describe('MaxDigits Decorator', () => {
  it('should validate correctly for valid numbers', async () => {
    const dto = new TestDto();
    dto.myNumber = 12345;
    const errors = await validate(dto);
    expect(errors.length).toBe(0);
  });

  it('should return an error for invalid numbers', async () => {
    const dto = new TestDto();
    dto.myNumber = 123456;
    const errors = await validate(dto);
    expect(errors.length).toBe(1);
  });
});
