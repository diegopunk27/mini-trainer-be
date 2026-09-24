import { buildDataSourceOptions } from './database.helper';

describe('buildDataSourceOptions', () => {
  it('uses postgres as the only engine', () => {
    const options = buildDataSourceOptions({ entities: [] });

    expect(options.type).toBe('postgres');
    expect(options.port).toBe(5432);
    expect(options.username).toBe('postgres');
  });

  it('keeps TYPEORM synchronize off unless the caller enables it', () => {
    expect(buildDataSourceOptions({ entities: [] }).synchronize).toBe(false);
    expect(buildDataSourceOptions({ entities: [], synchronize: true }).synchronize).toBe(true);
  });
});
