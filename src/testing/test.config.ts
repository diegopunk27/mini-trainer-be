import { Test, TestingModule } from '@nestjs/testing';
import { AppTestingModule } from './app.testing.module';
import { Provider, Type } from '@nestjs/common';
import { TestMockGuard } from '@common/test-utils/test-mock.guard';
import { MockUserService } from '@common/test-utils/mock-user.service';
import { JwtGuard } from '@auth';
import { JwtAuthGuard } from '@auth';
import { JWTPermissionsGuard } from '@auth';

interface TestingModuleUtils {
  testingModule: TestingModule;
  mockUserService: MockUserService;
}

export async function setupTestingModule(config: {
  modules: Type<unknown>[];
  mocks: { provide: Provider; useValue: unknown }[];
}): Promise<TestingModuleUtils> {
  const mockUserService = new MockUserService();
  const moduleBuilder = Test.createTestingModule({
    imports: [AppTestingModule.register(config.modules)],
  });
  const mockGuard = new TestMockGuard(mockUserService);

  // Aplicar mocks personalizados
  config.mocks.forEach((mock) => {
    moduleBuilder.overrideProvider(mock.provide).useValue(mock.useValue);
  });

  // Mockear guards automáticamente
  moduleBuilder.overrideGuard(JwtGuard).useValue(mockGuard);
  moduleBuilder.overrideGuard(JwtAuthGuard).useValue(mockGuard);
  moduleBuilder.overrideGuard(JWTPermissionsGuard).useValue(mockGuard);

  const testingModule = await moduleBuilder.compile();
  return { testingModule, mockUserService };
}
