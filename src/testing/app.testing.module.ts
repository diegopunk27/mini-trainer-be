import { CqrsModule } from '@cqrs';
import { DynamicModule, Module, Type } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ReadCacheModule } from '../common/cache/read-cache.module';
import { TypeOrmConfigTestingService } from './typeorm-testing-config.service';
import { validateEnv } from '@config/env.schema';

@Module({})
export class AppTestingModule {
  static register(modules: Type<unknown>[]): DynamicModule {
    return {
      module: AppTestingModule,
      imports: [
        ConfigModule.forRoot({
          isGlobal: true,
          envFilePath: '.env.testing',
          load: [(): NodeJS.ProcessEnv => process.env],
          validate: validateEnv,
        }),
        TypeOrmModule.forRootAsync({
          imports: [ConfigModule],
          useClass: TypeOrmConfigTestingService,
        }),
        CqrsModule,
        ReadCacheModule,
        ...modules,
      ],
      controllers: [],
      providers: [],
    };
  }
}
