import axios from 'axios';
import { rateLimiter } from '../rateLimiter.js';

const LEETCODE_GRAPHQL_URL = 'https://leetcode.com/graphql';

const LEETCODE_QUERY = `
query getUserData($username: String!) {
  matchedUser(username: $username) {
    username
    submitStatsGlobal {
      acSubmissionNum {
        difficulty
        count
      }
    }
  }
  userContestRanking(username: $username) {
    attendedContestsCount
    rating
    globalRanking
    topPercentage
  }
  userContestRankingHistory(username: $username) {
    attended
    rating
    ranking
    problemsSolved
    contest {
      title
      startTime
    }
  }
}
`;

export function sanitizeHandle(raw) {
  if (!raw || typeof raw !== 'string') return '';
  return raw
    .trim()
    .replace(/^https?:\/\/(www\.)?leetcode\.com\/(u\/)?/i, '')
    .replace(/\/.*$/, '')
    .replace(/^@+/, '')
    .trim();
}

export async function fetchLeetCodeStats(rawUsername) {
  const username = sanitizeHandle(rawUsername);
  if (!username) return { handle: '', total_solved: 0, rating: 0 };

  return rateLimiter.schedule('leetcode', async () => {
    try {
      const response = await axios.post(
        LEETCODE_GRAPHQL_URL,
        {
          query: LEETCODE_QUERY,
          variables: { username }
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'Referer': `https://leetcode.com/${username}/`,
            'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
          },
          timeout: 15000
        }
      );

      const data = response.data?.data;
      if (!data || !data.matchedUser) {
        return { handle: username, total_solved: 0, rating: 0, error: 'User not found or profile is private' };
      }

      const submissions = data.matchedUser.submitStatsGlobal?.acSubmissionNum || [];
      let easy = 0, medium = 0, hard = 0, total = 0;

      for (const item of submissions) {
        if (item.difficulty === 'All') total = item.count;
        else if (item.difficulty === 'Easy') easy = item.count;
        else if (item.difficulty === 'Medium') medium = item.count;
        else if (item.difficulty === 'Hard') hard = item.count;
      }

      const contestRanking = data.userContestRanking || {};
      const contestRating = Math.round((contestRanking.rating || 0) * 10) / 10;
      const rating = contestRating > 0 ? contestRating : 1500;
      const globalRank = contestRanking.globalRanking || 0;
      const attendedCount = contestRanking.attendedContestsCount || 0;
      const topPercentage = contestRanking.topPercentage || 0;

      // Recent contest
      const history = data.userContestRankingHistory || [];
      const attendedHistory = history.filter(c => c.attended && c.contest);
      let recentContest = null;

      if (attendedHistory.length > 0) {
        const latest = attendedHistory[attendedHistory.length - 1];
        const prevRating = attendedHistory.length >= 2 ? attendedHistory[attendedHistory.length - 2].rating : 1500;
        const currentRating = latest.rating;
        const delta = Math.round((currentRating - prevRating) * 10) / 10;

        recentContest = {
          contest_name: latest.contest.title || 'Weekly Contest',
          timestamp: latest.contest.startTime || 0,
          rank: latest.ranking || 0,
          problems_solved: latest.problemsSolved || 0,
          new_rating: Math.round(currentRating * 10) / 10,
          rating_delta: delta
        };
      }

      return {
        handle: username,
        easy_solved: easy,
        medium_solved: medium,
        hard_solved: hard,
        total_solved: total,
        rating,
        global_rank: globalRank,
        attended_contests: attendedCount,
        top_percentage: topPercentage,
        recent_contest: recentContest,
        last_synced_at: Date.now(),
        status: 'success'
      };
    } catch (err) {
      console.error(`[LeetCode] Error fetching user ${username}:`, err.message);
      return { handle: username, total_solved: 0, rating: 0, error: err.message };
    }
  });
}
