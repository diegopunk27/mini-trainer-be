import { ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtGuard } from '../jwt.guard';
import { JWTPermissionsGuard } from './jwt-permissions.guard';

const createContext = (user?: { permissions?: string[] }): ExecutionContext =>
  ({
    getHandler: jest.fn(),
    getClass: jest.fn(),
    switchToHttp: () => ({
      getRequest: () => ({ user }),
    }),
  }) as unknown as ExecutionContext;

describe('JWTPermissionsGuard', () => {
  let jwtGuard: { canActivate: jest.Mock };
  let reflector: { getAllAndOverride: jest.Mock };
  let guard: JWTPermissionsGuard;

  beforeEach(() => {
    jwtGuard = { canActivate: jest.fn().mockResolvedValue(true) };
    reflector = { getAllAndOverride: jest.fn().mockReturnValue(undefined) };
    guard = new JWTPermissionsGuard(jwtGuard as unknown as JwtGuard, reflector as unknown as Reflector);
  });

  it('rejects unauthenticated requests', async () => {
    jwtGuard.canActivate.mockResolvedValue(false);
    await expect(guard.canActivate(createContext())).resolves.toBe(false);
  });

  it('allows authenticated requests when no permissions are required', async () => {
    await expect(guard.canActivate(createContext({ permissions: [] }))).resolves.toBe(true);
  });

  it('rejects users without the required permission', async () => {
    reflector.getAllAndOverride.mockReturnValue(['example:read']);
    await expect(guard.canActivate(createContext({ permissions: ['other:write'] }))).resolves.toBe(false);
  });

  it('allows users that hold at least one required permission', async () => {
    reflector.getAllAndOverride.mockReturnValue(['example:read', 'example:write']);
    await expect(guard.canActivate(createContext({ permissions: ['example:read'] }))).resolves.toBe(true);
  });

  it('rejects authenticated users without a permissions list', async () => {
    reflector.getAllAndOverride.mockReturnValue(['example:read']);
    await expect(guard.canActivate(createContext({}))).resolves.toBe(false);
  });
});
