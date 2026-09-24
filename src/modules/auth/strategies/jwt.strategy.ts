import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { UserDto } from '../dtos/user.dto';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.getOrThrow<string>('JWT_SECRET'),
      issuer: configService.getOrThrow<string>('JWT_ISSUER'),
      audience: configService.getOrThrow<string>('JWT_AUDIENCE'),
    });
  }

  validate(payload: { sub: number; email: string; roleId: number; roleName: string; permissions?: string[] }): UserDto {
    return {
      id: payload.sub,
      email: payload.email,
      roleId: payload.roleId,
      roleName: payload.roleName,
      permissions: payload.permissions,
    };
  }
}
