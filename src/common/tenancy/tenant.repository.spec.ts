import { ClsModule, ClsService } from 'nestjs-cls';
import { Test } from '@nestjs/testing';
import { EntityManager } from 'typeorm';
import { TenantBaseEntity } from './tenant.entity';
import { TenantRepository } from './tenant.repository';
import { loginAs } from './test-factories';
import { MissingOrganizationError } from './request-context';

class Row extends TenantBaseEntity {
  name: string;
}

describe('TenantRepository', () => {
  let cls: ClsService;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [ClsModule.forRoot({ global: true })],
    }).compile();
    cls = moduleRef.get(ClsService);
  });

  it('fails closed when the request has no organization', async () => {
    const repository = new TenantRepository(Row, {} as EntityManager);
    expect(() => cls.run(() => repository.createQueryBuilder('row'))).toThrow(MissingOrganizationError);
  });

  it('soft-deletes by id and organization', async () => {
    const criteria: unknown[] = [];
    const manager = {
      softDelete: async (_entity: unknown, where: unknown) => {
        criteria.push(where);
        return { affected: 1 };
      },
    } as unknown as EntityManager;
    const repository = new TenantRepository(Row, manager);

    await cls.run(async () => {
      loginAs(cls, { organizationId: 9, userId: 3 });
      await expect(repository.softDeleteById(15)).resolves.toBe(true);
    });

    expect(criteria).toEqual([{ id: 15, organizationId: 9 }]);
  });
});
