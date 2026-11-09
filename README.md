# CodeRank &middot; Campus Competitive Programming Hub

A modern, full-stack campus competitive programming platform featuring platform-isolated leaderboards for **LeetCode**, **Codeforces**, and **CodeChef**, a **CSES Practice Arena**, and **Live Contest Schedules**. Built with **React**, **Vite**, **Tailwind CSS**, **Framer Motion**, **Node.js / Express**, and **MongoDB**.

---

## 🏛️ System Architecture

```
                                  ┌────────────────────────────────────────┐
                                  │         External CP Platforms          │
                                  │  • LeetCode (GraphQL API)              │
                                  │  • Codeforces (Official REST API)      │
                                  │  • CodeChef (HTML Cheerio Scraper)     │
                                  │  • CSES Problem Set (cses.fi)          │
                                  └────────────────────────────────────────┘
                                                      ▲
                                                      │ Isolated Sync Delays
                                                      │ (1 req / 2s rate limit)
                                                      ▼
┌───────────────────────────────┐       ┌────────────────────────────────────────┐
│     Frontend (React + Vite)   │       │      Node.js Backend & API Server      │
│  • Motion UI (Framer Motion)  │◄─────►│  • Express REST API (`src/server.js`)  │
│  • Platform Leaderboards      │ JSON  │  • JWT Auth & bcrypt security          │
│  • CSES Practice Arena        │ Fetch │  • Ranking Engine (`rankingEngine.js`) │
│  • Contest Schedules & Timers │       │  • Background Platform Sync Worker     │
│  • Profile & AKTU Branches    │       │  • MongoDB Mongoose Connection         │
└───────────────────────────────┘       └────────────────────────────────────────┘
                                                              │
                                                              ▼
                                        ┌────────────────────────────────────────┐
                                        │            MongoDB Database            │
                                        │  • `users`: Credentials, DOB, age,     │
                                        │    gender, phone, handles, AKTU branch │
                                        │  • `leaderboards`: Indexed per-platform│
                                        │    ratings, rank, solved counts        │
                                        └────────────────────────────────────────┘
```

---

## ✨ Key Features

### 1. Competitive Programming Leaderboards
- **Multi-Platform Support**: Independent standing tables for **LeetCode**, **Codeforces**, and **CodeChef** with official brand icons.
- **Top-3 Podium Showcase**: Animated 1st, 2nd, and 3rd place podium cards with medal badges, global contest ratings, and solved problem counts.
- **Academic Filters**: Filter student standings by **Academic Year** (1st to 4th Year) and **AKTU Engineering Branch**.
- **Sorting Modes**: Toggle between **Contest Rating** and **Total Problems Solved**.
- **Search**: Instant live search by student name, college roll number, or coding handle.

### 2. CSES Practice Arena
- **300+ Curated Tasks**: 8 algorithmic tracks modeled after Antti Laaksonen's CSES Problem Set:
  - *Introductory Problems* (Weird Algorithm, Missing Number, Permutations, Two Knights, etc.)
  - *Sorting & Searching* (Distinct Numbers, Concert Tickets, Restaurant Customers, etc.)
  - *Dynamic Programming* (Dice Combinations, Minimizing Coins, Coin Combinations, Grid Paths, Book Shop, etc.)
  - *Graph Algorithms* (Counting Rooms, Labyrinth, Building Roads, Message Route, etc.)
  - *Range Queries* (Static Range Sum Queries, Static Range Minimum Queries, etc.)
  - *Tree Algorithms* (Subordinates, Tree Matching, Tree Diameter, etc.)
  - *Mathematics* (Exponentiation, Counting Divisors, Common Divisors, etc.)
  - *String Algorithms* (Word Combinations, String Matching, Finding Borders, etc.)
- **Direct Task Links**: One-click navigation to `cses.fi/problemset/task/{id}` with difficulty ratings.
- **Interactive Live Portal**: Toggleable embedded live CSES portal inside the application.
- **Progress Tracking**: Checkboxes to mark tasks solved, with local storage persistence and percentage completion metrics.

### 3. Live Contest Schedules & Countdown Timers
- Real-time schedule across LeetCode, Codeforces, and CodeChef.
- Live pulse indicators for ongoing contests and countdown timers for upcoming rounds.
- One-click **"Add to Google Calendar"** and direct registration links.

### 4. AKTU Engineering Branch Specializations
Supports all 16 official B.Tech branches related to CSE / IT under AKTU (Dr. A.P.J. Abdul Kalam Technical University):
1. `CSE` &ndash; Computer Science & Engineering
2. `CSE (AI & ML)` &ndash; Artificial Intelligence & Machine Learning
3. `CSE (Data Science)` &ndash; Data Science
4. `CSE (AI)` &ndash; Artificial Intelligence
5. `CSE (Cyber Security)` &ndash; Cyber Security
6. `CSE (IoT)` &ndash; Internet of Things
7. `CSE (IoT & Cyber Security)` &ndash; IoT & Cyber Security (incl. Blockchain)
8. `CSE (Hindi)` &ndash; Regional Language (Hindi)
9. `IT` &ndash; Information Technology
10. `CS` &ndash; Computer Science
11. `CSIT` &ndash; Computer Science & Information Technology
12. `AI & ML` &ndash; Artificial Intelligence & Machine Learning
13. `AI & DS` &ndash; Artificial Intelligence & Data Science
14. `CSD` &ndash; Computer Science & Design
15. `CSBS` &ndash; Computer Science & Business Systems
16. `CS & Biosciences` &ndash; Computer Science & Biosciences

### 5. Profile Management & Authentication
- **Secure Auth**: JWT (JSON Web Tokens) with 7-day validity and bcrypt password hashing.
- **Personal Details**: Full Name, Date of Birth picker with dynamic age calculation, Gender, Phone Number, 13-digit College Roll Number, and AKTU Branch.
- **Coding Handles**: Live synchronization for LeetCode, Codeforces, and CodeChef profiles.
- **Access Control**: Unauthenticated visitors are guided through Home and Practice, prompting the Auth modal when attempting to access practice or private dashboards.

---

## 🗄️ MongoDB Database Models

### `User` Schema
```javascript
{
  uid: "user_2100000000101",
  fullName: "Aarav Sharma",
  rollNumber: "2100000000101",
  email: "aarav@college.edu",
  branch: "CSE",
  academicYear: 4,
  admissionYear: 2021,
  dob: "2003-05-14",
  age: 23,
  gender: "Male",
  phone: "+91 98765 43210",
  handles: {
    leetcode: "aarav_cp",
    codeforces: "aarav_grandmaster",
    codechef: "aarav_chef"
  }
}
```

### `Leaderboard` Schema
```javascript
{
  platform: "leetcode",      // 'leetcode' | 'codeforces' | 'codechef'
  uid: "user_2100000000101",
  fullName: "Aarav Sharma",
  rollNumber: "2100000000101",
  academicYear: 4,
  branch: "CSE",
  handle: "aarav_cp",
  rating: 2180,
  total_solved: 720,
  stats: {
    easy_solved: 240,
    medium_solved: 360,
    hard_solved: 120,
    global_rank: 4320,
    attended_contests: 18
  },
  rank: 1,
  lastSyncedAt: Date
}
```

---

## 🚀 Getting Started

### Prerequisites
- **Node.js** (v18 or higher)
- **MongoDB** (running locally on `mongodb://127.0.0.1:27017` or MongoDB Atlas URI)

### 1. Setup & Start Backend Server
```bash
cd backend
npm install
npm start
```
The backend server runs at **`http://localhost:5001`**, auto-connects to MongoDB (`coderank` database), seeds demo students if empty, and serves the static production build.

### 2. Start Frontend Dev Server
```bash
cd frontend
npm install
npm run dev
```
The Vite development server with Hot Module Replacement (HMR) runs at **`http://localhost:5173`** (proxied to port 5001).

### 3. Build for Production
```bash
cd frontend
npm run build
```
Builds the optimized production assets into `frontend/dist/`, which are automatically served by the Express backend.

---

## 🔑 Demo Credentials

To test the system immediately, use the pre-seeded demo accounts:

| Name | College Email | Password | Branch | Role / Tier |
| :--- | :--- | :--- | :--- | :--- |
| **Aarav Sharma** | `aarav@college.edu` | `Password@123` | CSE | Year 4 &middot; Grandmaster |
| **Priya Patel** | `priya@college.edu` | `Password@123` | CSE | Year 3 &middot; Knight |
| **Rohan Verma** | `rohan@college.edu` | `Password@123` | IT | Year 3 &middot; Specialist |

---

## 🛠️ Tech Stack

- **Frontend**: React 18, Vite 5, Tailwind CSS, Framer Motion, Lucide Icons
- **Backend**: Node.js, Express 4, Mongoose 8, JWT, bcryptjs, Cheerio, Axios
- **Database**: MongoDB (Local or Atlas)
- **APIs**: LeetCode GraphQL, Codeforces REST v2, CodeChef Cheerio Scraper, CSES Online Judge
