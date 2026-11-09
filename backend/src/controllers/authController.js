import bcrypt from 'bcryptjs';
import { isDbConnected } from '../config/db.js';
import { User } from '../models/User.js';
import { Leaderboard } from '../models/Leaderboard.js';
import { INITIAL_LEADERBOARD_SEED } from '../seed.js';
import { generateToken } from '../middleware/auth.js';
import { IN_MEMORY_USERS, sanitizeUser } from '../utils/userStore.js';
import { fetchLeetCodeStats } from '../fetchers/leetcode.js';
import { fetchCodeforcesStats } from '../fetchers/codeforces.js';
import { fetchCodeChefStats } from '../fetchers/codechef.js';

export async function register(req, res) {
  const { fullName, rollNumber, email, branch, handles, password } = req.body;

  if (!fullName || !rollNumber || !email) {
    return res.status(400).json({ error: 'Full name, roll number, and email are required.' });
  }

  if (!password || password.length < 6) {
    return res.status(400).json({ error: 'Password must be at least 6 characters long.' });
  }

  // 13-digit roll number check
  const cleanRoll = rollNumber.trim();
  if (!/^\d{13}$/.test(cleanRoll)) {
    return res.status(400).json({ error: 'Roll number must be exactly 13 digits.' });
  }

  // Valid email format check
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const cleanEmail = email.trim().toLowerCase();
  if (!emailRegex.test(cleanEmail)) {
    return res.status(400).json({ error: 'Please provide a valid email address.' });
  }

  // Check if student with this email or rollNumber already exists
  if (isDbConnected()) {
    const existing = await User.findOne({ $or: [{ email: cleanEmail }, { rollNumber: cleanRoll }] });
    if (existing) {
      return res.status(409).json({ error: 'A student with this email or roll number is already registered.' });
    }
  } else {
    for (const u of IN_MEMORY_USERS.values()) {
      if (u.email === cleanEmail || u.rollNumber === cleanRoll) {
        return res.status(409).json({ error: 'A student with this email or roll number is already registered.' });
      }
    }
  }

  // Calculate Academic Year from first 2 digits of Roll Number
  const admissionYearShort = parseInt(cleanRoll.substring(0, 2), 10);
  const admissionYear = 2000 + admissionYearShort;
  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth() + 1;
  let yearCalc = currentYear - admissionYear;
  if (currentMonth >= 7) yearCalc += 1;
  const academicYear = Math.min(Math.max(yearCalc, 1), 4);

  const uid = 'user_' + cleanRoll;

  try {
    const hashedPassword = await bcrypt.hash(password, 10);

    const userPayload = {
      uid,
      fullName: fullName.trim(),
      rollNumber: cleanRoll,
      email: cleanEmail,
      branch: branch || 'CSE',
      academicYear,
      admissionYear,
      dob: req.body.dob || '2003-05-14',
      age: req.body.age || 21,
      gender: req.body.gender || 'Prefer not to say',
      phone: req.body.phone || '',
      handles: handles || {},
      password: hashedPassword,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    if (isDbConnected()) {
      await User.findOneAndUpdate({ uid }, userPayload, { upsert: true, new: true });
    }
    IN_MEMORY_USERS.set(cleanEmail, userPayload);

    // Populate leaderboard entry for all 3 platforms
    const allPlatforms = ['leetcode', 'codeforces', 'codechef'];
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
            stats.total_solved = lc.totalSolved || lc.total_solved || 0;
          } else if (platform === 'codeforces') {
            const cf = await fetchCodeforcesStats(cleanHandle);
            stats.rating = cf.rating || 1200;
            stats.total_solved = cf.totalSolved || cf.total_solved || 0;
          } else if (platform === 'codechef') {
            const cc = await fetchCodeChefStats(cleanHandle);
            stats.rating = cc.rating || 1500;
            stats.total_solved = cc.totalSolved || cc.total_solved || 0;
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

    const token = generateToken(userPayload);

    res.status(201).json({
      message: 'Student registered successfully.',
      token,
      user: sanitizeUser(userPayload)
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

export async function login(req, res) {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  const cleanEmail = email.trim().toLowerCase();

  try {
    let user = null;
    if (isDbConnected()) {
      user = await User.findOne({ email: cleanEmail }).lean();
    }
    if (!user) {
      user = IN_MEMORY_USERS.get(cleanEmail);
    }

    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    if (user.password) {
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(401).json({ error: 'Invalid email or password.' });
      }
    }

    const token = generateToken(user);

    res.json({
      message: 'Login successful',
      token,
      user: sanitizeUser(user)
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

export async function getMe(req, res) {
  try {
    let user = null;
    if (isDbConnected()) {
      user = await User.findOne({ uid: req.user.uid }).lean();
    }
    if (!user) {
      user = IN_MEMORY_USERS.get(req.user.email);
    }
    if (!user) {
      user = req.user;
    }
    res.json({ user: sanitizeUser(user) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

export async function changePassword(req, res) {
  const { currentPassword, newPassword } = req.body;
  const uid = req.user.uid;
  const email = req.user.email;

  if (!newPassword || newPassword.length < 6) {
    return res.status(400).json({ error: 'New password must be at least 6 characters long.' });
  }

  try {
    let user = null;
    if (isDbConnected()) {
      user = await User.findOne({ uid });
    }
    if (!user && IN_MEMORY_USERS.has(email)) {
      user = IN_MEMORY_USERS.get(email);
    }

    if (!user) {
      return res.status(404).json({ error: 'User profile not found.' });
    }

    if (user.password && currentPassword) {
      const isMatch = await bcrypt.compare(currentPassword, user.password);
      if (!isMatch) {
        return res.status(400).json({ error: 'Current password verification failed.' });
      }
    }

    const hashedNewPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedNewPassword;
    user.updatedAt = new Date();

    if (isDbConnected() && typeof user.save === 'function') {
      await user.save();
    } else {
      IN_MEMORY_USERS.set(email, user);
    }

    res.json({ message: 'Password changed successfully.' });
  } catch (err) {
    console.error('[ChangePassword] Error:', err.message);
    res.status(500).json({ error: err.message });
  }
}

export async function updateHandles(req, res) {
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
}

export async function updateProfile(req, res) {
  const { fullName, dob, gender, phone, branch } = req.body;
  const uid = req.user?.uid;
  const email = req.user?.email;

  if (!uid && !email) {
    return res.status(401).json({ error: 'Unauthorized: No active session' });
  }

  try {
    let computedAge = null;
    if (dob) {
      const birth = new Date(dob);
      if (!isNaN(birth.getTime())) {
        const today = new Date();
        let age = today.getFullYear() - birth.getFullYear();
        const m = today.getMonth() - birth.getMonth();
        if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
          age--;
        }
        computedAge = Math.max(0, age);
      }
    }

    const updates = {};
    if (fullName) updates.fullName = fullName.trim();
    if (dob !== undefined) updates.dob = dob;
    if (computedAge !== null) updates.age = computedAge;
    if (gender) updates.gender = gender;
    if (phone !== undefined) updates.phone = phone.trim();
    if (branch) updates.branch = branch;
    updates.updatedAt = new Date();

    let updatedUser = null;
    if (isDbConnected()) {
      updatedUser = await User.findOneAndUpdate(
        { $or: [{ uid }, { email }] },
        { $set: updates },
        { new: true }
      ).lean();

      // Keep Leaderboard entries synced if fullName or branch changed
      if (fullName || branch) {
        const lbUpdates = {};
        if (fullName) lbUpdates.fullName = fullName.trim();
        if (branch) lbUpdates.branch = branch;
        await Leaderboard.updateMany({ uid }, { $set: lbUpdates });
      }
    }

    // Update in-memory store
    if (IN_MEMORY_USERS.has(email)) {
      const existing = IN_MEMORY_USERS.get(email);
      const merged = { ...existing, ...updates };
      IN_MEMORY_USERS.set(email, merged);
      if (!updatedUser) updatedUser = merged;
    }

    if (!updatedUser) {
      updatedUser = { uid, email, ...updates };
    }

    res.json({
      message: 'Personal details updated successfully.',
      user: sanitizeUser(updatedUser)
    });
  } catch (err) {
    console.error('[UpdateProfile] Error:', err.message);
    res.status(500).json({ error: err.message });
  }
}

export async function resetForgotPassword(req, res) {
  const { email, rollNumber, newPassword } = req.body;

  if (!email || !newPassword) {
    return res.status(400).json({ error: 'Please provide both college email and new password.' });
  }

  if (newPassword.length < 6) {
    return res.status(400).json({ error: 'New password must be at least 6 characters long.' });
  }

  const cleanEmail = email.toLowerCase().trim();

  try {
    let user = null;
    if (isDbConnected()) {
      user = await User.findOne({ email: cleanEmail });
    } else if (IN_MEMORY_USERS.has(cleanEmail)) {
      user = IN_MEMORY_USERS.get(cleanEmail);
    }

    if (!user) {
      return res.status(404).json({ error: 'No student account found with this email address.' });
    }

    // If roll number provided, verify it matches
    if (rollNumber && user.rollNumber) {
      if (user.rollNumber.trim() !== rollNumber.trim()) {
        return res.status(400).json({ error: 'Roll number does not match our records for this account.' });
      }
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    if (isDbConnected()) {
      user.password = hashedPassword;
      await user.save();
    }

    if (IN_MEMORY_USERS.has(cleanEmail)) {
      const memUser = IN_MEMORY_USERS.get(cleanEmail);
      memUser.password = hashedPassword;
      IN_MEMORY_USERS.set(cleanEmail, memUser);
    }

    // Auto-login after password reset
    const token = generateToken(user);

    return res.json({
      message: 'Password reset successfully! Logged in.',
      token,
      user: sanitizeUser(user)
    });
  } catch (err) {
    console.error('[ResetForgotPassword] Error:', err.message);
    return res.status(500).json({ error: 'Failed to reset password. Please try again.' });
  }
}



