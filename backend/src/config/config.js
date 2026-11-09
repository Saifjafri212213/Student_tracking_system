import dotenv from 'dotenv';
dotenv.config();

export const config = {
  port: process.env.PORT || 5001,
  mongodbUri: process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/coderank',
  firebaseCredentialsPath: process.env.FIREBASE_CREDENTIALS_PATH || './serviceAccountKey.json',
  jwtSecret: process.env.JWT_SECRET || 'coderank_jwt_default_secret_key_2026',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
  
  // Independent Cron Schedules for Fault Isolation
  cronSchedules: {
    // LeetCode syncs at 02:00 AM daily (or customizable)
    leetcode: process.env.LEETCODE_CRON || '0 2 * * *',
    // Codeforces syncs at 03:00 AM daily
    codeforces: process.env.CODEFORCES_CRON || '0 3 * * *',
    // CodeChef syncs at 04:00 AM daily
    codechef: process.env.CODECHEF_CRON || '0 4 * * *',
    // Interval for dev/test mode (runs every hour if ENABLE_HOURLY_SYNC is set)
    testHourly: process.env.HOURLY_CRON || '0 * * * *'
  },

  // Per-Platform Rate Limiting & Delays (in milliseconds)
  delays: {
    codeforces: 2000, // Codeforces requires <= 1 request / 2 seconds
    leetcode: 1000,   // LeetCode GraphQL throttle buffer
    codechef: 1500    // CodeChef scraper polite delay
  },
  
  // Concurrency limit per platform sync pipeline
  maxConcurrentUsers: 5
};
