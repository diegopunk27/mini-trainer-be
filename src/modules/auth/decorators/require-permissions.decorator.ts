import { SetMetadata } from '@nestjs/common';

export const ACTIONS_KEY = 'actions';

export const RequirePermissions = (...permissions: string[]): ReturnType<typeof SetMetadata> =>
  SetMetadata(ACTIONS_KEY, permissions);
