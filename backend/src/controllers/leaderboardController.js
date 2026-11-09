import { isDbConnected } from '../config/db.js';
import { Leaderboard } from '../models/Leaderboard.js';
import { INITIAL_LEADERBOARD_SEED } from '../seed.js';

export async function getLeaderboard(req, res) {
  const { platform } = req.params;
  const sortParam = req.query.sort || req.query.metric || 'rating';
  const branch = req.query.branch || 'ALL';
  const yearQuery = req.query.year || 'ALL';

  if (!['leetcode', 'codeforces', 'codechef'].includes(platform)) {
    return res.status(400).json({ error: "Invalid platform. Must be 'leetcode', 'codeforces', or 'codechef'." });
  }

  const sortField = (sortParam === 'questions' || sortParam === 'solved') ? 'total_solved' : 'rating';

  try {
    let records = [];

    if (isDbConnected()) {
      // Build MongoDB query
      const filter = { platform };

      if (yearQuery && yearQuery !== 'ALL') {
        const parsedYear = parseInt(yearQuery, 10);
        if (!isNaN(parsedYear)) {
          filter.$or = [{ academicYear: parsedYear }, { academicYear: String(parsedYear) }];
        }
      }

      if (branch && branch !== 'ALL') {
        filter.branch = branch;
      }

      // Execute indexed MongoDB query
      records = await Leaderboard.find(filter)
        .sort({ [sortField]: -1 })
        .limit(100)
        .lean();
    }

    // Seamless in-memory fallback if MongoDB is in offline mode
    if (!records || records.length === 0) {
      const baseSeed = INITIAL_LEADERBOARD_SEED[platform] || [];
      records = baseSeed.filter(r => {
        if (yearQuery !== 'ALL' && r.academicYear !== parseInt(yearQuery, 10)) return false;
        if (branch !== 'ALL' && r.branch !== branch) return false;
        return true;
      });
      records.sort((a, b) => (b[sortField] || 0) - (a[sortField] || 0));
    }

    // Attach ranks
    records = records.map((r, idx) => ({
      ...r,
      rank: idx + 1
    }));

    return res.json({
      platform,
      sort: sortParam,
      year: yearQuery,
      branch,
      total_records: records.length,
      data: records
    });

  } catch (err) {
    console.error(`[Leaderboard:${platform}] Query error:`, err.message);
    res.status(500).json({ error: err.message });
  }
}

