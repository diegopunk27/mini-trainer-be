import { UserDto } from '@auth';
import { Injectable } from '@nestjs/common';

@Injectable()
export class MockUserService {
  user: UserDto;

  setUser(user: UserDto): void {
    this.user = user;
  }

  getUser(): UserDto {
    return this.user;
  }
}
