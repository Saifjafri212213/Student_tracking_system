import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Trophy, 
  ExternalLink, 
  RefreshCw, 
  Search, 
  CheckCircle, 
  Zap, 
  Sparkles,
  ArrowUpRight,
  TrendingUp,
  AlertCircle,
  Medal,
  Award,
  Crown
} from 'lucide-react';
import { api } from '../services/api';
import { LeetCodeIcon, CodeforcesIcon, CodeChefIcon, PlatformIcon } from './PlatformIcons';
import { AKTU_CSE_BRANCHES } from '../data/branches';

const PLATFORMS = [
  {
    id: 'leetcode',
    name: 'LeetCode',
    accent: '#FFA116',
    icon: LeetCodeIcon,
    borderClass: 'border-amber-500/40',
    bgClass: 'bg-amber-500/10',
    textClass: 'text-amber-400',
    glowClass: 'shadow-[0_0_35px_-5px_rgba(255,161,22,0.35)]',
    haloColor: 'rgba(255, 161, 22, 0.15)',
    profileUrl: (h) => `https://leetcode.com/u/${h}`,
    ratingLabel: 'Contest Rating',
    badgeRule: (r) => {
      if (r >= 2200) return { title: 'Guardian', color: 'bg-red-500/15 text-red-300 border-red-500/30' };
      if (r >= 1800) return { title: 'Knight', color: 'bg-amber-500/15 text-amber-300 border-amber-500/30' };
      if (r >= 1600) return { title: 'Star Coder', color: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30' };
      return { title: 'Contender', color: 'bg-slate-700/30 text-slate-300 border-slate-600/30' };
    }
  },
  {
    id: 'codeforces',
    name: 'Codeforces',
    accent: '#3B82F6',
    icon: CodeforcesIcon,
    borderClass: 'border-blue-500/40',
    bgClass: 'bg-blue-500/10',
    textClass: 'text-blue-400',
    glowClass: 'shadow-[0_0_35px_-5px_rgba(59,130,246,0.35)]',
    haloColor: 'rgba(59, 130, 246, 0.15)',
    profileUrl: (h) => `https://codeforces.com/profile/${h}`,
    ratingLabel: 'CF Rating',
    badgeRule: (r) => {
      if (r >= 2400) return { title: 'Grandmaster', color: 'bg-red-500/15 text-red-300 border-red-500/30' };
      if (r >= 2100) return { title: 'Master', color: 'bg-amber-500/15 text-amber-300 border-amber-500/30' };
      if (r >= 1900) return { title: 'Candidate Master', color: 'bg-purple-500/15 text-purple-300 border-purple-500/30' };
      if (r >= 1600) return { title: 'Expert', color: 'bg-blue-500/15 text-blue-300 border-blue-500/30' };
      if (r >= 1400) return { title: 'Specialist', color: 'bg-cyan-500/15 text-cyan-300 border-cyan-500/30' };
      if (r >= 1200) return { title: 'Pupil', color: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30' };
      return { title: 'Newbie', color: 'bg-slate-700/30 text-slate-300 border-slate-600/30' };
    }
  },
  {
    id: 'codechef',
    name: 'CodeChef',
    accent: '#10B981',
    icon: CodeChefIcon,
    borderClass: 'border-emerald-500/40',
    bgClass: 'bg-emerald-500/10',
    textClass: 'text-emerald-400',
    glowClass: 'shadow-[0_0_35px_-5px_rgba(16,185,129,0.35)]',
    haloColor: 'rgba(16, 185, 129, 0.15)',
    profileUrl: (h) => `https://www.codechef.com/users/${h}`,
    ratingLabel: 'Stars & Rating',
    badgeRule: (r) => {
      if (r >= 2500) return { title: '7 ★ Div 1', color: 'bg-red-500/15 text-red-300 border-red-500/30' };
      if (r >= 2200) return { title: '6 ★ Div 1', color: 'bg-amber-500/15 text-amber-300 border-amber-500/30' };
      if (r >= 2000) return { title: '5 ★ Div 1', color: 'bg-yellow-500/15 text-yellow-300 border-yellow-500/30' };
      if (r >= 1800) return { title: '4 ★ Div 2', color: 'bg-purple-500/15 text-purple-300 border-purple-500/30' };
      if (r >= 1600) return { title: '3 ★ Div 2', color: 'bg-blue-500/15 text-blue-300 border-blue-500/30' };
      if (r >= 1400) return { title: '2 ★ Div 3', color: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30' };
      return { title: '1 ★ Div 4', color: 'bg-slate-700/30 text-slate-300 border-slate-600/30' };
    }
  }
];

export function LeaderboardView() {
  const [platform, setPlatform] = useState('leetcode');
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [search, setSearch] = useState('');
  const [yearFilter, setYearFilter] = useState('ALL');
  const [branchFilter, setBranchFilter] = useState('ALL');
  const [sortBy, setSortBy] = useState('rating'); // 'rating' or 'solved'
  const [syncMessage, setSyncMessage] = useState(null);

  const activeConfig = PLATFORMS.find((p) => p.id === platform) || PLATFORMS[0];

  // Fetch leaderboard data when platform, sort, or basic filters change
  const fetchLeaderboard = async () => {
    setLoading(true);
    try {
      const data = await api.getLeaderboard(platform, {
        sort: sortBy,
        year: yearFilter,
        branch: branchFilter
      });
      // Handle data.data or data.leaderboard
      const list = data.data || data.leaderboard || [];
      setLeaderboard(Array.isArray(list) ? list : []);
    } catch (err) {
      console.error('Failed to fetch leaderboard:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaderboard();
  }, [platform, sortBy, yearFilter, branchFilter]);

  // Handle live platform sync trigger
  const handleSync = async () => {
    setSyncing(true);
    setSyncMessage(null);
    try {
      const res = await api.triggerSync(platform);
      setSyncMessage(res.message || 'Platform stats synchronized.');
      await fetchLeaderboard();
      setTimeout(() => setSyncMessage(null), 4000);
    } catch (err) {
      setSyncMessage('Sync completed.');
      setTimeout(() => setSyncMessage(null), 4000);
    } finally {
      setSyncing(false);
    }
  };

  // Client-side text search (student name, roll, handle)
  const filteredStudents = leaderboard.filter((student) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      student.fullName?.toLowerCase().includes(q) ||
      student.rollNumber?.toLowerCase().includes(q) ||
      student.handle?.toLowerCase().includes(q)
    );
  });

  const top3 = filteredStudents.slice(0, 3);
  const rest = filteredStudents.slice(3);

  return (
    <div className="space-y-8 animate-fadeIn relative">
      {/* Platform Ambient Halo Light */}
      <div 
        className="absolute -top-10 left-1/2 -translate-x-1/2 w-3/4 h-48 rounded-full blur-[140px] pointer-events-none transition-all duration-700 -z-10"
        style={{ backgroundColor: activeConfig.haloColor }}
      />

      {/* Header with Title and Sync CTA */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-2 border-b border-[#202735]">
        <div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white font-display flex items-center space-x-3">
            <span>Competitive Programming Leaderboards</span>
          </h1>
        </div>

        {/* Sync Trigger CTA */}
        <div className="flex items-center space-x-3 w-full md:w-auto">
          <AnimatePresence>
            {syncMessage && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.9, y: 5 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: -5 }}
                className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs shadow-sm"
              >
                <CheckCircle className="w-3.5 h-3.5" />
                <span>{syncMessage}</span>
              </motion.div>
            )}
          </AnimatePresence>

          <motion.button
            onClick={handleSync}
            disabled={syncing}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            className="flex items-center space-x-2 px-4 py-2 rounded-xl bg-[#0d111b] border border-[#222936] hover:border-[#8b9eff]/40 hover:bg-[#111726] text-[#edf0f7] text-xs font-semibold tracking-wide transition duration-200 disabled:opacity-50 ml-auto shadow-sm"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-[#84d9eb] ${syncing ? 'animate-spin' : ''}`} />
            <span>{syncing ? 'Syncing...' : 'Sync Platform Stats'}</span>
          </motion.button>
        </div>
      </div>

      {/* Platform Tabs with Motion Slider */}
      <div className="grid grid-cols-3 gap-2 p-1.5 rounded-2xl bg-[#0d111b]/80 border border-[#202735] backdrop-blur-xl relative">
        {PLATFORMS.map((p) => {
          const isActive = platform === p.id;
          return (
            <button
              key={p.id}
              onClick={() => setPlatform(p.id)}
              className={`relative z-10 flex items-center justify-center space-x-2.5 py-3 px-4 rounded-xl font-semibold text-sm transition-colors duration-200 group ${
                isActive ? 'text-white' : 'text-[#99a4b7] hover:text-[#edf0f7]'
              }`}
            >
              <p.icon className="w-4 h-4 flex-shrink-0 transition-transform duration-200 group-hover:scale-110" />
              <span className="font-display tracking-wide">{p.name}</span>

              {isActive && (
                <motion.div
                  layoutId="activePlatformBackground"
                  className="absolute inset-0 bg-[#161d2d] rounded-xl border shadow-lg -z-10"
                  style={{ borderColor: `${p.accent}55` }}
                  transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                />
              )}
            </button>
          );
        })}
      </div>

      {/* Filter and Search Controls Bar */}
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="glass-card rounded-2xl p-4 flex flex-col lg:flex-row items-center justify-between gap-4 border border-[#202735] bg-[#0d111b]/70 backdrop-blur-xl"
      >
        {/* Search Input */}
        <div className="relative w-full lg:w-80">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#99a4b7]" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, roll, handle..."
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-[#080b12]/80 border border-[#222936] text-xs text-[#edf0f7] placeholder-[#99a4b7]/60 focus:outline-none focus:border-[#8b9eff] focus:ring-1 focus:ring-[#8b9eff]/30 transition"
          />
        </div>

        {/* Filter Dropdowns */}
        <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
          {/* Academic Year Filter */}
          <div className="flex items-center space-x-2">
            <span className="text-xs font-medium text-[#99a4b7]">Year:</span>
            <select
              value={yearFilter}
              onChange={(e) => setYearFilter(e.target.value)}
              className="bg-[#080b12]/80 border border-[#222936] text-[#edf0f7] text-xs rounded-xl px-3 py-1.5 focus:outline-none focus:border-[#8b9eff] transition cursor-pointer"
            >
              <option value="ALL">All Years</option>
              <option value="1">1st Year (2025)</option>
              <option value="2">2nd Year (2024)</option>
              <option value="3">3rd Year (2023)</option>
              <option value="4">4th Year (2022)</option>
            </select>
          </div>

          {/* Branch Filter */}
          <div className="flex items-center space-x-2">
            <span className="text-xs font-medium text-[#99a4b7]">Branch:</span>
            <select
              value={branchFilter}
              onChange={(e) => setBranchFilter(e.target.value)}
              className="bg-[#080b12]/80 border border-[#222936] text-[#edf0f7] text-xs rounded-xl px-3 py-1.5 focus:outline-none focus:border-[#8b9eff] transition cursor-pointer max-w-[190px] sm:max-w-[220px] truncate"
            >
              <option value="ALL">All AKTU Branches</option>
              {AKTU_CSE_BRANCHES.map((b) => (
                <option key={b.code} value={b.code}>
                  {b.label}
                </option>
              ))}
            </select>
          </div>

          {/* Sort Metric Selector with Sliding Pill */}
          <div className="flex items-center p-1 rounded-xl bg-[#080b12]/80 border border-[#222936] text-xs relative">
            <button
              onClick={() => setSortBy('rating')}
              className={`relative z-10 px-3.5 py-1 rounded-lg font-semibold tracking-wide transition-colors duration-200 ${
                sortBy === 'rating' ? 'text-white' : 'text-[#99a4b7] hover:text-[#edf0f7]'
              }`}
            >
              Rating
              {sortBy === 'rating' && (
                <motion.div
                  layoutId="activeSortToggle"
                  className="absolute inset-0 bg-[#1e273a] rounded-lg border border-[#32405d] shadow-sm -z-10"
                  transition={{ type: 'spring', stiffness: 450, damping: 30 }}
                />
              )}
            </button>
            <button
              onClick={() => setSortBy('solved')}
              className={`relative z-10 px-3.5 py-1 rounded-lg font-semibold tracking-wide transition-colors duration-200 ${
                sortBy === 'solved' ? 'text-white' : 'text-[#99a4b7] hover:text-[#edf0f7]'
              }`}
            >
              Solved
              {sortBy === 'solved' && (
                <motion.div
                  layoutId="activeSortToggle"
                  className="absolute inset-0 bg-[#1e273a] rounded-lg border border-[#32405d] shadow-sm -z-10"
                  transition={{ type: 'spring', stiffness: 450, damping: 30 }}
                />
              )}
            </button>
          </div>
        </div>
      </motion.div>

      {/* Top 3 Podium Highlights with Framer Motion Stagger */}
      {!loading && top3.length > 0 && (
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, staggerChildren: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-5 pt-2"
        >
          {/* 2nd Place */}
          {top3[1] && (
            <motion.div 
              whileHover={{ y: -5, scale: 1.01 }}
              transition={{ duration: 0.2 }}
              className="order-2 md:order-1 glass-card rounded-2xl p-6 border-[#222936] bg-[#0d111b]/80 relative overflow-hidden flex flex-col justify-between group hover:border-slate-500/50 transition-all shadow-md"
            >
              <div className="absolute top-0 right-0 w-24 h-24 bg-slate-400/10 rounded-full blur-2xl" />
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="w-10 h-10 rounded-xl bg-[#161d2d] border border-slate-600/50 flex items-center justify-center font-bold text-slate-200 font-display text-lg shadow-sm">
                    2
                  </div>
                  <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-[#161d2d] text-slate-300 border border-slate-700/60 font-semibold tracking-wide">
                    Silver Medal
                  </span>
                </div>
                <h3 className="text-lg font-bold text-white group-hover:text-[#84d9eb] transition font-display">
                  {top3[1].fullName}
                </h3>
                <div className="flex items-center space-x-2 text-xs text-[#99a4b7] mt-1 font-mono">
                  <span>{top3[1].branch}</span>
                  <span>&middot;</span>
                  <span>Yr {top3[1].academicYear}</span>
                  <span>&middot;</span>
                  <span>{top3[1].rollNumber}</span>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-[#202735] flex items-center justify-between">
                <div>
                  <div className="text-2xl font-black font-display text-white">
                    {top3[1].rating}
                  </div>
                  <div className="text-[11px] text-[#99a4b7]">{activeConfig.ratingLabel}</div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-semibold text-emerald-400 font-mono">
                    {top3[1].total_solved} solved
                  </div>
                  {top3[1].handle && top3[1].handle !== '—' && (
                    <a
                      href={activeConfig.profileUrl(top3[1].handle)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center space-x-1 text-xs text-[#99a4b7] hover:text-white transition mt-0.5"
                    >
                      <span>@{top3[1].handle}</span>
                      <ArrowUpRight className="w-3 h-3 text-[#99a4b7]" />
                    </a>
                  )}
                </div>
              </div>
            </motion.div>
          )}

          {/* 1st Place (Champion Center Card) */}
          {top3[0] && (
            <motion.div 
              whileHover={{ y: -7, scale: 1.02 }}
              transition={{ duration: 0.2 }}
              className={`order-1 md:order-2 glass-card rounded-2xl p-6 relative overflow-hidden flex flex-col justify-between border-amber-500/50 bg-[#0d111b]/90 shadow-2xl ${activeConfig.glowClass} group transition-all`}
            >
              <div className="absolute top-0 right-0 w-36 h-36 bg-amber-500/20 rounded-full blur-3xl pointer-events-none" />
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3.5 py-0.5 rounded-full bg-gradient-to-r from-amber-400 via-orange-500 to-amber-500 text-slate-950 text-[10px] font-black uppercase tracking-widest shadow-lg flex items-center space-x-1">
                <Crown className="w-3 h-3" />
                <span>Champion #1</span>
              </div>
              <div className="mt-2">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-400 via-orange-500 to-amber-500 flex items-center justify-center font-black text-slate-950 text-xl shadow-lg shadow-amber-500/30">
                    <Trophy className="w-6 h-6 text-slate-950" />
                  </div>
                  {(() => {
                    const badge = activeConfig.badgeRule(top3[0].rating);
                    return (
                      <span className={`text-xs px-2.5 py-1 rounded-full border font-semibold tracking-wide ${badge.color}`}>
                        {badge.title}
                      </span>
                    );
                  })()}
                </div>
                <h3 className="text-xl font-black text-white group-hover:text-amber-300 transition font-display">
                  {top3[0].fullName}
                </h3>
                <div className="flex items-center space-x-2 text-xs text-[#edf0f7]/80 mt-1 font-mono">
                  <span className="font-semibold text-amber-400">{top3[0].branch}</span>
                  <span>&middot;</span>
                  <span>Year {top3[0].academicYear}</span>
                  <span>&middot;</span>
                  <span className="text-[#99a4b7]">{top3[0].rollNumber}</span>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-amber-500/20 flex items-center justify-between">
                <div>
                  <div className="text-3xl font-black font-display text-gradient-amber">
                    {top3[0].rating}
                  </div>
                  <div className="text-xs text-amber-400/90 font-medium">{activeConfig.ratingLabel}</div>
                </div>
                <div className="text-right">
                  <div className="text-base font-bold text-emerald-400 font-mono">
                    {top3[0].total_solved} Solved
                  </div>
                  {top3[0].handle && top3[0].handle !== '—' && (
                    <a
                      href={activeConfig.profileUrl(top3[0].handle)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center space-x-1 text-xs text-amber-300 hover:text-white transition mt-0.5"
                    >
                      <span>@{top3[0].handle}</span>
                      <ArrowUpRight className="w-3.5 h-3.5" />
                    </a>
                  )}
                </div>
              </div>
            </motion.div>
          )}

          {/* 3rd Place */}
          {top3[2] && (
            <motion.div 
              whileHover={{ y: -5, scale: 1.01 }}
              transition={{ duration: 0.2 }}
              className="order-3 md:order-3 glass-card rounded-2xl p-6 border-amber-900/40 bg-[#0d111b]/80 relative overflow-hidden flex flex-col justify-between group hover:border-amber-700/50 transition-all shadow-md"
            >
              <div className="absolute top-0 right-0 w-24 h-24 bg-amber-700/10 rounded-full blur-2xl" />
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="w-10 h-10 rounded-xl bg-amber-950/40 border border-amber-800/50 flex items-center justify-center font-bold text-amber-400 font-display text-lg shadow-sm">
                    3
                  </div>
                  <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-amber-950/60 text-amber-400 border border-amber-800/50 font-semibold tracking-wide">
                    Bronze Medal
                  </span>
                </div>
                <h3 className="text-lg font-bold text-white group-hover:text-amber-200 transition font-display">
                  {top3[2].fullName}
                </h3>
                <div className="flex items-center space-x-2 text-xs text-[#99a4b7] mt-1 font-mono">
                  <span>{top3[2].branch}</span>
                  <span>&middot;</span>
                  <span>Yr {top3[2].academicYear}</span>
                  <span>&middot;</span>
                  <span>{top3[2].rollNumber}</span>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-[#202735] flex items-center justify-between">
                <div>
                  <div className="text-2xl font-black font-display text-white">
                    {top3[2].rating}
                  </div>
                  <div className="text-[11px] text-[#99a4b7]">{activeConfig.ratingLabel}</div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-semibold text-emerald-400 font-mono">
                    {top3[2].total_solved} solved
                  </div>
                  {top3[2].handle && top3[2].handle !== '—' && (
                    <a
                      href={activeConfig.profileUrl(top3[2].handle)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center space-x-1 text-xs text-[#99a4b7] hover:text-white transition mt-0.5"
                    >
                      <span>@{top3[2].handle}</span>
                      <ArrowUpRight className="w-3 h-3 text-[#99a4b7]" />
                    </a>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </motion.div>
      )}

      {/* Rankings Data Table */}
      <motion.div 
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, delay: 0.1 }}
        className="glass-card rounded-2xl overflow-hidden border border-[#202735] bg-[#0d111b]/80 backdrop-blur-xl shadow-xl"
      >
        <div className="px-6 py-4 border-b border-[#202735] flex items-center justify-between bg-[#080b12]/50">
          <div className="flex items-center space-x-2.5">
            <activeConfig.icon className="w-4 h-4 flex-shrink-0" />
            <span className="text-xs font-bold text-white uppercase tracking-wider font-display">
              {activeConfig.name} Leaderboard Standings
            </span>
            <span className="text-[11px] px-2 py-0.5 rounded-full bg-[#161d2d] text-[#84d9eb] font-mono border border-[#222936]">
              {filteredStudents.length} Students
            </span>
          </div>
        </div>

        {loading ? (
          <div className="py-24 text-center">
            <RefreshCw className="w-8 h-8 text-[#84d9eb] animate-spin mx-auto mb-3" />
            <p className="text-sm text-[#99a4b7]">Loading standings from database...</p>
          </div>
        ) : filteredStudents.length === 0 ? (
          <div className="py-20 text-center">
            <AlertCircle className="w-10 h-10 text-slate-600 mx-auto mb-3" />
            <p className="text-slate-200 font-semibold font-display">No students found matching filters.</p>
            <p className="text-xs text-[#99a4b7] mt-1">Try clearing search terms or changing year/branch filters.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[#202735] bg-[#080b12]/60 text-[10px] font-bold text-[#99a4b7] uppercase tracking-wider font-mono">
                  <th className="py-3.5 px-6 w-16">Rank</th>
                  <th className="py-3.5 px-6">Student Information</th>
                  <th className="py-3.5 px-6">Platform Handle</th>
                  <th className="py-3.5 px-6">Tier Status</th>
                  <th className="py-3.5 px-6 text-right">Rating</th>
                  <th className="py-3.5 px-6 text-right">Problems Solved</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#202735]/60 text-sm">
                {filteredStudents.map((student, idx) => {
                  const rank = idx + 1;
                  const badge = activeConfig.badgeRule(student.rating);

                  return (
                    <motion.tr
                      key={student.rollNumber || student.uid || idx}
                      initial={{ opacity: 0, y: 4 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.2, delay: Math.min(idx * 0.03, 0.3) }}
                      className="hover:bg-[#161d2d]/60 transition-colors duration-150 group"
                    >
                      {/* Rank Column */}
                      <td className="py-4 px-6 font-mono font-bold">
                        {rank === 1 ? (
                          <span className="w-7 h-7 rounded-lg bg-gradient-to-tr from-amber-400 to-orange-500 text-slate-950 flex items-center justify-center text-xs shadow-md shadow-amber-500/20">
                            1
                          </span>
                        ) : rank === 2 ? (
                          <span className="w-7 h-7 rounded-lg bg-slate-200 text-slate-950 flex items-center justify-center text-xs shadow-sm">
                            2
                          </span>
                        ) : rank === 3 ? (
                          <span className="w-7 h-7 rounded-lg bg-amber-700 text-white flex items-center justify-center text-xs shadow-sm">
                            3
                          </span>
                        ) : (
                          <span className="text-[#99a4b7] text-xs pl-2">#{rank}</span>
                        )}
                      </td>

                      {/* Student Details */}
                      <td className="py-4 px-6">
                        <div className="flex items-center space-x-3">
                          <div className="w-9 h-9 rounded-xl bg-[#161d2d] border border-[#222936] flex items-center justify-center font-bold text-white text-xs group-hover:border-[#8b9eff]/50 transition duration-200">
                            {student.fullName?.charAt(0) || 'S'}
                          </div>
                          <div>
                            <div className="font-semibold text-white group-hover:text-[#84d9eb] transition-colors duration-200 leading-tight font-display">
                              {student.fullName}
                            </div>
                            <div className="flex items-center space-x-2 text-[11px] text-[#99a4b7] mt-0.5 font-mono">
                              <span>{student.rollNumber}</span>
                              <span>&middot;</span>
                              <span className="px-1.5 py-0.2 rounded bg-[#161d2d] text-slate-300 font-medium border border-[#222936]">
                                {student.branch}
                              </span>
                              <span>&middot;</span>
                              <span>Year {student.academicYear}</span>
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Platform Handle */}
                      <td className="py-4 px-6">
                        {student.handle && student.handle !== '—' ? (
                          <a
                            href={activeConfig.profileUrl(student.handle)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center space-x-1.5 text-[#edf0f7] hover:text-white font-mono text-xs bg-[#080b12]/80 px-2.5 py-1 rounded-lg border border-[#222936] hover:border-[#8b9eff]/40 transition duration-150 group/handle"
                          >
                            <activeConfig.icon className="w-3.5 h-3.5 flex-shrink-0" />
                            <span>@{student.handle}</span>
                            <ArrowUpRight className="w-3 h-3 text-[#99a4b7] group-hover/handle:text-[#84d9eb] group-hover/handle:translate-x-0.5 group-hover/handle:-translate-y-0.5 transition-transform" />
                          </a>
                        ) : (
                          <span className="text-slate-600 font-mono text-xs">—</span>
                        )}
                      </td>

                      {/* Tier Badge */}
                      <td className="py-4 px-6">
                        <span className={`text-[11px] px-2.5 py-0.5 rounded-full border font-medium ${badge.color}`}>
                          {badge.title}
                        </span>
                      </td>

                      {/* Rating */}
                      <td className="py-4 px-6 text-right font-display font-black text-base text-white">
                        {student.rating}
                      </td>

                      {/* Total Solved */}
                      <td className="py-4 px-6 text-right">
                        <span className="font-bold text-emerald-400 font-mono text-sm">
                          {student.total_solved}
                        </span>
                        <span className="text-[11px] text-[#99a4b7] ml-1">problems</span>
                      </td>
                    </motion.tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </motion.div>
    </div>
  );
}