# CodeRank &middot; Platform-Isolated College CP Leaderboards

A campus competitive programming platform with isolated, independent leaderboards for **LeetCode**, **Codeforces**, and **CodeChef**, powered by Node.js, `node-cron` background schedulers, and Cloud Firestore.

---

## 🏛️ System Architecture

```
                                  ┌────────────────────────────────────────┐
                                  │         External CP Platforms          │
                                  │  • LeetCode (GraphQL API)              │
                                  │  • Codeforces (Official REST API)      │
                                  │  • CodeChef (HTML Cheerio Scraper)     │
                                  └────────────────────────────────────────┘
                                                      ▲
                                                      │ Isolated Delays / Queues
                                                      │ (1 req / 2s on CF, etc.)
                                                      ▼
┌─────────────────────────┐       ┌────────────────────────────────────────┐
│   Frontend Web App      │       │      Node.js Backend & Cron Worker     │
│   (HTML5, CSS3, JS)     │◄─────►│  • LeetCode Cron   (2:00 AM)           │
│  • [LeetCode Tab]       │Fetch  │  • Codeforces Cron (3:00 AM)           │
│  • [Codeforces Tab]     │Active │  • CodeChef Cron   (4:00 AM)           │
│  • [CodeChef Tab]       │Only   │  • `src/rankingEngine.js`              │
│  • Doubt Forum & Auth   │       │  • `src/server.js` (Express API)       │
└─────────────────────────┘       └────────────────────────────────────────┘
             ▲                                        │
             │ Firebase Client SDK                    │ Admin SDK Batch Writes
             ▼                                        ▼
┌──────────────────────────────────────────────────────────────────────────┐
│                         Cloud Firestore Database                         │
│  • users/{id}: Nested `platforms.leetcode`, `platforms.codeforces`, etc. │
│  • leaderboard_leetcode/{id}: Dedicated indexed collection               │
│  • leaderboard_codeforces/{id}: Dedicated indexed collection             │
│  • leaderboard_codechef/{id}: Dedicated indexed collection               │
│  • doubts/{id}: Q&A threads with code formatting and upvotes             │
└──────────────────────────────────────────────────────────────────────────┘
```

---

## 🗄️ Firebase NoSQL Schema (JSON Structure)

### 1. `users/{userId}` (Nested Platform Objects)
```json
{
  "uid": "stu_21BCSE101",
  "display_name": "Aarav Sharma",
  "college_id": "21BCSE101",
  "branch": "CSE",
  "year": "4th",
  "platforms": {
    "leetcode": {
      "handle": "aarav_cp",
      "total_solved": 720,
      "easy_solved": 240,
      "medium_solved": 360,
      "hard_solved": 120,
      "rating": 2180.0,
      "global_rank": 4320,
      "attended_contests": 18,
      "recent_contest": {
        "contest_name": "Weekly Contest 412",
        "timestamp": 1725200000,
        "rank": 310,
        "new_rating": 2180.0,
        "rating_delta": 64.0
      },
      "rating_rank": 1,
      "questions_rank": 1,
      "last_synced_at": 1725450000
    },
    "codeforces": {
      "handle": "aarav_grandmaster",
      "total_solved": 490,
      "rating": 1940,
      "max_rating": 1980,
      "rank_title": "Candidate Master",
      "recent_contest": {
        "contest_name": "Codeforces Round 950 (Div. 2)",
        "timestamp": 1725300000,
        "rank": 84,
        "old_rating": 1848,
        "new_rating": 1940,
        "rating_delta": 92
      },
      "rating_rank": 1,
      "questions_rank": 1,
      "last_synced_at": 1725450000
    },
    "codechef": {
      "handle": "aarav_chef",
      "total_solved": 210,
      "rating": 2210,
      "stars": 6,
      "recent_contest": {
        "contest_name": "Starters 148 (Div. 1)",
        "timestamp": 1725100000,
        "rank": 64,
        "old_rating": 2132,
        "new_rating": 2210,
        "rating_delta": 78
      },
      "rating_rank": 1,
      "questions_rank": 1,
      "last_synced_at": 1725450000
    }
  }
}
```

### 2. Dedicated Platform Leaderboard Collections
- `leaderboard_leetcode/{userId}`
- `leaderboard_codeforces/{userId}`
- `leaderboard_codechef/{userId}`

---

## ⚡ Isolated Cron Background Syncing

In `backend/src/syncWorker.js`, three isolated cron jobs run independently:

```javascript
// LeetCode Cron: 2:00 AM Daily
cron.schedule('0 2 * * *', async () => {
  await syncPlatform('leetcode');
});

// Codeforces Cron: 3:00 AM Daily
cron.schedule('0 3 * * *', async () => {
  await syncPlatform('codeforces');
});

// CodeChef Cron: 4:00 AM Daily
cron.schedule('0 4 * * *', async () => {
  await syncPlatform('codechef');
});
```

*Fault Isolation: If LeetCode GraphQL returns rate-limit errors or maintenance, Codeforces and CodeChef sync jobs proceed without disruption.*

---

## 🌐 Running Locally

1. **Start Backend & Full Web Application**:
```bash
cd backend
npm install
npm start
```
*Application & API available at `http://localhost:5001`*

2. **Alternatively Serve Frontend Separately**:
```bash
python3 -m http.server 3001 --directory frontend
```
*Open `http://localhost:3001` or `http://localhost:5001` in your browser.*
