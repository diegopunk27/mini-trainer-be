// main.ts
import { config } from 'dotenv';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { setupApp } from './config/app.config';
import { validateEnv } from './config/env.schema';

async function bootstrap(): Promise<void> {
  config();
  validateEnv(process.env);
  const app = await NestFactory.create(AppModule);
  setupApp(app);
  await app.listen(process.env.PORT!);
}

bootstrap();
