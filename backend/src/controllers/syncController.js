import { isDbConnected } from '../config/db.js';
import { Leaderboard } from '../models/Leaderboard.js';
import { fetchLeetCodeStats } from '../fetchers/leetcode.js';
import { fetchCodeforcesStats } from '../fetchers/codeforces.js';
import { fetchCodeChefStats } from '../fetchers/codechef.js';

export async function triggerSync(req, res) {
  const { platform } = req.params;
  const targetPlatforms = platform === 'all' 
    ? ['leetcode', 'codeforces', 'codechef'] 
    : [platform];

  try {
    const results = {};
    for (const plat of targetPlatforms) {
      if (!['leetcode', 'codeforces', 'codechef'].includes(plat)) continue;

      let syncedCount = 0;
      if (isDbConnected()) {
        const entries = await Leaderboard.find({ platform: plat }).lean();
        for (const entry of entries) {
          if (!entry.handle || !entry.handle.trim() || entry.handle === '—') continue;
          try {
            let stats = null;
            if (plat === 'leetcode') {
              stats = await fetchLeetCodeStats(entry.handle);
            } else if (plat === 'codeforces') {
              stats = await fetchCodeforcesStats(entry.handle);
            } else if (plat === 'codechef') {
              stats = await fetchCodeChefStats(entry.handle);
            }

            if (stats && !stats.error) {
              const rating = stats.rating || (plat === 'codeforces' ? 1200 : 1500);
              const total_solved = stats.total_solved || stats.totalSolved || 0;
              await Leaderboard.updateOne(
                { _id: entry._id },
                {
                  $set: {
                    rating,
                    total_solved,
                    lastSyncedAt: new Date(),
                    recent_contest: stats.recent_contest || entry.recent_contest
                  }
                }
              );
              syncedCount++;
            }
          } catch (fetchErr) {
            console.warn(`[SyncTrigger] Warning for ${plat}:${entry.handle}:`, fetchErr.message);
          }
        }
      }
      results[plat] = { synced: syncedCount };
    }

    res.json({
      message: `Sync completed for ${platform}`,
      results
    });
  } catch (err) {
    console.error('[SyncTrigger] Error:', err.message);
    res.status(500).json({ error: err.message });
  }
}

