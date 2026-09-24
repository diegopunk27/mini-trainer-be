const DEFAULT_INTERVAL_MS = 340;

export class ThrottledNotion {
  constructor(client, options = {}) {
    this.client = client;
    this.intervalMs = options.intervalMs ?? DEFAULT_INTERVAL_MS;
    this.sleep = options.sleep ?? ((ms) => new Promise((resolve) => setTimeout(resolve, ms)));
    this.now = options.now ?? Date.now;
    this.chain = Promise.resolve();
    this.nextAt = 0;
  }

  request(fn) {
    const run = async () => {
      const wait = Math.max(0, this.nextAt - this.now());
      this.nextAt = this.now() + wait + this.intervalMs;
      if (wait) await this.sleep(wait);
      return this.withRetry(fn);
    };
    const result = this.chain.then(run, run);
    this.chain = result.then(
      () => undefined,
      () => undefined,
    );
    return result;
  }

  async withRetry(fn, attempt = 0) {
    try {
      return await fn();
    } catch (error) {
      if (error?.status !== 429 || attempt >= 4) throw error;
      const header = error.headers?.get?.('retry-after') ?? error.headers?.['retry-after'];
      const seconds = Number(header);
      await this.sleep((Number.isFinite(seconds) && seconds > 0 ? seconds : 1) * 1000);
      return this.withRetry(fn, attempt + 1);
    }
  }
}

export function chunk(items, size) {
  const batches = [];
  for (let index = 0; index < items.length; index += size) {
    batches.push(items.slice(index, index + size));
  }
  return batches;
}
