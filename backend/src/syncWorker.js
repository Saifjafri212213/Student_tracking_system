import cron from 'node-cron';
import admin from 'firebase-admin';
import fs from 'fs';
import { config } from './config.js';
import { fetchLeetCodeStats } from './fetchers/leetcode.js';
import { fetchCodeforcesStats } from './fetchers/codeforces.js';
import { fetchCodeChefStats } from './fetchers/codechef.js';
import { RankingEngine } from './rankingEngine.js';

let db = null;

export function initFirebase() {
  if (!admin.apps.length) {
    if (fs.existsSync(config.firebaseCredentialsPath)) {
      console.log(`[Firebase] Initializing with service account from ${config.firebaseCredentialsPath}`);
      const serviceAccount = JSON.parse(fs.readFileSync(config.firebaseCredentialsPath, 'utf8'));
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
      });
    } else {
      console.warn(`[Firebase] Service account '${config.firebaseCredentialsPath}' not found. Using default credentials.`);
      try {
        admin.initializeApp();
      } catch (e) {
        console.error('[Firebase] Init warning:', e.message);
      }
    }
  }
  db = admin.firestore();
  return db;
}

/**
 * Isolated synchronization pipeline for a single platform.
 * Saves academicYear (1-4) on platform documents for fast composite index queries.
 * 
 * @param {'leetcode' | 'codeforces' | 'codechef'} platform 
 */
export async function syncPlatform(platform) {
  if (!db) db = initFirebase();
  const startTime = Date.now();
  console.log(`\n🚀 [SyncWorker:${platform.toUpperCase()}] Starting isolated sync cycle...`);

  try {
    const usersSnap = await db.collection('users').get();
    const candidates = [];

    usersSnap.forEach((doc) => {
      const data = doc.data();
      data.uid = doc.id;
      const handle = data.platforms?.[platform]?.handle || data.handles?.[platform] || '';
      if (handle.trim()) {
        candidates.push(data);
      }
    });

    if (candidates.length === 0) {
      console.log(`ℹ️ [SyncWorker:${platform.toUpperCase()}] No users registered with a linked ${platform} handle.`);
      return { platform, status: 'empty', total: 0 };
    }

    console.log(`📊 [SyncWorker:${platform.toUpperCase()}] Found ${candidates.length} students to sync.`);

    const updatedUserStats = [];
    for (let i = 0; i < candidates.length; i += config.maxConcurrentUsers) {
      const chunk = candidates.slice(i, i + config.maxConcurrentUsers);
      const chunkResults = await Promise.all(
        chunk.map(async (user) => {
          const handle = (user.platforms?.[platform]?.handle || user.handles?.[platform] || '').trim();
          let stats = null;

          if (platform === 'leetcode') {
            stats = await fetchLeetCodeStats(handle);
          } else if (platform === 'codeforces') {
            stats = await fetchCodeforcesStats(handle);
          } else if (platform === 'codechef') {
            stats = await fetchCodeChefStats(handle);
          }

          return {
            ...user,
            platforms: {
              ...(user.platforms || {}),
              [platform]: {
                ...(user.platforms?.[platform] || {}),
                ...stats,
                handle
              }
            }
          };
        })
      );
      updatedUserStats.push(...chunkResults);
    }

    // Rank platform users
    const rankedPlatformUsers = RankingEngine.rankPlatform(updatedUserStats, platform);

    let batch = db.batch();
    let batchCount = 0;
    const now = admin.firestore.FieldValue.serverTimestamp();

    for (const record of rankedPlatformUsers) {
      const userRef = db.collection('users').document(record.uid);
      
      batch.set(
        userRef,
        {
          platforms: {
            [platform]: {
              ...record.stats,
              rating_rank: record.rating_rank,
              questions_rank: record.questions_rank,
              last_synced_at: now
            }
          }
        },
        { merge: true }
      );
      batchCount++;

      // Dedicated platform leaderboard doc storing numeric academicYear for indexed queries
      const platformDocRef = db.collection(`leaderboard_${platform}`).document(record.uid);
      batch.set(
        platformDocRef,
        {
          uid: record.uid,
          display_name: record.display_name,
          college_id: record.college_id,
          roll_number: record.roll_number,
          branch: record.branch,
          academicYear: record.academicYear, // Numeric (1, 2, 3, 4) for where() queries
          year: record.year,
          platform: record.platform,
          handle: record.handle,
          total_solved: record.total_solved,
          rating: record.rating,
          rating_rank: record.rating_rank,
          questions_rank: record.questions_rank,
          stats: record.stats,
          recent_contest: record.recent_contest,
          last_updated: now
        },
        { merge: true }
      );
      batchCount++;

      if (batchCount >= 400) {
        await batch.commit();
        batch = db.batch();
        batchCount = 0;
      }
    }

    if (batchCount > 0) {
      await batch.commit();
    }

    const durationSec = Math.round((Date.now() - startTime) / 10) / 100;
    await db.collection('sync_metadata').doc(platform).set({
      platform,
      last_sync: now,
      total_synced: rankedPlatformUsers.length,
      duration_seconds: durationSec,
      status: 'success'
    });

    console.log(`✅ [SyncWorker:${platform.toUpperCase()}] Synced ${rankedPlatformUsers.length} users in ${durationSec}s.`);
    return { platform, status: 'success', total: rankedPlatformUsers.length, durationSec };
  } catch (error) {
    console.error(`❌ [SyncWorker:${platform.toUpperCase()}] Failed:`, error.message);
    return { platform, status: 'error', error: error.message };
  }
}

export function startPlatformCronSchedulers() {
  console.log('⏰ [Cron] Registering isolated platform background schedulers:');
  console.log(`   ├─ LeetCode   : "${config.cronSchedules.leetcode}"`);
  console.log(`   ├─ Codeforces : "${config.cronSchedules.codeforces}"`);
  console.log(`   └─ CodeChef   : "${config.cronSchedules.codechef}"`);

  cron.schedule(config.cronSchedules.leetcode, async () => {
    console.log('[Cron:LeetCode] Triggering scheduled LeetCode sync...');
    await syncPlatform('leetcode');
  });

  cron.schedule(config.cronSchedules.codeforces, async () => {
    console.log('[Cron:Codeforces] Triggering scheduled Codeforces sync...');
    await syncPlatform('codeforces');
  });

  cron.schedule(config.cronSchedules.codechef, async () => {
    console.log('[Cron:CodeChef] Triggering scheduled CodeChef sync...');
    await syncPlatform('codechef');
  });
}
