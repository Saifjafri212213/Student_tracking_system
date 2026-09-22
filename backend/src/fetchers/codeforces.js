import axios from 'axios';
import { rateLimiter } from '../rateLimiter.js';

const CF_BASE_URL = 'https://codeforces.com/api';

export async function fetchCodeforcesStats(handle) {
  if (!handle) return { handle: '', total_solved: 0, rating: 0 };

  return rateLimiter.schedule('codeforces', async () => {
    try {
      // 1. Fetch User Info
      const infoRes = await axios.get(`${CF_BASE_URL}/user.info?handles=${handle}`, {
        headers: { 'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)' },
        timeout: 15000
      });

      if (infoRes.data?.status !== 'OK' || !infoRes.data?.result?.[0]) {
        return { handle, total_solved: 0, rating: 0, error: 'User not found' };
      }

      const userInfo = infoRes.data.result[0];
      const rating = userInfo.rating || 0;
      const maxRating = userInfo.maxRating || 0;
      const rankTitle = userInfo.rank || 'unrated';
      const maxRank = userInfo.maxRank || 'unrated';

      // 2. Fetch Rating History for Recent Contest
      let recentContest = null;
      try {
        await new Promise((resolve) => setTimeout(resolve, 500));
        const ratingRes = await axios.get(`${CF_BASE_URL}/user.rating?handle=${handle}`, {
          headers: { 'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)' },
          timeout: 15000
        });

        if (ratingRes.data?.status === 'OK' && ratingRes.data?.result?.length > 0) {
          const contests = ratingRes.data.result;
          const latest = contests[contests.length - 1];
          const oldR = latest.oldRating || 0;
          const newR = latest.newRating || 0;

          recentContest = {
            contest_name: latest.contestName || `Round #${latest.contestId}`,
            timestamp: latest.ratingUpdateTimeSeconds || 0,
            rank: latest.rank || 0,
            old_rating: oldR,
            new_rating: newR,
            rating_delta: newR - oldR
          };
        }
      } catch (rErr) {
        console.warn(`[Codeforces] Rating history warning for ${handle}:`, rErr.message);
      }

      // 3. Count Distinct Solved Problems
      const solvedProblems = new Set();
      try {
        await new Promise((resolve) => setTimeout(resolve, 500));
        const statusRes = await axios.get(`${CF_BASE_URL}/user.status?handle=${handle}&from=1&count=2000`, {
          headers: { 'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)' },
          timeout: 15000
        });

        if (statusRes.data?.status === 'OK') {
          const submissions = statusRes.data.result || [];
          for (const sub of submissions) {
            if (sub.verdict === 'OK') {
              const prob = sub.problem;
              if (prob?.contestId && prob?.index) {
                solvedProblems.add(`${prob.contestId}_${prob.index}`);
              } else if (prob?.name) {
                solvedProblems.add(prob.name);
              }
            }
          }
        }
      } catch (sErr) {
        console.warn(`[Codeforces] Status list warning for ${handle}:`, sErr.message);
      }

      return {
        handle,
        total_solved: solvedProblems.size,
        rating,
        max_rating: maxRating,
        rank_title: rankTitle,
        max_rank: maxRank,
        recent_contest: recentContest,
        last_synced_at: Date.now(),
        status: 'success'
      };
    } catch (err) {
      console.error(`[Codeforces] Error fetching user ${handle}:`, err.message);
      return { handle, total_solved: 0, rating: 0, error: err.message };
    }
  });
}
