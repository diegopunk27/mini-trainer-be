import { join } from 'node:path';
import { collectRoutes, uncoveredRoutes } from './route-coverage';

describe('route coverage', () => {
  it('fails when a route is neither covered nor exempt', () => {
    const routes = collectRoutes(join(__dirname, '../..'));
    expect(uncoveredRoutes(routes)).toEqual([]);
    expect(routes).toContain('GET /health');
  });
});
