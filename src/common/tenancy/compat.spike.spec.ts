import { ClsModule } from 'nestjs-cls';
import PgBoss from 'pg-boss';

describe('phase 0e compatibility spike', () => {
  it('loads pg-boss and nestjs-cls on this runtime', () => {
    expect(typeof PgBoss).toBe('function');
    expect(ClsModule.forRoot).toEqual(expect.any(Function));
    expect(process.version.startsWith('v24.')).toBe(true);
  });
});
