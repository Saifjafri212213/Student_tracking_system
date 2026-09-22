/**
 * Platform-Isolated Ranking Engine
 * Calculates independent, separate leaderboards for LeetCode, Codeforces, and CodeChef.
 * Preserves academicYear (1-4) for year-wise cohort ranking and filtering.
 */

export class RankingEngine {
  /**
   * Computes independent rankings for a specific platform's users.
   * @param {Array} users List of user documents containing platform stats
   * @param {string} platform 'leetcode' | 'codeforces' | 'codechef'
   * @returns {Array} List of student records with dedicated questions_rank and rating_rank
   */
  static rankPlatform(users, platform) {
    if (!Array.isArray(users)) return [];

    // Process users for this platform
    const validUsers = users
      .map((u) => {
        if (!u) return null;
        const pData = u.platforms?.[platform] || {};
        const handle = pData.handle || u.handles?.[platform] || u.handle || '';

        // Parse academicYear as integer (1, 2, 3, 4)
        let acadYear = u.academicYear;
        if (!acadYear && u.year) {
          acadYear = parseInt(u.year, 10) || 3;
        } else if (!acadYear && (u.roll_number || u.rollNumber || u.college_id)) {
          const roll = u.roll_number || u.rollNumber || u.college_id || '';
          if (roll.length >= 2) {
            const adm = parseInt(roll.substring(0, 2), 10);
            const curr = new Date().getFullYear() % 100;
            acadYear = Math.max(1, Math.min(4, curr - adm + 1));
          }
        }

        const totalSolved = pData.total_solved ?? u.total_solved ?? u.totalSolved ?? 0;
        const rating = pData.rating ?? u.rating ?? (platform === 'codeforces' ? 1200 : 1500);

        return {
          uid: u.uid || u.id || ('user_' + (u.rollNumber || u.college_id || Date.now())),
          display_name: u.display_name || u.fullName || u.name || 'Student',
          fullName: u.fullName || u.display_name || u.name || 'Student',
          college_id: u.college_id || u.rollNumber || u.roll_number || '',
          rollNumber: u.rollNumber || u.roll_number || u.college_id || '',
          branch: u.branch || 'CSE',
          academicYear: Number(acadYear) || 3,
          year: `${acadYear || 3}${(acadYear === 1) ? 'st' : ((acadYear === 2) ? 'nd' : ((acadYear === 3) ? 'rd' : 'th'))}`,
          platform,
          handle,
          total_solved: totalSolved,
          rating: rating,
          stats: pData,
          recent_contest: pData.recent_contest || u.recent_contest || {
            contest_name: 'No recent contest',
            timestamp: 0,
            rank: 0,
            rating_delta: 0,
            new_rating: rating
          },
          last_synced_at: pData.last_synced_at || u.lastSyncedAt || 0
        };
      })
      .filter(Boolean);

    if (validUsers.length === 0) return [];

    // 1. Assign Rating Rank
    validUsers.sort((a, b) => {
      if (b.rating !== a.rating) return (b.rating || 0) - (a.rating || 0);
      return (b.recent_contest?.rating_delta || 0) - (a.recent_contest?.rating_delta || 0);
    });
    validUsers.forEach((stu, idx) => {
      stu.rating_rank = idx + 1;
    });

    // 2. Assign Questions Solved Rank
    const sortedByQuestions = [...validUsers].sort((a, b) => {
      if (b.total_solved !== a.total_solved) return (b.total_solved || 0) - (a.total_solved || 0);
      return (b.rating || 0) - (a.rating || 0);
    });
    
    const questionRankMap = new Map();
    sortedByQuestions.forEach((stu, idx) => {
      questionRankMap.set(stu.uid, idx + 1);
    });

    validUsers.forEach((stu) => {
      stu.questions_rank = questionRankMap.get(stu.uid);
    });

    return validUsers;
  }

  /**
   * Sorts and re-ranks a filtered subset (e.g. year-wise cohort) for display
   * @param {Array} rankedUsers 
   * @param {'rating' | 'questions' | 'solved'} subTab 
   */
  static sortPlatformView(rankedUsers, subTab = 'rating') {
    if (!Array.isArray(rankedUsers)) return [];

    let sorted;
    if (subTab === 'questions' || subTab === 'solved') {
      sorted = [...rankedUsers].sort((a, b) => (b.total_solved || 0) - (a.total_solved || 0));
    } else {
      sorted = [...rankedUsers].sort((a, b) => {
        if (b.rating !== a.rating) return (b.rating || 0) - (a.rating || 0);
        return (b.recent_contest?.rating_delta || 0) - (a.recent_contest?.rating_delta || 0);
      });
    }

    // Assign cohort ranks within this filtered slice
    sorted.forEach((stu, idx) => {
      stu.cohort_rank = idx + 1;
      stu.rank = idx + 1;
    });

    return sorted;
  }
}
