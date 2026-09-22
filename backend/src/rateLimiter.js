import { config } from './config.js';

class RateLimiter {
  constructor() {
    this.lastRequestTimes = {
      leetcode: 0,
      codeforces: 0,
      codechef: 0
    };
    this.queues = {
      leetcode: Promise.resolve(),
      codeforces: Promise.resolve(),
      codechef: Promise.resolve()
    };
  }

  /**
   * Schedules a task in the platform's sequential queue ensuring minDelayMs between executions.
   */
  async schedule(platform, fn) {
    const minDelayMs = config.delays[platform] || 1000;

    if (!this.queues[platform]) {
      this.queues[platform] = Promise.resolve();
      this.lastRequestTimes[platform] = 0;
    }

    // Chain task to the isolated platform queue
    const task = this.queues[platform].then(async () => {
      const now = Date.now();
      const elapsed = now - this.lastRequestTimes[platform];
      if (elapsed < minDelayMs) {
        const waitTime = minDelayMs - elapsed;
        await new Promise((resolve) => setTimeout(resolve, waitTime));
      }
      this.lastRequestTimes[platform] = Date.now();
      return fn();
    });

    this.queues[platform] = task.catch(() => {});
    return task;
  }
}

export const rateLimiter = new RateLimiter();
