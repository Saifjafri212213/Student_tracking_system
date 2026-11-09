const API_BASE = import.meta.env.VITE_API_URL 
  ? `${import.meta.env.VITE_API_URL.replace(/\/$/, '')}/api` 
  : '/api';

/**
 * Helper to build headers with optional Bearer JWT token
 */
function getHeaders(extraHeaders = {}) {
  const token = localStorage.getItem('coderank_token');
  const headers = {
    'Content-Type': 'application/json',
    ...extraHeaders,
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
}

/**
 * Handle API responses with proper JSON parsing & error propagation
 */
async function handleResponse(response) {
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const errorMsg = data.error || data.message || `Request failed with status ${response.status}`;
    const err = new Error(errorMsg);
    err.status = response.status;
    err.data = data;
    throw err;
  }
  return data;
}

export const api = {
  // System Health
  async getHealth() {
    const res = await fetch(`${API_BASE}/health`);
    return handleResponse(res);
  },

  // Leaderboard
  async getLeaderboard(platform = 'leetcode', { sort = 'rating', year = 'ALL', branch = 'ALL' } = {}) {
    const params = new URLSearchParams({ sort, year, branch });
    const res = await fetch(`${API_BASE}/leaderboard/${platform}?${params.toString()}`);
    return handleResponse(res);
  },

  // Doubts Forum
  async getDoubts() {
    const res = await fetch(`${API_BASE}/doubts`);
    return handleResponse(res);
  },

  async createDoubt({ title, markdownBody, tags, authorName, authorUid }) {
    const res = await fetch(`${API_BASE}/doubts`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ title, markdownBody, tags, authorName, authorUid }),
    });
    return handleResponse(res);
  },

  async answerDoubt(doubtId, { content, authorName, authorId }) {
    const res = await fetch(`${API_BASE}/doubts/${doubtId}/answers`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ content, authorName, authorId }),
    });
    return handleResponse(res);
  },

  async upvoteDoubt(doubtId) {
    const res = await fetch(`${API_BASE}/doubts/${doubtId}/upvote`, {
      method: 'POST',
      headers: getHeaders(),
    });
    return handleResponse(res);
  },

  async toggleResolveDoubt(doubtId) {
    const res = await fetch(`${API_BASE}/doubts/${doubtId}/resolve`, {
      method: 'POST',
      headers: getHeaders(),
    });
    return handleResponse(res);
  },

  // Auth & Profile with bcrypt & JWT
  async login(email, password) {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    return handleResponse(res);
  },

  async register(payload) {
    const res = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    return handleResponse(res);
  },

  async getMe() {
    const res = await fetch(`${API_BASE}/auth/me`, {
      headers: getHeaders(),
    });
    return handleResponse(res);
  },

  async changePassword(currentPassword, newPassword) {
    const res = await fetch(`${API_BASE}/auth/change-password`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ currentPassword, newPassword }),
    });
    return handleResponse(res);
  },

  async updateHandles({ uid, rollNumber, fullName, branch, academicYear, handles }) {
    const res = await fetch(`${API_BASE}/user/handles`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ uid, rollNumber, fullName, branch, academicYear, handles }),
    });
    return handleResponse(res);
  },

  async updateProfile(profileData) {
    const res = await fetch(`${API_BASE}/auth/profile`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(profileData),
    });
    return handleResponse(res);
  },

  async triggerSync(platform = 'all') {
    const res = await fetch(`${API_BASE}/sync/trigger/${platform}`, {
      method: 'POST',
      headers: getHeaders(),
    });
    return handleResponse(res);
  },

  // Contests Calendar & Live Timers
  async getUpcomingContests() {
    const res = await fetch(`${API_BASE}/contests`);
    return handleResponse(res);
  }
};
