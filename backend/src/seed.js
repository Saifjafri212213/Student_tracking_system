import { Leaderboard } from './models/Leaderboard.js';
import { Doubt } from './models/Doubt.js';
import { isDbConnected } from './config/db.js';

export const INITIAL_LEADERBOARD_SEED = {
  leetcode: [
    {
      uid: "stu_1",
      platform: "leetcode",
      fullName: "Aarav Sharma",
      rollNumber: "21BCSE101",
      branch: "CSE",
      academicYear: 4,
      handle: "aarav_cp",
      rating: 2180,
      total_solved: 720,
      stats: { easy_solved: 240, medium_solved: 360, hard_solved: 120, global_rank: 4320, attended_contests: 18 }
    },
    {
      uid: "stu_2",
      platform: "leetcode",
      fullName: "Priya Patel",
      rollNumber: "22BCSE042",
      branch: "CSE",
      academicYear: 3,
      handle: "priya_codes",
      rating: 1980,
      total_solved: 640,
      stats: { easy_solved: 200, medium_solved: 340, hard_solved: 100, global_rank: 11200, attended_contests: 12 }
    },
    {
      uid: "stu_3",
      platform: "leetcode",
      fullName: "Rohan Verma",
      rollNumber: "22BIT088",
      branch: "IT",
      academicYear: 3,
      handle: "rohan_v",
      rating: 1890,
      total_solved: 580,
      stats: { easy_solved: 180, medium_solved: 320, hard_solved: 80, global_rank: 18500, attended_contests: 9 }
    },
    {
      uid: "stu_4",
      platform: "leetcode",
      fullName: "Sneha Reddy",
      rollNumber: "23BAIDS015",
      branch: "AI/DS",
      academicYear: 2,
      handle: "sneha_r",
      rating: 1760,
      total_solved: 450,
      stats: { easy_solved: 150, medium_solved: 240, hard_solved: 60, global_rank: 34000, attended_contests: 7 }
    },
    {
      uid: "stu_5",
      platform: "leetcode",
      fullName: "Devansh Nair",
      rollNumber: "24BCSE210",
      branch: "CSE",
      academicYear: 1,
      handle: "dev_nair",
      rating: 1620,
      total_solved: 320,
      stats: { easy_solved: 160, medium_solved: 140, hard_solved: 20, global_rank: 58000, attended_contests: 5 }
    }
  ],
  codeforces: [
    {
      uid: "stu_1",
      platform: "codeforces",
      fullName: "Aarav Sharma",
      rollNumber: "21BCSE101",
      branch: "CSE",
      academicYear: 4,
      handle: "aarav_grandmaster",
      rating: 1940,
      total_solved: 490,
      stats: { rank_title: "Candidate Master" }
    },
    {
      uid: "stu_3",
      platform: "codeforces",
      fullName: "Rohan Verma",
      rollNumber: "22BIT088",
      branch: "IT",
      academicYear: 3,
      handle: "rohan_master",
      rating: 1820,
      total_solved: 420,
      stats: { rank_title: "Expert" }
    },
    {
      uid: "stu_2",
      platform: "codeforces",
      fullName: "Priya Patel",
      rollNumber: "22BCSE042",
      branch: "CSE",
      academicYear: 3,
      handle: "priya_cf",
      rating: 1750,
      total_solved: 380,
      stats: { rank_title: "Expert" }
    },
    {
      uid: "stu_4",
      platform: "codeforces",
      fullName: "Sneha Reddy",
      rollNumber: "23BAIDS015",
      branch: "AI/DS",
      academicYear: 2,
      handle: "sneha_ds",
      rating: 1560,
      total_solved: 290,
      stats: { rank_title: "Specialist" }
    },
    {
      uid: "stu_5",
      platform: "codeforces",
      fullName: "Devansh Nair",
      rollNumber: "24BCSE210",
      branch: "CSE",
      academicYear: 1,
      handle: "devansh_cf",
      rating: 1410,
      total_solved: 180,
      stats: { rank_title: "Specialist" }
    }
  ],
  codechef: [
    {
      uid: "stu_1",
      platform: "codechef",
      fullName: "Aarav Sharma",
      rollNumber: "21BCSE101",
      branch: "CSE",
      academicYear: 4,
      handle: "aarav_chef",
      rating: 2210,
      total_solved: 210,
      stats: { stars: 6, global_rank: 480 }
    },
    {
      uid: "stu_2",
      platform: "codechef",
      fullName: "Priya Patel",
      rollNumber: "22BCSE042",
      branch: "CSE",
      academicYear: 3,
      handle: "priya_cc",
      rating: 1920,
      total_solved: 180,
      stats: { stars: 5, global_rank: 1420 }
    },
    {
      uid: "stu_3",
      platform: "codechef",
      fullName: "Rohan Verma",
      rollNumber: "22BIT088",
      branch: "IT",
      academicYear: 3,
      handle: "rohan_7",
      rating: 1850,
      total_solved: 150,
      stats: { stars: 4, global_rank: 2850 }
    },
    {
      uid: "stu_4",
      platform: "codechef",
      fullName: "Sneha Reddy",
      rollNumber: "23BAIDS015",
      branch: "AI/DS",
      academicYear: 2,
      handle: "sneha_ai",
      rating: 1680,
      total_solved: 120,
      stats: { stars: 3, global_rank: 6400 }
    },
    {
      uid: "stu_5",
      platform: "codechef",
      fullName: "Devansh Nair",
      rollNumber: "24BCSE210",
      branch: "CSE",
      academicYear: 1,
      handle: "dev_cook",
      rating: 1540,
      total_solved: 90,
      stats: { stars: 3, global_rank: 11200 }
    }
  ]
};

export const INITIAL_DOUBTS_SEED = [
  {
    author_id: "stu_4",
    author_name: "Sneha Reddy",
    author_avatar: "https://api.dicebear.com/7.x/bottts/svg?seed=Sneha",
    title: "Optimizing 2D DP to 1D in 'Minimum Falling Path Sum' (LC 931)",
    tags: ["DP", "LeetCode", "C++"],
    description: "I have a working O(N*M) space DP solution using a matrix, but my solution is consuming too much cache memory. How can we reduce auxiliary space from O(N^2) to O(N) using rolling arrays?",
    code_lang: "cpp",
    code: `int minFallingPathSum(vector<vector<int>>& matrix) {
    int n = matrix.size();
    vector<vector<int>> dp = matrix;
    for(int i = 1; i < n; i++) {
        for(int j = 0; j < n; j++) {
            int left = (j > 0) ? dp[i-1][j-1] : 1e9;
            int mid = dp[i-1][j];
            int right = (j < n - 1) ? dp[i-1][j+1] : 1e9;
            dp[i][j] += min({left, mid, right});
        }
    }
    return *min_element(dp[n-1].begin(), dp[n-1].end());
}`,
    upvotes_count: 14,
    is_resolved: true,
    answers: [
      {
        author_id: "stu_1",
        author_name: "Aarav Sharma",
        content: "Since row `i` only depends on the previous row `i - 1`, maintain two 1D vectors `prev` and `curr` to reduce space to O(N).",
        code_lang: "cpp",
        code: `int minFallingPathSum(vector<vector<int>>& matrix) {
    int n = matrix.size();
    vector<int> prev = matrix[0];
    for(int i = 1; i < n; i++) {
        vector<int> curr(n);
        for(int j = 0; j < n; j++) {
            int l = (j > 0) ? prev[j-1] : 1e9;
            int m = prev[j];
            int r = (j < n - 1) ? prev[j+1] : 1e9;
            curr[j] = matrix[i][j] + min({l, m, r});
        }
        prev = curr;
    }
    return *min_element(prev.begin(), prev.end());
}`,
        upvotes_count: 18,
        is_accepted: true
      }
    ]
  },
  {
    author_id: "stu_5",
    author_name: "Devansh Nair",
    author_avatar: "https://api.dicebear.com/7.x/bottts/svg?seed=Devansh",
    title: "Fast I/O & avoiding TLE in Python 3 on Codeforces",
    tags: ["Python", "Codeforces"],
    description: "When processing 2*10^5 inputs on Codeforces, standard input() causes Time Limit Exceeded. What is the standard template for fast I/O?",
    code_lang: "python",
    code: `import sys\n\ndef solve():\n    input_data = sys.stdin.read().split()\n    if not input_data: return\n    # process data fast`,
    upvotes_count: 8,
    is_resolved: false,
    answers: []
  }
];

export async function seedInitialDataIfEmpty() {
  if (!isDbConnected()) return;

  try {
    for (const plat of ['leetcode', 'codeforces', 'codechef']) {
      const list = INITIAL_LEADERBOARD_SEED[plat] || [];
      for (const item of list) {
        const exists = await Leaderboard.findOne({ platform: plat, rollNumber: item.rollNumber });
        if (!exists) {
          await Leaderboard.create({ ...item, platform: plat });
        }
      }
    }

    const doubtsCount = await Doubt.countDocuments();
    if (doubtsCount === 0) {
      console.log('🌱 [MongoDB] Seeding initial doubts forum discussions...');
      await Doubt.insertMany(INITIAL_DOUBTS_SEED);
      console.log(`✅ [MongoDB] Inserted ${INITIAL_DOUBTS_SEED.length} forum discussions.`);
    }
  } catch (err) {
    console.warn('[MongoDB] Seeding warning:', err.message);
  }
}
