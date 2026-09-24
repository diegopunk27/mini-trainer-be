import { Injectable, ExecutionContext, CanActivate } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtGuard } from '../jwt.guard';
import { ACTIONS_KEY } from '../../decorators/require-permissions.decorator';

@Injectable()
export class JWTPermissionsGuard implements CanActivate {
  constructor(
    private jwtGuard: JwtGuard,
    private reflector: Reflector,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isAuthenticated = await this.jwtGuard.canActivate(context);
    if (!isAuthenticated) return false;

    const requiredPermissions = this.reflector.getAllAndOverride<string[]>(ACTIONS_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredPermissions || requiredPermissions.length === 0) return true;

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user?.permissions) return false;

    return requiredPermissions.some((permission) => user.permissions.includes(permission));
  }
}
