import { Column } from 'typeorm';
import { BaseEntity } from '@persistence/entities/base.entity';

export abstract class TenantBaseEntity extends BaseEntity {
  @Column({ name: 'organization_id', type: 'int' })
  organizationId: number;
}
