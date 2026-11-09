// ==========================================================================
// Firebase Configuration and Modular SDK Initialization
// ==========================================================================
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { 
    getAuth, 
    signInWithEmailAndPassword, 
    createUserWithEmailAndPassword, 
    signOut, 
    onAuthStateChanged,
    updatePassword,
    reauthenticateWithCredential,
    EmailAuthProvider
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { 
    getFirestore, 
    collection, 
    doc, 
    setDoc, 
    getDoc, 
    getDocs, 
    addDoc, 
    updateDoc, 
    query, 
    where, 
    orderBy, 
    onSnapshot, 
    serverTimestamp,
    increment
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// REPLACE WITH YOUR FIREBASE PROJECT CONFIGURATION:
const firebaseConfig = {
    apiKey: "AIzaSyYOUR_API_KEY_HERE",
    authDomain: "your-college-cp.firebaseapp.com",
    projectId: "your-college-cp",
    storageBucket: "your-college-cp.appspot.com",
    messagingSenderId: "1234567890",
    appId: "1:1234567890:web:abcdef123456"
};

let app, auth, db;
let isMockMode = false;

try {
    if (firebaseConfig.apiKey !== "AIzaSyYOUR_API_KEY_HERE") {
        app = initializeApp(firebaseConfig);
        auth = getAuth(app);
        db = getFirestore(app);
        console.log("⚡ Firebase Initialized with Live Project.");
    } else {
        throw new Error("Placeholder API keys found. Enabling local interactive demo mode.");
    }
} catch (e) {
    console.warn("⚠️ Using interactive local platform store:", e.message);
    isMockMode = true;
}

// Platform-Specific Isolated Mock Datasets
export const MOCK_PLATFORM_DATA = {
    leetcode: [
        {
            uid: "stu_1",
            display_name: "Aarav Sharma",
            college_id: "21BCSE101",
            branch: "CSE",
            year: "4th",
            handle: "aarav_cp",
            rating: 2180,
            rating_rank: 1,
            total_solved: 720,
            questions_rank: 1,
            stats: {
                easy_solved: 240,
                medium_solved: 360,
                hard_solved: 120,
                global_rank: 4320,
                attended_contests: 18,
                top_percentage: 1.2
            },
            recent_contest: {
                contest_name: "Weekly Contest 412",
                timestamp: 1725200000,
                rank: 310,
                new_rating: 2180,
                rating_delta: 64
            }
        },
        {
            uid: "stu_2",
            display_name: "Priya Patel",
            college_id: "22BCSE042",
            branch: "CSE",
            year: "3rd",
            handle: "priya_codes",
            rating: 1980,
            rating_rank: 2,
            total_solved: 640,
            questions_rank: 2,
            stats: {
                easy_solved: 200,
                medium_solved: 340,
                hard_solved: 100,
                global_rank: 11200,
                attended_contests: 12,
                top_percentage: 3.5
            },
            recent_contest: {
                contest_name: "Biweekly Contest 138",
                timestamp: 1724800000,
                rank: 640,
                new_rating: 1980,
                rating_delta: 42
            }
        },
        {
            uid: "stu_3",
            display_name: "Rohan Verma",
            college_id: "22BIT088",
            branch: "IT",
            year: "3rd",
            handle: "rohan_v",
            rating: 1890,
            rating_rank: 3,
            total_solved: 580,
            questions_rank: 3,
            stats: {
                easy_solved: 180,
                medium_solved: 320,
                hard_solved: 80,
                global_rank: 18500,
                attended_contests: 9,
                top_percentage: 6.2
            },
            recent_contest: {
                contest_name: "Weekly Contest 411",
                timestamp: 1724600000,
                rank: 920,
                new_rating: 1890,
                rating_delta: 28
            }
        },
        {
            uid: "stu_4",
            display_name: "Sneha Reddy",
            college_id: "23BAIDS015",
            branch: "AI/DS",
            year: "2nd",
            handle: "sneha_r",
            rating: 1760,
            rating_rank: 4,
            total_solved: 450,
            questions_rank: 4,
            stats: {
                easy_solved: 150,
                medium_solved: 240,
                hard_solved: 60,
                global_rank: 34000,
                attended_contests: 7,
                top_percentage: 12.0
            },
            recent_contest: {
                contest_name: "Weekly Contest 410",
                timestamp: 1724000000,
                rank: 1450,
                new_rating: 1760,
                rating_delta: 35
            }
        },
        {
            uid: "stu_5",
            display_name: "Devansh Nair",
            college_id: "24BCSE210",
            branch: "CSE",
            year: "1st",
            handle: "dev_nair",
            rating: 1620,
            rating_rank: 5,
            total_solved: 320,
            questions_rank: 5,
            stats: {
                easy_solved: 160,
                medium_solved: 140,
                hard_solved: 20,
                global_rank: 58000,
                attended_contests: 5,
                top_percentage: 22.0
            },
            recent_contest: {
                contest_name: "Biweekly Contest 137",
                timestamp: 1723500000,
                rank: 2100,
                new_rating: 1620,
                rating_delta: 18
            }
        }
    ],
    codeforces: [
        {
            uid: "stu_1",
            display_name: "Aarav Sharma",
            college_id: "21BCSE101",
            branch: "CSE",
            year: "4th",
            handle: "aarav_grandmaster",
            rating: 1940,
            rating_rank: 1,
            total_solved: 490,
            questions_rank: 1,
            stats: {
                max_rating: 1980,
                rank_title: "Candidate Master",
                max_rank: "Candidate Master"
            },
            recent_contest: {
                contest_name: "Codeforces Round 950 (Div. 2)",
                timestamp: 1725300000,
                rank: 84,
                old_rating: 1848,
                new_rating: 1940,
                rating_delta: 92
            }
        },
        {
            uid: "stu_3",
            display_name: "Rohan Verma",
            college_id: "22BIT088",
            branch: "IT",
            year: "3rd",
            handle: "rohan_master",
            rating: 1820,
            rating_rank: 2,
            total_solved: 420,
            questions_rank: 2,
            stats: {
                max_rating: 1850,
                rank_title: "Expert",
                max_rank: "Expert"
            },
            recent_contest: {
                contest_name: "Codeforces Round 949 (Div. 2)",
                timestamp: 1725000000,
                rank: 190,
                old_rating: 1765,
                new_rating: 1820,
                rating_delta: 55
            }
        },
        {
            uid: "stu_2",
            display_name: "Priya Patel",
            college_id: "22BCSE042",
            branch: "CSE",
            year: "3rd",
            handle: "priya_cf",
            rating: 1750,
            rating_rank: 3,
            total_solved: 380,
            questions_rank: 3,
            stats: {
                max_rating: 1790,
                rank_title: "Expert",
                max_rank: "Expert"
            },
            recent_contest: {
                contest_name: "Educational Round 166",
                timestamp: 1724500000,
                rank: 340,
                old_rating: 1715,
                new_rating: 1750,
                rating_delta: 35
            }
        },
        {
            uid: "stu_4",
            display_name: "Sneha Reddy",
            college_id: "23BAIDS015",
            branch: "AI/DS",
            year: "2nd",
            handle: "sneha_ds",
            rating: 1560,
            rating_rank: 4,
            total_solved: 290,
            questions_rank: 4,
            stats: {
                max_rating: 1590,
                rank_title: "Specialist",
                max_rank: "Specialist"
            },
            recent_contest: {
                contest_name: "Codeforces Round 948 (Div. 3)",
                timestamp: 1724200000,
                rank: 420,
                old_rating: 1515,
                new_rating: 1560,
                rating_delta: 45
            }
        },
        {
            uid: "stu_5",
            display_name: "Devansh Nair",
            college_id: "24BCSE210",
            branch: "CSE",
            year: "1st",
            handle: "devansh_cf",
            rating: 1410,
            rating_rank: 5,
            total_solved: 180,
            questions_rank: 5,
            stats: {
                max_rating: 1430,
                rank_title: "Specialist",
                max_rank: "Specialist"
            },
            recent_contest: {
                contest_name: "Codeforces Round 946 (Div. 3)",
                timestamp: 1723800000,
                rank: 890,
                old_rating: 1385,
                new_rating: 1410,
                rating_delta: 25
            }
        }
    ],
    codechef: [
        {
            uid: "stu_1",
            display_name: "Aarav Sharma",
            college_id: "21BCSE101",
            branch: "CSE",
            year: "4th",
            handle: "aarav_chef",
            rating: 2210,
            rating_rank: 1,
            total_solved: 210,
            questions_rank: 1,
            stats: {
                stars: 6,
                global_rank: 480
            },
            recent_contest: {
                contest_name: "Starters 148 (Div. 1)",
                timestamp: 1725100000,
                rank: 64,
                old_rating: 2132,
                new_rating: 2210,
                rating_delta: 78
            }
        },
        {
            uid: "stu_2",
            display_name: "Priya Patel",
            college_id: "22BCSE042",
            branch: "CSE",
            year: "3rd",
            handle: "priya_cc",
            rating: 1920,
            rating_rank: 2,
            total_solved: 180,
            questions_rank: 2,
            stats: {
                stars: 5,
                global_rank: 1420
            },
            recent_contest: {
                contest_name: "Starters 147 (Div. 2)",
                timestamp: 1724700000,
                rank: 110,
                old_rating: 1870,
                new_rating: 1920,
                rating_delta: 50
            }
        },
        {
            uid: "stu_3",
            display_name: "Rohan Verma",
            college_id: "22BIT088",
            branch: "IT",
            year: "3rd",
            handle: "rohan_7",
            rating: 1850,
            rating_rank: 3,
            total_solved: 150,
            questions_rank: 3,
            stats: {
                stars: 4,
                global_rank: 2850
            },
            recent_contest: {
                contest_name: "Starters 146 (Div. 2)",
                timestamp: 1724100000,
                rank: 240,
                old_rating: 1810,
                new_rating: 1850,
                rating_delta: 40
            }
        },
        {
            uid: "stu_4",
            display_name: "Sneha Reddy",
            college_id: "23BAIDS015",
            branch: "AI/DS",
            year: "2nd",
            handle: "sneha_ai",
            rating: 1680,
            rating_rank: 4,
            total_solved: 120,
            questions_rank: 4,
            stats: {
                stars: 3,
                global_rank: 6400
            },
            recent_contest: {
                contest_name: "Starters 145 (Div. 3)",
                timestamp: 1723600000,
                rank: 380,
                old_rating: 1635,
                new_rating: 1680,
                rating_delta: 45
            }
        },
        {
            uid: "stu_5",
            display_name: "Devansh Nair",
            college_id: "24BCSE210",
            branch: "CSE",
            year: "1st",
            handle: "dev_cook",
            rating: 1540,
            rating_rank: 5,
            total_solved: 90,
            questions_rank: 5,
            stats: {
                stars: 3,
                global_rank: 11200
            },
            recent_contest: {
                contest_name: "Starters 144 (Div. 3)",
                timestamp: 1723100000,
                rank: 540,
                old_rating: 1510,
                new_rating: 1540,
                rating_delta: 30
            }
        }
    ]
};

export const MOCK_DOUBTS = [
    {
        id: "doubt_101",
        title: "Optimizing 2D DP to 1D in 'Minimum Falling Path Sum' (LC 931)",
        tags: ["DP", "LeetCode", "C++"],
        description: "I have a working O(N*M) space DP solution using a matrix, but my solution is consuming too much cache memory. How can we reduce auxiliary space from O(N^2) to O(N) using rolling arrays?",
        code_lang: "cpp",
        code: `// Current 2D DP Approach
int minFallingPathSum(vector<vector<int>>& matrix) {
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
        author_id: "stu_4",
        author_name: "Sneha Reddy",
        author_avatar: "https://api.dicebear.com/7.x/bottts/svg?seed=Sneha",
        upvotes_count: 14,
        is_resolved: true,
        created_at: Date.now() - 3600000 * 5,
        answers: [
            {
                id: "ans_201",
                author_id: "stu_1",
                author_name: "Aarav Sharma",
                author_avatar: "https://api.dicebear.com/7.x/bottts/svg?seed=Aarav",
                content: "Since row `i` only depends on the previous row `i - 1`, we can maintain two 1D vectors: `prev` and `curr`. This reduces space from O(N^2) to O(N). Here is the optimized C++ implementation:",
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
                is_accepted: true,
                created_at: Date.now() - 3600000 * 4
            }
        ]
    },
    {
        id: "doubt_102",
        title: "Fast I/O & avoiding TLE in Python 3 on Codeforces",
        tags: ["Python", "Codeforces"],
        description: "When processing 2*10^5 inputs on Codeforces, standard `input()` causes Time Limit Exceeded. What is the standard template for fast I/O in Python?",
        code_lang: "python",
        code: `# TLE code with standard input()
t = int(input())
for _ in range(t):
    arr = list(map(int, input().split()))
    print(sum(arr))`,
        author_id: "stu_5",
        author_name: "Devansh Nair",
        author_avatar: "https://api.dicebear.com/7.x/bottts/svg?seed=Devansh",
        upvotes_count: 8,
        is_resolved: false,
        created_at: Date.now() - 3600000 * 2,
        answers: [
            {
                id: "ans_202",
                author_id: "stu_3",
                author_name: "Rohan Verma",
                author_avatar: "https://api.dicebear.com/7.x/bottts/svg?seed=Rohan",
                content: "Use `sys.stdin.read().split()` to read all tokens in one syscall. It is 10x faster than reading line-by-line:",
                code_lang: "python",
                code: `import sys

def solve():
    input_data = sys.stdin.read().split()
    if not input_data:
        return
    # Process tokens directly
    sys.stdout.write('\\n'.join(results) + '\\n')`,
                upvotes_count: 9,
                is_accepted: false,
                created_at: Date.now() - 3600000 * 1
            }
        ]
    }
];

export { 
    auth, 
    db, 
    isMockMode, 
    signInWithEmailAndPassword, 
    createUserWithEmailAndPassword, 
    signOut, 
    onAuthStateChanged,
    updatePassword,
    reauthenticateWithCredential,
    EmailAuthProvider,
    collection, 
    doc, 
    setDoc, 
    getDoc, 
    getDocs, 
    addDoc, 
    updateDoc, 
    query, 
    where, 
    orderBy, 
    onSnapshot, 
    serverTimestamp,
    increment 
};
