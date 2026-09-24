import { resolveJwtExpiresInSeconds } from '@common/helpers/jwt-expires.helper';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { JwtStrategy } from './strategies/jwt.strategy';
import { JwtGuard } from './guards/jwt.guard';
import { JWTPermissionsGuard } from './guards/jwt-permissions-guard/jwt-permissions.guard';

@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => {
        const issuer = configService.get<string>('JWT_ISSUER');
        const audience = configService.get<string>('JWT_AUDIENCE');
        return {
          secret: configService.get<string>('JWT_SECRET'),
          signOptions: {
            issuer,
            audience,
            expiresIn: resolveJwtExpiresInSeconds(configService.get<string>('JWT_EXPIRES_IN')),
          },
          verifyOptions: {
            issuer,
            audience,
          },
        };
      },
      inject: [ConfigService],
    }),
  ],
  providers: [JwtStrategy, JwtGuard, JWTPermissionsGuard],
  exports: [JwtGuard, JWTPermissionsGuard, PassportModule, JwtModule],
})
export class AuthModule {}
