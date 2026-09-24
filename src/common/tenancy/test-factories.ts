import { ClsService } from 'nestjs-cls';
import { REQUEST_CONTEXT_KEY, RequestContext } from './request-context';

export interface OrgSeed {
  id: number;
  name: string;
  slug: string;
  timezone: string;
}

export function createOrg(overrides: Partial<OrgSeed> = {}): OrgSeed {
  return {
    id: 1,
    name: 'Estudio Demo',
    slug: 'estudio-demo',
    timezone: 'America/Argentina/Buenos_Aires',
    ...overrides,
  };
}

export function loginAs(cls: ClsService, context: Partial<RequestContext> & { organizationId: number }): void {
  cls.set(REQUEST_CONTEXT_KEY, {
    userId: 1,
    audience: 'pro',
    permissions: [],
    requestId: 'test-request',
    ...context,
  });
}
