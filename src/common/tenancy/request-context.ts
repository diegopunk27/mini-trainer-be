import { ClsServiceManager } from 'nestjs-cls';

export const REQUEST_CONTEXT_KEY = 'REQUEST_CONTEXT';

export type Audience = 'pro' | 'client';

export interface RequestContext {
  userId?: number;
  audience?: Audience;
  organizationId?: number;
  memberId?: number;
  clientId?: number;
  permissions: string[];
  requestId: string;
}

export class MissingOrganizationError extends Error {
  constructor() {
    super('Organization context is required');
    this.name = 'MissingOrganizationError';
  }
}

export function getRequestContext(): RequestContext | undefined {
  try {
    const cls = ClsServiceManager.getClsService();
    if (!cls.isActive()) {
      return undefined;
    }
    return cls.get<RequestContext>(REQUEST_CONTEXT_KEY);
  } catch {
    return undefined;
  }
}

export function requireOrganizationId(): number {
  const organizationId = getRequestContext()?.organizationId;
  if (organizationId == null) {
    throw new MissingOrganizationError();
  }
  return organizationId;
}

export function requireUserId(): number | undefined {
  return getRequestContext()?.userId;
}
