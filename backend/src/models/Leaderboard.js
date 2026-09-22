import mongoose from 'mongoose';

const leaderboardSchema = new mongoose.Schema({
  platform: { 
    type: String, 
    required: true, 
    enum: ['leetcode', 'codeforces', 'codechef'],
    index: true 
  },
  uid: { type: String, required: true, index: true },
  fullName: { type: String, required: true },
  rollNumber: { type: String, required: true },
  academicYear: { type: Number, required: true, min: 1, max: 4, index: true },
  branch: { type: String, default: 'CSE', index: true },
  handle: { type: String, required: true },
  rating: { type: Number, default: 0, index: -1 },
  total_solved: { type: Number, default: 0, index: -1 },
  stats: {
    easy_solved: { type: Number, default: 0 },
    medium_solved: { type: Number, default: 0 },
    hard_solved: { type: Number, default: 0 },
    global_rank: { type: mongoose.Schema.Types.Mixed, default: 0 },
    attended_contests: { type: Number, default: 0 },
    stars: { type: Number, default: 0 },
    rank_title: { type: String, default: '' }
  },
  recent_contest: {
    contest_name: { type: String, default: '' },
    rank: { type: Number, default: 0 },
    new_rating: { type: Number, default: 0 },
    rating_delta: { type: Number, default: 0 }
  },
  lastSyncedAt: { type: Date, default: Date.now }
});

// Compound indexes for fast filtered leaderboard queries
leaderboardSchema.index({ platform: 1, academicYear: 1, rating: -1 });
leaderboardSchema.index({ platform: 1, academicYear: 1, total_solved: -1 });
leaderboardSchema.index({ platform: 1, branch: 1, rating: -1 });
leaderboardSchema.index({ platform: 1, uid: 1 }, { unique: true });

export const Leaderboard = mongoose.models.Leaderboard || mongoose.model('Leaderboard', leaderboardSchema);
export default Leaderboard;
