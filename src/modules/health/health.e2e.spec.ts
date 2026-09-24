import { INestApplication } from '@nestjs/common';
import { setupTestingApp } from '@config/app.config';
import { setupTestingModule } from '@testing/test.config';
import request from 'supertest';
import { HealthModule } from './health.module';

describe('Health (E2E)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const testing = await setupTestingModule({ modules: [HealthModule], mocks: [] });
    app = testing.testingModule.createNestApplication();
    setupTestingApp(app);
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('GET /health returns ok outside the version prefix', async () => {
    const response = await request(app.getHttpServer()).get('/health').expect(200);
    expect(response.body).toEqual({ status: 'ok' });
  });
});
