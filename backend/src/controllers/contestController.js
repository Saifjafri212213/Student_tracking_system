import https from 'https';

// In-memory cache for live Codeforces contests to avoid rate limits
let cfCache = {
  data: [],
  lastFetched: 0
};
const CACHE_TTL_MS = 10 * 60 * 1000; // 10 minutes

/**
 * Fetch upcoming contests from Codeforces API
 */
function fetchCodeforcesContests() {
  return new Promise((resolve) => {
    const now = Date.now();
    if (cfCache.data.length > 0 && now - cfCache.lastFetched < CACHE_TTL_MS) {
      return resolve(cfCache.data);
    }

    const req = https.get('https://codeforces.com/api/contest.list?gym=false', { timeout: 4000 }, (res) => {
      let raw = '';
      res.on('data', chunk => raw += chunk);
      res.on('end', () => {
        try {
          const parsed = JSON.parse(raw);
          if (parsed.status === 'OK' && Array.isArray(parsed.result)) {
            const nowSec = Math.floor(Date.now() / 1000);
            const upcoming = parsed.result
              .filter(c => c.phase === 'BEFORE' || (c.phase === 'CODING' && c.startTimeSeconds + c.durationSeconds > nowSec))
              .map(c => ({
                id: `cf-${c.id}`,
                platform: 'codeforces',
                name: c.name,
                startTime: c.startTimeSeconds * 1000,
                durationMinutes: Math.floor(c.durationSeconds / 60),
                url: `https://codeforces.com/contests/${c.id}`,
                status: c.phase === 'CODING' ? 'LIVE' : 'UPCOMING'
              }))
              .sort((a, b) => a.startTime - b.startTime)
              .slice(0, 6);

            cfCache = { data: upcoming, lastFetched: Date.now() };
            return resolve(upcoming);
          }
        } catch (e) {
          // parse error
        }
        resolve(getFallbackCodeforces());
      });
    });

    req.on('error', () => resolve(getFallbackCodeforces()));
    req.on('timeout', () => {
      req.destroy();
      resolve(getFallbackCodeforces());
    });
  });
}

function getFallbackCodeforces() {
  const nextFriday = getNextDayOfWeek(5, 14, 35); // Friday 14:35 UTC
  const nextTuesday = getNextDayOfWeek(2, 14, 35); // Tuesday 14:35 UTC
  return [
    {
      id: 'cf-fallback-1',
      platform: 'codeforces',
      name: 'Codeforces Round (Div. 2)',
      startTime: nextTuesday.getTime(),
      durationMinutes: 120,
      url: 'https://codeforces.com/contests',
      status: 'UPCOMING'
    },
    {
      id: 'cf-fallback-2',
      platform: 'codeforces',
      name: 'Educational Codeforces Round (Div. 2)',
      startTime: nextFriday.getTime(),
      durationMinutes: 120,
      url: 'https://codeforces.com/contests',
      status: 'UPCOMING'
    }
  ];
}

/**
 * Helper to calculate next upcoming day of week at specific UTC time
 * @param {number} dayOfWeek 0=Sun, 1=Mon, ..., 6=Sat
 * @param {number} hourUTC
 * @param {number} minuteUTC
 */
function getNextDayOfWeek(dayOfWeek, hourUTC, minuteUTC) {
  const now = new Date();
  const result = new Date();
  result.setUTCHours(hourUTC, minuteUTC, 0, 0);
  let daysToAdd = (dayOfWeek - result.getUTCDay() + 7) % 7;
  if (daysToAdd === 0 && result <= now) {
    daysToAdd = 7;
  }
  result.setUTCDate(result.getUTCDate() + daysToAdd);
  return result;
}

/**
 * Generate regular recurring LeetCode contests
 */
function getLeetCodeContests() {
  const nextWeekly = getNextDayOfWeek(0, 2, 30); // Sunday 08:00 AM IST / 02:30 UTC
  const nextBiweekly = getNextDayOfWeek(6, 14, 30); // Saturday 08:00 PM IST / 14:30 UTC
  
  // Approximate contest numbers based on date
  const baseWeek = Math.floor((nextWeekly.getTime() - new Date('2024-01-07').getTime()) / (7 * 24 * 3600 * 1000));
  const weeklyNum = 380 + Math.max(0, baseWeek);
  const biweeklyNum = 120 + Math.max(0, Math.floor(baseWeek / 2));

  return [
    {
      id: `lc-weekly-${weeklyNum}`,
      platform: 'leetcode',
      name: `Weekly Contest ${weeklyNum}`,
      startTime: nextWeekly.getTime(),
      durationMinutes: 90,
      url: 'https://leetcode.com/contest/',
      status: 'UPCOMING'
    },
    {
      id: `lc-biweekly-${biweeklyNum}`,
      platform: 'leetcode',
      name: `Biweekly Contest ${biweeklyNum}`,
      startTime: nextBiweekly.getTime(),
      durationMinutes: 90,
      url: 'https://leetcode.com/contest/',
      status: 'UPCOMING'
    }
  ];
}

/**
 * Generate regular CodeChef contests
 */
function getCodeChefContests() {
  const nextStarters = getNextDayOfWeek(3, 14, 30); // Wednesday 08:00 PM IST / 14:30 UTC
  const baseStarters = Math.floor((nextStarters.getTime() - new Date('2024-01-03').getTime()) / (7 * 24 * 3600 * 1000));
  const startersNum = 120 + Math.max(0, baseStarters);

  return [
    {
      id: `cc-starters-${startersNum}`,
      platform: 'codechef',
      name: `Starters ${startersNum} (Div. 1, 2, 3 & 4)`,
      startTime: nextStarters.getTime(),
      durationMinutes: 120,
      url: 'https://www.codechef.com/contests',
      status: 'UPCOMING'
    }
  ];
}

export const contestController = {
  /**
   * GET /api/contests
   * Returns unified upcoming and live contest calendar
   */
  async getUpcomingContests(req, res) {
    try {
      const [cfContests, lcContests, ccContests] = await Promise.all([
        fetchCodeforcesContests(),
        Promise.resolve(getLeetCodeContests()),
        Promise.resolve(getCodeChefContests())
      ]);

      const all = [...cfContests, ...lcContests, ...ccContests]
        .sort((a, b) => a.startTime - b.startTime);

      res.json({
        total: all.length,
        contests: all
      });
    } catch (err) {
      console.error('Error fetching contests:', err.message);
      res.status(500).json({ error: 'Failed to retrieve contest schedules' });
    }
  }
};

