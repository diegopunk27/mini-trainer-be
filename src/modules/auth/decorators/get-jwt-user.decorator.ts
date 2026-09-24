import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { UserDto } from '../dtos/user.dto';

export const GetJWTUser = createParamDecorator((_data: unknown, ctx: ExecutionContext): UserDto => {
  const request = ctx.switchToHttp().getRequest();
  return request.user;
});
