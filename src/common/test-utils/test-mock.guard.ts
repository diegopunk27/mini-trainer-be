import { ExecutionContext, Injectable } from '@nestjs/common';
import { Observable } from 'rxjs';
import { MockUserService } from './mock-user.service';

@Injectable()
export class TestMockGuard {
  constructor(protected userService: MockUserService) {}

  canActivate(context: ExecutionContext): boolean | Observable<boolean> | Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    request.user = this.userService.getUser();
    return true;
  }
}
