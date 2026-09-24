import { IsNull } from 'typeorm';
import { scopeSharedWhere } from './scope-shared-where';
import { scopeWhere } from './scope-where';

describe('scopeWhere', () => {
  it('adds the organization to an object and to every OR clause', () => {
    expect(scopeWhere({ name: 'Ana' }, 4)).toEqual({ name: 'Ana', organizationId: 4 });
    expect(scopeWhere([{ name: 'Ana' }, { name: 'Luis' }], 4)).toEqual([
      { name: 'Ana', organizationId: 4 },
      { name: 'Luis', organizationId: 4 },
    ]);
  });
});

describe('scopeSharedWhere', () => {
  it('keeps own rows and global rows', () => {
    expect(scopeSharedWhere({ name: 'Sentadilla' }, 4)).toEqual([
      { name: 'Sentadilla', organizationId: 4 },
      { name: 'Sentadilla', organizationId: IsNull() },
    ]);
  });
});
