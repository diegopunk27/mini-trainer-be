// app.config.ts
import { INestApplication, RequestMethod, ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import helmet from 'helmet';

export const parseCorsOrigins = (value?: string): string[] =>
  (value ?? '')
    .split(',')
    .map((origin) => origin.trim())
    .filter((origin) => origin.length > 0);

export const setupApp = (app: INestApplication): void => {
  const httpAdapter = app.getHttpAdapter();
  const instance = httpAdapter.getInstance() as { set?: (key: string, value: string) => void };
  instance.set?.('query parser', 'extended');

  app.setGlobalPrefix('api/v1', { exclude: [{ path: 'health', method: RequestMethod.GET }] });
  app.use(helmet());
  app.enableCors({
    origin: parseCorsOrigins(process.env.CORS_ORIGINS),
    credentials: true,
  });
  setupSwagger(app);
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true, // Habilitar la transformación automática
      transformOptions: {
        enableImplicitConversion: true, // Habilitar la conversión implícita
      },
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  );
};

export const setupTestingApp = (app: INestApplication): void => {
  app.setGlobalPrefix('api/v1', { exclude: [{ path: 'health', method: RequestMethod.GET }] });
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true, // Habilitar la transformación automática
      transformOptions: {
        enableImplicitConversion: true, // Habilitar la conversión implícita
      },
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  );
};

const setupSwagger = (app: INestApplication): void => {
  const documentBuilder = new DocumentBuilder()
    .setTitle('Mini-Trainer API')
    .setDescription('API del SaaS de coaching fitness')
    .setVersion('1.0')
    .build();

  const document = SwaggerModule.createDocument(app, documentBuilder);
  SwaggerModule.setup('docs', app, document, {
    swaggerOptions: { defaultModelsExpandDepth: -1 },
  });
};
