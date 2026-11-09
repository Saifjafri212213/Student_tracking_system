import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Code2, 
  ExternalLink, 
  CheckCircle2, 
  Circle, 
  Search, 
  Filter, 
  Trophy, 
  Sparkles, 
  ArrowUpRight, 
  Terminal, 
  BookOpen, 
  LayoutGrid, 
  Maximize2, 
  RotateCcw,
  Zap,
  Globe
} from 'lucide-react';
import { CSES_CATEGORIES, CSES_PROBLEMS } from '../data/csesProblems';
import { LeetCodeIcon, CodeforcesIcon, CodeChefIcon } from './PlatformIcons';

export function PracticeView() {
  const [activeCategory, setActiveCategory] = useState('All');
  const [search, setSearch] = useState('');
  const [difficultyFilter, setDifficultyFilter] = useState('All');
  const [viewMode, setViewMode] = useState('list'); // 'list' or 'embed'
  const [solvedIds, setSolvedIds] = useState(() => {
    try {
      const saved = localStorage.getItem('coderank_cses_solved');
      return saved ? JSON.parse(saved) : ['1068', '1083', '1069'];
    } catch (e) {
      return ['1068', '1083'];
    }
  });

  // Save solved IDs to localStorage
  const toggleSolved = (id) => {
    setSolvedIds((prev) => {
      const updated = prev.includes(id)
        ? prev.filter((item) => item !== id)
        : [...prev, id];
      try {
        localStorage.setItem('coderank_cses_solved', JSON.stringify(updated));
      } catch (e) {}
      return updated;
    });
  };

  const filteredProblems = CSES_PROBLEMS.filter((p) => {
    const matchesCat = activeCategory === 'All' || p.category === activeCategory;
    const matchesDiff = difficultyFilter === 'All' || p.difficulty === difficultyFilter;
    const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase()) || p.id.includes(search);
    return matchesCat && matchesDiff && matchesSearch;
  });

  const solvedCount = CSES_PROBLEMS.filter(p => solvedIds.includes(p.id)).length;
  const progressPercent = Math.round((solvedCount / CSES_PROBLEMS.length) * 100);

  return (
    <div className="w-full space-y-8">
      {/* Top Header Banner */}
      <motion.div 
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card rounded-3xl p-6 sm:p-8 border border-[#202735] bg-[#0d111b]/80 relative overflow-hidden shadow-2xl"
      >
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-[#84d9eb]/10 via-[#8b9eff]/10 to-transparent rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <h1 className="text-3xl sm:text-4xl font-black font-display text-white tracking-tight">
              CSES Practice Arena
            </h1>
            <p className="text-sm text-slate-300 max-w-2xl leading-relaxed">
              Master the world-renowned CSES Problem Set by Antti Laaksonen. Curated algorithmic tracks covering Introductory, DP, Graphs, Range Queries, and Trees.
            </p>
          </div>

          {/* Action & View Mode Toggles */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Direct Official Site Link */}
            <a
              href="https://cses.fi/problemset/"
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2.5 rounded-xl font-bold text-xs bg-gradient-to-r from-[#00b8a3] to-[#00d2b4] hover:from-[#00c9b2] hover:to-[#1de9b6] text-slate-950 shadow-md shadow-[#00b8a3]/20 transition flex items-center space-x-2"
            >
              <span>Open cses.fi Official</span>
              <ArrowUpRight className="w-4 h-4" />
            </a>

            {/* Toggle Between Curated List and Embedded CSES Frame */}
            <div className="flex items-center p-1 rounded-xl bg-[#080b12] border border-[#202735] text-xs font-semibold">
              <button
                onClick={() => setViewMode('list')}
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg transition ${
                  viewMode === 'list'
                    ? 'bg-[#1b2436] text-white shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <LayoutGrid className="w-3.5 h-3.5" />
                <span>Problem List</span>
              </button>
              <button
                onClick={() => setViewMode('embed')}
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg transition ${
                  viewMode === 'embed'
                    ? 'bg-[#1b2436] text-white shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Globe className="w-3.5 h-3.5 text-[#84d9eb]" />
                <span>Live CSES Portal</span>
              </button>
            </div>
          </div>
        </div>

        {/* Progress & Quick Stats Bar */}
        <div className="mt-6 pt-6 border-t border-[#202735] grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-3.5 rounded-xl bg-[#080b12]/80 border border-[#222936] flex items-center justify-between">
            <div>
              <div className="text-[10px] text-slate-500 font-mono uppercase">CSES Progress</div>
              <div className="text-lg font-black text-white font-display">
                {solvedCount} <span className="text-xs text-slate-500 font-normal">/ {CSES_PROBLEMS.length} Solved</span>
              </div>
            </div>
            <span className="text-xs font-mono font-bold text-emerald-400">{progressPercent}%</span>
          </div>

          <div className="p-3.5 rounded-xl bg-[#080b12]/80 border border-[#222936] flex items-center justify-between">
            <div>
              <div className="text-[10px] text-slate-500 font-mono uppercase">Curated Tracks</div>
              <div className="text-lg font-black text-[#84d9eb] font-display">8 Topics</div>
            </div>
            <span className="text-xs text-slate-400 font-mono">Intro to DP & Trees</span>
          </div>

          <div className="p-3.5 rounded-xl bg-[#080b12]/80 border border-[#222936] flex items-center justify-between">
            <div>
              <div className="text-[10px] text-slate-500 font-mono uppercase">Submission Platform</div>
              <div className="text-lg font-black text-[#ffa116] font-display">CSES Online Judge</div>
            </div>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-mono">
              Live &middot; Fast
            </span>
          </div>
        </div>
      </motion.div>

      {/* VIEW MODE 1: LIVE CSES EMBEDDED PORTAL */}
      {viewMode === 'embed' && (
        <motion.div 
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          className="glass-card rounded-3xl overflow-hidden border border-[#202735] bg-[#0d111b] shadow-2xl"
        >
          <div className="px-6 py-3.5 border-b border-[#202735] bg-[#080b12]/90 flex items-center justify-between">
            <div className="flex items-center space-x-2 text-xs text-slate-300 font-mono">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>CSES Online Judge Portal</span>
            </div>
            <div className="flex items-center space-x-2">
              <a
                href="https://cses.fi/problemset/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-[#84d9eb] hover:underline flex items-center space-x-1 font-mono"
              >
                <span>Open in Full Tab</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
          <div className="w-full h-[800px] bg-white">
            <iframe
              src="https://cses.fi/problemset/"
              title="CSES Problemset"
              className="w-full h-full border-0"
              sandbox="allow-same-origin allow-scripts allow-forms allow-popups"
            />
          </div>
        </motion.div>
      )}

      {/* VIEW MODE 2: CURATED FILTERABLE PROBLEMSET */}
      {viewMode === 'list' && (
        <div className="space-y-6">
          {/* Filter Bar */}
          <div className="glass-card rounded-2xl p-4 border border-[#202735] bg-[#0d111b]/80 backdrop-blur-xl flex flex-col lg:flex-row items-center justify-between gap-4">
            {/* Search Input */}
            <div className="relative w-full lg:w-80">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search CSES problems (e.g. Weird, Labyrinth)..."
                className="w-full pl-10 pr-4 py-2 rounded-xl bg-[#080b12]/90 border border-[#222936] text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-[#84d9eb] font-sans transition"
              />
            </div>

            {/* Difficulty Selector */}
            <div className="flex items-center space-x-2 w-full lg:w-auto">
              <span className="text-xs text-slate-400 font-medium">Difficulty:</span>
              <div className="flex items-center p-1 rounded-xl bg-[#080b12] border border-[#222936] text-xs">
                {['All', 'Easy', 'Medium', 'Hard'].map((diff) => (
                  <button
                    key={diff}
                    onClick={() => setDifficultyFilter(diff)}
                    className={`px-3 py-1 rounded-lg font-medium transition ${
                      difficultyFilter === diff
                        ? 'bg-[#1b2436] text-white shadow-sm'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {diff}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Category Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-thin">
            {CSES_CATEGORIES.map((cat) => {
              const isActive = activeCategory === cat;
              return (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition duration-200 ${
                    isActive
                      ? 'bg-gradient-to-r from-[#566ae6] to-[#8b9eff] text-white shadow-md shadow-[#566ae6]/20'
                      : 'bg-[#0d111b] text-slate-400 hover:text-white border border-[#202735] hover:border-slate-700'
                  }`}
                >
                  {cat}
                </button>
              );
            })}
          </div>

          {/* Problems Table / List */}
          <div className="glass-card rounded-2xl overflow-hidden border border-[#202735] bg-[#0d111b]/80 shadow-xl">
            <div className="px-6 py-4 border-b border-[#202735] bg-[#080b12]/60 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Code2 className="w-4 h-4 text-[#84d9eb]" />
                <span className="text-xs font-bold text-white uppercase tracking-wider font-display">
                  {activeCategory === 'All' ? 'All CSES Problems' : activeCategory}
                </span>
                <span className="text-[11px] px-2 py-0.5 rounded-full bg-[#161d2d] text-[#84d9eb] font-mono border border-[#222936]">
                  {filteredProblems.length} Tasks
                </span>
              </div>
            </div>

            {filteredProblems.length === 0 ? (
              <div className="py-20 text-center text-slate-400 text-xs">
                No problems match your search or filter.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-[#202735] bg-[#080b12]/40 text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono">
                      <th className="py-3 px-6 w-12 text-center">Status</th>
                      <th className="py-3 px-4 w-16">ID</th>
                      <th className="py-3 px-6">Problem Name</th>
                      <th className="py-3 px-6">Topic Category</th>
                      <th className="py-3 px-6 text-center">Difficulty</th>
                      <th className="py-3 px-6 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#202735]/60 text-xs">
                    {filteredProblems.map((problem) => {
                      const isSolved = solvedIds.includes(problem.id);
                      const diffColor = 
                        problem.difficulty === 'Easy' 
                          ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/25'
                          : problem.difficulty === 'Medium'
                          ? 'bg-amber-500/10 text-amber-400 border-amber-500/25'
                          : 'bg-rose-500/10 text-rose-400 border-rose-500/25';

                      return (
                        <tr
                          key={problem.id}
                          className="hover:bg-[#161d2d]/60 transition-colors duration-150 group"
                        >
                          {/* Status Checkbox */}
                          <td className="py-3.5 px-6 text-center">
                            <button
                              onClick={() => toggleSolved(problem.id)}
                              title={isSolved ? 'Mark as Unsolved' : 'Mark as Solved'}
                              className="focus:outline-none transition-transform active:scale-90"
                            >
                              {isSolved ? (
                                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                              ) : (
                                <Circle className="w-4 h-4 text-slate-600 group-hover:text-slate-400" />
                              )}
                            </button>
                          </td>

                          {/* Task ID */}
                          <td className="py-3.5 px-4 font-mono text-slate-500 text-[11px]">
                            #{problem.id}
                          </td>

                          {/* Name */}
                          <td className="py-3.5 px-6 font-semibold text-white group-hover:text-[#84d9eb] transition-colors font-display">
                            <a
                              href={`https://cses.fi/problemset/task/${problem.task}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="hover:underline flex items-center space-x-1.5"
                            >
                              <span>{problem.name}</span>
                              <ArrowUpRight className="w-3.5 h-3.5 text-slate-600 group-hover:text-[#84d9eb] transition" />
                            </a>
                          </td>

                          {/* Category */}
                          <td className="py-3.5 px-6 text-slate-400">
                            <span className="px-2 py-0.5 rounded-lg bg-[#080b12] border border-[#202735] text-[11px] font-mono">
                              {problem.category}
                            </span>
                          </td>

                          {/* Difficulty */}
                          <td className="py-3.5 px-6 text-center">
                            <span className={`inline-block px-2.5 py-0.5 rounded-full border text-[10px] font-bold font-mono ${diffColor}`}>
                              {problem.difficulty}
                            </span>
                          </td>

                          {/* Action Button */}
                          <td className="py-3.5 px-6 text-right">
                            <a
                              href={`https://cses.fi/problemset/task/${problem.task}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center space-x-1 px-3 py-1 rounded-lg bg-[#161d2d] hover:bg-[#202a3d] border border-[#222936] text-white text-[11px] font-semibold transition"
                            >
                              <span>Solve</span>
                              <ExternalLink className="w-3 h-3 text-[#84d9eb]" />
                            </a>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Quick Problemset Links Bar */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4">
            <a
              href="https://cses.fi/problemset/"
              target="_blank"
              rel="noopener noreferrer"
              className="p-4 rounded-2xl bg-[#0d111b] border border-[#202735] hover:border-[#84d9eb]/50 transition flex items-center justify-between group"
            >
              <div className="flex items-center space-x-3">
                <div className="w-9 h-9 rounded-xl bg-[#84d9eb]/10 flex items-center justify-center text-[#84d9eb]">
                  <Terminal className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs font-bold text-white group-hover:text-[#84d9eb] transition">
                    CSES Problem Set
                  </div>
                  <div className="text-[10px] text-slate-400 font-mono">300+ Classic Algorithmic Tasks</div>
                </div>
              </div>
              <ArrowUpRight className="w-4 h-4 text-slate-500 group-hover:text-white transition" />
            </a>

            <a
              href="https://leetcode.com/problemset/"
              target="_blank"
              rel="noopener noreferrer"
              className="p-4 rounded-2xl bg-[#0d111b] border border-[#202735] hover:border-amber-500/50 transition flex items-center justify-between group"
            >
              <div className="flex items-center space-x-3">
                <div className="w-9 h-9 rounded-xl bg-amber-500/10 flex items-center justify-center">
                  <LeetCodeIcon className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs font-bold text-white group-hover:text-amber-400 transition">
                    LeetCode Problemset
                  </div>
                  <div className="text-[10px] text-slate-400 font-mono">leetcode.com/problemset</div>
                </div>
              </div>
              <ArrowUpRight className="w-4 h-4 text-slate-500 group-hover:text-white transition" />
            </a>

            <a
              href="https://codeforces.com/problemset"
              target="_blank"
              rel="noopener noreferrer"
              className="p-4 rounded-2xl bg-[#0d111b] border border-[#202735] hover:border-blue-500/50 transition flex items-center justify-between group"
            >
              <div className="flex items-center space-x-3">
                <div className="w-9 h-9 rounded-xl bg-blue-500/10 flex items-center justify-center">
                  <CodeforcesIcon className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs font-bold text-white group-hover:text-blue-400 transition">
                    Codeforces Problemset
                  </div>
                  <div className="text-[10px] text-slate-400 font-mono">codeforces.com/problemset</div>
                </div>
              </div>
              <ArrowUpRight className="w-4 h-4 text-slate-500 group-hover:text-white transition" />
            </a>
          </div>
        </div>
      )}
    </div>
  );
}

