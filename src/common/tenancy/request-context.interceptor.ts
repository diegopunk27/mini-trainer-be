import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { ClsService } from 'nestjs-cls';
import { Observable } from 'rxjs';
import { randomUUID } from 'node:crypto';
import { REQUEST_CONTEXT_KEY, RequestContext } from './request-context';

interface AuthenticatedRequest {
  user?: {
    id?: number;
    sub?: number;
    aud?: RequestContext['audience'];
    org?: number;
    mid?: number;
    cid?: number;
    perms?: string[];
  };
  headers?: Record<string, string | string[] | undefined>;
}

@Injectable()
export class RequestContextInterceptor implements NestInterceptor {
  constructor(private readonly cls: ClsService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const user = request.user;
    const header = request.headers?.['x-request-id'];
    const requestId = (Array.isArray(header) ? header[0] : header) || randomUUID();
    const stored: RequestContext = {
      userId: user?.id ?? user?.sub,
      audience: user?.aud,
      organizationId: user?.org,
      memberId: user?.mid,
      clientId: user?.cid,
      permissions: user?.perms ?? [],
      requestId,
    };
    this.cls.set(REQUEST_CONTEXT_KEY, stored);
    return next.handle();
  }
}
