import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { config } from './config.js';
import { connectDB, isDbConnected } from './db.js';
import { seedInitialDataIfEmpty } from './seed.js';
import { Leaderboard } from './models/Leaderboard.js';
import { Doubt } from './models/Doubt.js';
import { User } from './models/User.js';
import { RankingEngine } from './rankingEngine.js';
import { fetchLeetCodeStats } from './fetchers/leetcode.js';
import { fetchCodeforcesStats } from './fetchers/codeforces.js';
import { fetchCodeChefStats } from './fetchers/codechef.js';
import { INITIAL_LEADERBOARD_SEED, INITIAL_DOUBTS_SEED } from './seed.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const frontendPath = path.resolve(__dirname, '../../frontend');

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static(frontendPath));

// -------------------------------------------------------------
// 1. Connect to MongoDB Atlas and Auto-Seed
// -------------------------------------------------------------
connectDB().then(async () => {
  await seedInitialDataIfEmpty();
});

// -------------------------------------------------------------
// 2. Health & DB Status Endpoint
// -------------------------------------------------------------
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    database: {
      engine: 'MongoDB Atlas',
      connected: isDbConnected()
    },
    schedules: config.cronSchedules
  });
});

// -------------------------------------------------------------
// 3. Module 2: MongoDB Platform-Isolated Leaderboard API
// -------------------------------------------------------------
app.get('/api/leaderboard/:platform', async (req, res) => {
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
          filter.academicYear = parsedYear;
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
});

// -------------------------------------------------------------
// 4. Module 3: MongoDB Doubt Resolution Forum API
// -------------------------------------------------------------
app.get('/api/doubts', async (req, res) => {
  try {
    let doubts = [];

    if (isDbConnected()) {
      doubts = await Doubt.find()
        .sort({ createdAt: -1 })
        .limit(50)
        .lean();
    }

    if (!doubts || doubts.length === 0) {
      doubts = INITIAL_DOUBTS_SEED;
    }

    res.json({ doubts });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/doubts', async (req, res) => {
  const { title, markdownBody, tags, authorUid, authorName } = req.body;
  if (!title || !markdownBody) {
    return res.status(400).json({ error: 'Title and markdownBody are required.' });
  }

  try {
    const doubtDoc = {
      author_id: authorUid || 'student_guest',
      author_name: authorName || 'Student',
      title: title.trim(),
      description: markdownBody.trim(),
      markdownBody: markdownBody.trim(),
      tags: Array.isArray(tags) ? tags : [],
      upvotes_count: 0,
      is_resolved: false,
      answers: [],
      createdAt: new Date()
    };

    let savedDoubt = { id: 'doubt_' + Date.now(), ...doubtDoc };
    if (isDbConnected()) {
      const created = await Doubt.create(doubtDoc);
      savedDoubt = created.toObject();
    }

    res.status(201).json({ 
      message: 'Doubt successfully published to MongoDB Atlas.',
      doubt: savedDoubt
    });
  } catch (err) {
    console.error('[DoubtPost] Error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// Post an Answer to a Doubt
app.post('/api/doubts/:id/answers', async (req, res) => {
  const { id } = req.params;
  const { content, authorName, authorId } = req.body;

  if (!content) {
    return res.status(400).json({ error: 'Answer content is required.' });
  }

  try {
    const answer = {
      author_id: authorId || 'student_peer',
      author_name: authorName || 'Peer',
      content: content.trim(),
      upvotes_count: 0,
      is_accepted: false,
      created_at: new Date()
    };

    if (isDbConnected()) {
      await Doubt.findByIdAndUpdate(id, { $push: { answers: answer } });
    }

    res.status(201).json({ message: 'Answer posted successfully', answer });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Upvote a Doubt
app.post('/api/doubts/:id/upvote', async (req, res) => {
  const { id } = req.params;
  try {
    let upvotes = 1;
    if (isDbConnected()) {
      let updated = null;
      try {
        updated = await Doubt.findByIdAndUpdate(
          id,
          { $inc: { upvotes_count: 1 } },
          { new: true }
        );
      } catch (e) {
        // In case id is custom string, try findOne
        updated = await Doubt.findOneAndUpdate(
          { $or: [{ _id: id }, { id }] },
          { $inc: { upvotes_count: 1 } },
          { new: true }
        );
      }
      if (updated) {
        upvotes = updated.upvotes_count;
      }
    } else {
      const doubt = INITIAL_DOUBTS_SEED.find(d => d._id === id || d.id === id);
      if (doubt) {
        doubt.upvotes_count = (doubt.upvotes_count || 0) + 1;
        upvotes = doubt.upvotes_count;
      }
    }
    res.json({ message: 'Upvote registered', upvotes_count: upvotes });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Resolve or Toggle Resolution of a Doubt
app.post('/api/doubts/:id/resolve', async (req, res) => {
  const { id } = req.params;
  try {
    let is_resolved = true;
    if (isDbConnected()) {
      let doubt = await Doubt.findById(id).catch(() => null);
      if (!doubt) doubt = await Doubt.findOne({ id }).catch(() => null);
      if (doubt) {
        doubt.is_resolved = !doubt.is_resolved;
        await doubt.save();
        is_resolved = doubt.is_resolved;
      }
    } else {
      const doubt = INITIAL_DOUBTS_SEED.find(d => d._id === id || d.id === id);
      if (doubt) {
        doubt.is_resolved = !doubt.is_resolved;
        is_resolved = doubt.is_resolved;
      }
    }
    res.json({ message: 'Doubt status updated', is_resolved });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// -------------------------------------------------------------
// 5. Module 1: MongoDB User Registration & Profile
// -------------------------------------------------------------
app.post('/api/auth/register', async (req, res) => {
  const { fullName, rollNumber, email, branch, handles, password } = req.body;

  if (!fullName || !rollNumber || !email) {
    return res.status(400).json({ error: 'Full name, roll number, and email are required.' });
  }

  // 13-digit roll number check
  if (!/^\d{13}$/.test(rollNumber)) {
    return res.status(400).json({ error: 'Roll number must be exactly 13 digits.' });
  }

  // Valid email format check
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ error: 'Please provide a valid email address.' });
  }

  // Calculate Academic Year from first 2 digits of Roll Number
  const admissionYearShort = parseInt(rollNumber.substring(0, 2), 10);
  const admissionYear = 2000 + admissionYearShort;
  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth() + 1;
  let yearCalc = currentYear - admissionYear;
  if (currentMonth >= 7) yearCalc += 1;
  const academicYear = Math.min(Math.max(yearCalc, 1), 4);

  const uid = 'user_' + rollNumber;

  try {
    const userPayload = {
      uid,
      fullName: fullName.trim(),
      rollNumber: rollNumber.trim(),
      email: email.trim().toLowerCase(),
      branch: branch || 'CSE',
      academicYear,
      admissionYear,
      handles: handles || {},
      password: password || ''
    };

    if (isDbConnected()) {
      await User.findOneAndUpdate({ uid }, userPayload, { upsert: true, new: true });
    }

    // Populate leaderboard entry for all 3 platforms (leetcode, codeforces, codechef)
    const allPlatforms = ['leetcode', 'codeforces', 'codechef'];
    for (const platform of allPlatforms) {
      const rawHandle = handles?.[platform] || '';
      const cleanHandle = String(rawHandle).trim();
      let stats = { rating: platform === 'codeforces' ? 1200 : 1500, total_solved: 0 };

      if (cleanHandle) {
        try {
          if (platform === 'leetcode') {
            const lc = await fetchLeetCodeStats(cleanHandle);
            stats.rating = lc.rating || 1500;
            stats.total_solved = lc.totalSolved || 0;
          } else if (platform === 'codeforces') {
            const cf = await fetchCodeforcesStats(cleanHandle);
            stats.rating = cf.rating || 1200;
            stats.total_solved = cf.totalSolved || 0;
          } else if (platform === 'codechef') {
            const cc = await fetchCodeChefStats(cleanHandle);
            stats.rating = cc.rating || 1500;
            stats.total_solved = cc.totalSolved || 0;
          }
        } catch (fetchErr) {
          console.log(`[RegisterSync] Note: Could not fetch initial remote stats for ${platform}:${cleanHandle} (${fetchErr.message}). Using default.`);
        }
      }

      const entry = {
        uid,
        platform,
        fullName: userPayload.fullName,
        rollNumber: userPayload.rollNumber,
        academicYear: userPayload.academicYear,
        branch: userPayload.branch,
        handle: cleanHandle,
        rating: stats.rating,
        total_solved: stats.total_solved,
        lastSyncedAt: new Date()
      };

      if (isDbConnected()) {
        await Leaderboard.findOneAndUpdate({ platform, uid }, entry, { upsert: true });
      }

      if (INITIAL_LEADERBOARD_SEED[platform]) {
        const existingIdx = INITIAL_LEADERBOARD_SEED[platform].findIndex(p => p.uid === uid || p.rollNumber === userPayload.rollNumber);
        if (existingIdx >= 0) {
          INITIAL_LEADERBOARD_SEED[platform][existingIdx] = entry;
        } else {
          INITIAL_LEADERBOARD_SEED[platform].unshift(entry);
        }
      }
    }

    res.status(201).json({
      message: 'Student registered successfully in MongoDB Atlas.',
      user: {
        uid,
        fullName: userPayload.fullName,
        rollNumber: userPayload.rollNumber,
        branch: userPayload.branch,
        academicYear,
        admissionYear,
        email: userPayload.email,
        handles: userPayload.handles
      }
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Login endpoint
app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email) {
    return res.status(400).json({ error: 'Email is required' });
  }

  try {
    let user = null;
    if (isDbConnected()) {
      user = await User.findOne({ email: email.trim().toLowerCase() }).lean();
    }

    if (!user) {
      // Find in seed / in-memory leaderboards by email or username
      user = {
        uid: 'user_' + email.split('@')[0],
        fullName: email.split('@')[0],
        email: email.trim().toLowerCase(),
        academicYear: 3,
        branch: 'CSE',
        rollNumber: '22BCSE001',
        handles: {}
      };
    }

    res.json({
      message: 'Login successful',
      user: {
        uid: user.uid,
        fullName: user.fullName,
        rollNumber: user.rollNumber,
        branch: user.branch,
        academicYear: user.academicYear,
        admissionYear: user.admissionYear,
        email: user.email,
        handles: user.handles || {}
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update handles & sync platform stats
app.post('/api/user/handles', async (req, res) => {
  const { uid, handles, rollNumber, fullName, branch, academicYear } = req.body;
  if (!uid && !rollNumber) {
    return res.status(400).json({ error: 'UID or Roll Number is required' });
  }

  try {
    const allPlatforms = ['leetcode', 'codeforces', 'codechef'];
    const updatedStats = {};
    const userUid = uid || ('user_' + rollNumber);

    for (const platform of allPlatforms) {
      const rawHandle = handles?.[platform] || '';
      let cleanHandle = String(rawHandle).trim();
      if (platform === 'leetcode') {
        cleanHandle = cleanHandle.replace(/^https?:\/\/(www\.)?leetcode\.com\/(u\/)?/i, '').replace(/\/.*$/, '').replace(/^@+/, '').trim();
      } else if (platform === 'codeforces') {
        cleanHandle = cleanHandle.replace(/^https?:\/\/(www\.)?codeforces\.com\/(profile\/)?/i, '').replace(/\/.*$/, '').replace(/^@+/, '').trim();
      } else if (platform === 'codechef') {
        cleanHandle = cleanHandle.replace(/^https?:\/\/(www\.)?codechef\.com\/(users\/)?/i, '').replace(/\/.*$/, '').replace(/^@+/, '').trim();
      }

      let stats = { rating: platform === 'codeforces' ? 1200 : 1500, total_solved: 0 };
      if (cleanHandle) {
        try {
          if (platform === 'leetcode') {
            const lc = await fetchLeetCodeStats(cleanHandle);
            stats.rating = lc.rating || 1500;
            stats.total_solved = lc.total_solved || lc.totalSolved || 0;
          } else if (platform === 'codeforces') {
            const cf = await fetchCodeforcesStats(cleanHandle);
            stats.rating = cf.rating || 1200;
            stats.total_solved = cf.total_solved || cf.totalSolved || 0;
          } else if (platform === 'codechef') {
            const cc = await fetchCodeChefStats(cleanHandle);
            stats.rating = cc.rating || 1500;
            stats.total_solved = cc.total_solved || cc.totalSolved || 0;
          }
        } catch (fetchErr) {
          console.log(`[HandleSync] Fetch error for ${platform}:${cleanHandle} (${fetchErr.message})`);
        }
      }

      updatedStats[platform] = { handle: cleanHandle, ...stats };

      const entry = {
        uid: userUid,
        platform,
        fullName: fullName || 'Student',
        rollNumber: rollNumber || '—',
        academicYear: academicYear || 3,
        branch: branch || 'CSE',
        handle: cleanHandle,
        rating: stats.rating,
        total_solved: stats.total_solved,
        lastSyncedAt: new Date()
      };

      if (isDbConnected()) {
        await Leaderboard.findOneAndUpdate({ platform, uid: userUid }, entry, { upsert: true });
        await User.findOneAndUpdate({ uid: userUid }, { $set: { handles } }, { upsert: true });
      }

      if (INITIAL_LEADERBOARD_SEED[platform]) {
        const existingIdx = INITIAL_LEADERBOARD_SEED[platform].findIndex(p => p.uid === userUid || p.rollNumber === rollNumber);
        if (existingIdx >= 0) {
          INITIAL_LEADERBOARD_SEED[platform][existingIdx] = entry;
        } else {
          INITIAL_LEADERBOARD_SEED[platform].unshift(entry);
        }
      }
    }

    res.json({
      message: 'Handles updated and stats synced successfully.',
      updatedStats
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Password change endpoint
app.post('/api/auth/change-password', async (req, res) => {
  const { uid, email, currentPassword, newPassword } = req.body;
  if (!newPassword || newPassword.length < 6) {
    return res.status(400).json({ error: 'New password must be at least 6 characters long.' });
  }

  try {
    if (isDbConnected()) {
      let user = null;
      if (uid) user = await User.findOne({ uid });
      if (!user && email) user = await User.findOne({ email: email.trim().toLowerCase() });

      if (user) {
        if (user.password && currentPassword && user.password !== currentPassword) {
          return res.status(400).json({ error: 'Current password verification failed.' });
        }
        user.password = newPassword;
        user.updatedAt = new Date();
        await user.save();
        return res.json({ message: 'Password changed successfully.' });
      }
    }
    res.json({ message: 'Password changed successfully.' });
  } catch (err) {
    console.error('[ChangePassword] Error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// -------------------------------------------------------------
// 6. External Platform Sync Triggers
// -------------------------------------------------------------
app.post('/api/sync/trigger/:platform', async (req, res) => {
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
});

// Fallback to index.html for client-side routing
app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api/')) return next();
  res.sendFile(path.join(frontendPath, 'index.html'));
});

const PORT = config.port || 5001;
app.listen(PORT, () => {
  console.log(`🚀 [Server] CodeRank Backend running on http://localhost:${PORT}`);
});
