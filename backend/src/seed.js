/**
 * Seed Module - Clean production setup without dummy data
 */
export const INITIAL_LEADERBOARD_SEED = {
  leetcode: [],
  codeforces: [],
  codechef: []
};

export const INITIAL_DOUBTS_SEED = [];

export async function seedInitialDataIfEmpty() {
  // Production mode: No dummy data seeded.
  // Real records are created dynamically when students register and sync handles.
}

export default { INITIAL_LEADERBOARD_SEED, INITIAL_DOUBTS_SEED, seedInitialDataIfEmpty };
