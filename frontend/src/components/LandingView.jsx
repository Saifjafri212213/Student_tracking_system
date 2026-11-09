import React from 'react';
import { motion } from 'framer-motion';
import { 
  Trophy, 
  ArrowRight, 
  ChevronRight, 
  Sparkles, 
  GraduationCap, 
  TrendingUp, 
  ShieldCheck, 
  Users, 
  Zap, 
  Award,
  CheckCircle2,
  ExternalLink,
  Flame,
  Clock,
  Compass,
  Code2,
  Terminal
} from 'lucide-react';
import { LeetCodeIcon, CodeforcesIcon, CodeChefIcon } from './PlatformIcons';
import { ContestSchedule } from './ContestSchedule';

export function LandingView({ user, isAuthenticated, onOpenAuth, onExploreLeaderboard, onExplorePractice }) {
  return (
    <div className="w-full space-y-16 py-4">
      {/* 1. Logged-in Personalized Welcome Banner */}
      {isAuthenticated && user && (
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="glass-card rounded-3xl p-6 sm:p-8 border border-[#202735] bg-gradient-to-r from-[#0d111b] via-[#121927] to-[#0d111b] relative overflow-hidden shadow-2xl"
        >
          <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-bl from-[#84d9eb]/10 via-[#8b9eff]/10 to-transparent rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-[#8b9eff] to-[#84d9eb] flex items-center justify-center font-black text-2xl text-[#080b12] shadow-xl shadow-[#8b9eff]/25">
                {user.fullName?.charAt(0) || 'U'}
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <h1 className="text-2xl sm:text-3xl font-black font-display text-white">
                    Welcome back, {user.fullName?.split(' ')[0]}!
                  </h1>
                  <span className="text-xl">👋</span>
                </div>
                <div className="flex items-center space-x-2 text-xs text-slate-400 font-mono mt-1">
                  <span className="text-[#84d9eb] font-semibold">{user.rollNumber}</span>
                  <span>&middot;</span>
                  <span>{user.branch} Department</span>
                  <span>&middot;</span>
                  <span>Year {user.academicYear}</span>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={onExploreLeaderboard}
                className="px-5 py-2.5 rounded-xl font-bold text-xs bg-gradient-to-r from-[#566ae6] to-[#8b9eff] text-white shadow-md shadow-[#566ae6]/25 hover:from-[#667af0] hover:to-[#9cb0ff] transition flex items-center space-x-2"
              >
                <Trophy className="w-4 h-4 text-amber-300" />
                <span>Campus Leaderboards</span>
              </button>
              <button
                onClick={onExplorePractice}
                className="px-4 py-2.5 rounded-xl font-semibold text-xs bg-[#080b12] hover:bg-[#161d2d] border border-[#222936] text-slate-300 hover:text-white transition flex items-center space-x-2"
              >
                <Code2 className="w-4 h-4 text-[#84d9eb]" />
                <span>CSES Practice Arena</span>
              </button>
            </div>
          </div>

          {/* Connected Handles Strip */}
          <div className="mt-6 pt-5 border-t border-[#202735] grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="flex items-center justify-between p-3 rounded-xl bg-[#080b12]/80 border border-[#222936]">
              <div className="flex items-center space-x-2">
                <LeetCodeIcon className="w-4 h-4 flex-shrink-0" />
                <span className="text-xs text-slate-400 font-medium">LeetCode:</span>
              </div>
              <span className="text-xs font-mono font-bold text-amber-400">
                {user.handles?.leetcode ? `@${user.handles.leetcode}` : '—'}
              </span>
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl bg-[#080b12]/80 border border-[#222936]">
              <div className="flex items-center space-x-2">
                <CodeforcesIcon className="w-4 h-4 flex-shrink-0" />
                <span className="text-xs text-slate-400 font-medium">Codeforces:</span>
              </div>
              <span className="text-xs font-mono font-bold text-blue-400">
                {user.handles?.codeforces ? `@${user.handles.codeforces}` : '—'}
              </span>
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl bg-[#080b12]/80 border border-[#222936]">
              <div className="flex items-center space-x-2">
                <CodeChefIcon className="w-4 h-4 flex-shrink-0" />
                <span className="text-xs text-slate-400 font-medium">CodeChef:</span>
              </div>
              <span className="text-xs font-mono font-bold text-emerald-400">
                {user.handles?.codechef ? `@${user.handles.codechef}` : '—'}
              </span>
            </div>
          </div>
        </motion.div>
      )}

      {/* 2. Logged-out Hero Section (LeetCode Style) */}
      {!isAuthenticated && (
        <section className="relative pt-6 pb-4 overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Left Column: Slanted Device / Tablet Mockup (LeetCode Inspired) */}
            <motion.div 
              initial={{ opacity: 0, x: -40, rotateY: 10 }}
              animate={{ opacity: 1, x: 0, rotateY: 0 }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              className="lg:col-span-6 relative order-2 lg:order-1"
            >
              {/* Ambient decorative glow */}
              <div className="absolute -inset-4 bg-gradient-to-tr from-[#84d9eb]/20 via-[#8b9eff]/20 to-[#ffa116]/15 rounded-3xl blur-2xl -z-10" />

              {/* Floating Mockup Tablet Frame */}
              <div className="relative mx-auto rounded-3xl bg-slate-900/90 border border-slate-700/60 p-4 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.8)] backdrop-blur-xl transform -rotate-1 hover:rotate-0 transition-transform duration-500 group">
                {/* Tablet Top Bezel */}
                <div className="flex items-center justify-between px-3 py-2 border-b border-slate-800/80 mb-3">
                  <div className="flex items-center space-x-1.5">
                    <div className="w-2.5 h-2.5 rounded-full bg-rose-500/80" />
                    <div className="w-2.5 h-2.5 rounded-full bg-amber-500/80" />
                    <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/80" />
                  </div>
                  <div className="text-[10px] font-mono text-slate-400 flex items-center space-x-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    <span>coderank.campus/live-standings</span>
                  </div>
                  <div className="w-6" />
                </div>

                {/* Tablet Screen Content: Interactive Visual Preview */}
                <div className="rounded-2xl bg-[#080b12] p-4 border border-slate-800/60 space-y-4">
                  {/* Header Row inside tablet */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-[#8b9eff] to-[#84d9eb] flex items-center justify-center shadow-sm">
                        <Trophy className="w-4 h-4 text-[#080b12]" />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-white font-display">Campus Standings</div>
                        <div className="text-[10px] text-slate-400">Live Rating Index</div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-1 px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-mono">
                      <TrendingUp className="w-3 h-3 mr-1" />
                      <span>Real-time</span>
                    </div>
                  </div>

                  {/* Platform Badge Strip inside tablet */}
                  <div className="grid grid-cols-3 gap-2">
                    <div className="p-2 rounded-xl bg-[#161d2d]/90 border border-amber-500/30 flex items-center space-x-2">
                      <LeetCodeIcon className="w-4 h-4 flex-shrink-0" />
                      <div className="truncate">
                        <div className="text-[10px] text-slate-400">LeetCode</div>
                        <div className="text-xs font-bold text-amber-400 font-mono">2,180</div>
                      </div>
                    </div>
                    <div className="p-2 rounded-xl bg-[#161d2d]/90 border border-blue-500/30 flex items-center space-x-2">
                      <CodeforcesIcon className="w-4 h-4 flex-shrink-0" />
                      <div className="truncate">
                        <div className="text-[10px] text-slate-400">Codeforces</div>
                        <div className="text-xs font-bold text-blue-400 font-mono">1,940</div>
                      </div>
                    </div>
                    <div className="p-2 rounded-xl bg-[#161d2d]/90 border border-emerald-500/30 flex items-center space-x-2">
                      <CodeChefIcon className="w-4 h-4 flex-shrink-0" />
                      <div className="truncate">
                        <div className="text-[10px] text-slate-400">CodeChef</div>
                        <div className="text-xs font-bold text-emerald-400 font-mono">2,050</div>
                      </div>
                    </div>
                  </div>

                  {/* Mini Leaderboard Podium Rows */}
                  <div className="space-y-2 pt-1">
                    <div className="flex items-center justify-between p-2 rounded-xl bg-[#0f1422] border border-amber-500/30">
                      <div className="flex items-center space-x-2.5">
                        <span className="w-5 h-5 rounded-md bg-gradient-to-tr from-amber-400 to-orange-500 text-slate-950 flex items-center justify-center text-[10px] font-black">
                          1
                        </span>
                        <div>
                          <div className="text-xs font-bold text-white font-display">Aarav Sharma</div>
                          <div className="text-[10px] text-slate-400 font-mono">CSE &middot; Yr 4</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-300 border border-amber-500/30 font-medium">
                          Knight 2180
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between p-2 rounded-xl bg-[#0f1422] border border-slate-800">
                      <div className="flex items-center space-x-2.5">
                        <span className="w-5 h-5 rounded-md bg-slate-200 text-slate-950 flex items-center justify-center text-[10px] font-black">
                          2
                        </span>
                        <div>
                          <div className="text-xs font-bold text-white font-display">Priya Patel</div>
                          <div className="text-[10px] text-slate-400 font-mono">CSE &middot; Yr 3</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-700/40 text-slate-300 border border-slate-600/30 font-medium">
                          1980 Rating
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between p-2 rounded-xl bg-[#0f1422] border border-slate-800">
                      <div className="flex items-center space-x-2.5">
                        <span className="w-5 h-5 rounded-md bg-amber-800 text-white flex items-center justify-center text-[10px] font-black">
                          3
                        </span>
                        <div>
                          <div className="text-xs font-bold text-white font-display">Rohan Verma</div>
                          <div className="text-[10px] text-slate-400 font-mono">IT &middot; Yr 3</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-700/40 text-slate-300 border border-slate-600/30 font-medium">
                          1890 Rating
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* CSES Practice Arena preview snippet */}
                  <div className="p-2.5 rounded-xl bg-[#111728]/70 border border-[#222936] flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Code2 className="w-4 h-4 text-[#84d9eb]" />
                      <span className="text-[11px] text-slate-300">CSES Problem Set &middot; 300+ Classic Tasks</span>
                    </div>
                    <span className="text-[10px] text-[#84d9eb] font-mono font-bold">cses.fi</span>
                  </div>
                </div>
              </div>

              {/* Floating interactive achievement badge */}
              <motion.div
                animate={{ y: [0, -8, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                className="absolute -bottom-5 -left-4 sm:left-4 p-3 rounded-2xl bg-[#0d111b]/95 border border-[#84d9eb]/40 shadow-xl backdrop-blur-xl flex items-center space-x-3 z-20"
              >
                <div className="w-9 h-9 rounded-xl bg-[#84d9eb]/15 flex items-center justify-center text-[#84d9eb]">
                  <Zap className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs font-bold text-white">Live Sync Active</div>
                  <div className="text-[10px] text-slate-400">LeetCode, Codeforces & CodeChef</div>
                </div>
              </motion.div>
            </motion.div>

            {/* Right Column: Hero Content */}
            <motion.div 
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              className="lg:col-span-6 space-y-6 text-center lg:text-left order-1 lg:order-2"
            >
              <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-[#161d2d] border border-[#222936] text-xs text-[#84d9eb] font-mono">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Campus Competitive Programming Hub</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black font-display tracking-tight text-white leading-[1.1]">
                A New Way to <br className="hidden sm:inline" />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-[#84d9eb] to-[#8b9eff]">
                  Compete & Learn
                </span>
              </h1>

              <p className="text-base sm:text-lg text-slate-300 max-w-xl mx-auto lg:mx-0 font-normal leading-relaxed">
                CodeRank is the premier campus platform to track your competitive programming rank across LeetCode, Codeforces, and CodeChef, resolve algorithm doubts, and prepare for high-impact technical interviews.
              </p>

              <div className="pt-2 flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3.5">
                <motion.button
                  onClick={() => onOpenAuth('register')}
                  whileHover={{ scale: 1.03, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full sm:w-auto px-7 py-3.5 rounded-xl font-bold text-sm bg-gradient-to-r from-[#00b8a3] to-[#00d2b4] hover:from-[#00c9b2] hover:to-[#1de9b6] text-slate-950 shadow-lg shadow-[#00b8a3]/25 flex items-center justify-center space-x-2 transition group"
                >
                  <span>Create Account</span>
                  <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </motion.button>

                <motion.button
                  onClick={onExploreLeaderboard}
                  whileHover={{ scale: 1.02, y: -1 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full sm:w-auto px-6 py-3.5 rounded-xl font-semibold text-sm bg-[#0d111b] hover:bg-[#161d2d] border border-[#222936] hover:border-[#8b9eff]/50 text-white flex items-center justify-center space-x-2 transition"
                >
                  <Trophy className="w-4 h-4 text-[#ffa116]" />
                  <span>Explore Leaderboards</span>
                </motion.button>
              </div>

              <div className="pt-4 flex flex-wrap items-center justify-center lg:justify-start gap-6 text-xs text-slate-400">
                <div className="flex items-center space-x-1.5">
                  <CheckCircle2 className="w-4 h-4 text-[#00b8a3]" />
                  <span>Independent platform rankings</span>
                </div>
                <div className="flex items-center space-x-1.5">
                  <CheckCircle2 className="w-4 h-4 text-[#00b8a3]" />
                  <span>Peer doubt solving</span>
                </div>
                <div className="flex items-center space-x-1.5">
                  <CheckCircle2 className="w-4 h-4 text-[#00b8a3]" />
                  <span>100% Free for students</span>
                </div>
              </div>
            </motion.div>
          </div>
        </section>
      )}

      {/* 3. Upcoming Contests & Live Timing Section */}
      <section className="relative pt-4">
        <ContestSchedule user={user} />
      </section>

      {/* 4. "Start Exploring" Section */}
      <section className="pt-8 border-t border-[#202735]/80 space-y-12">
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#00b8a3] to-[#84d9eb] shadow-lg shadow-[#00b8a3]/20 mx-auto text-slate-950">
            <GraduationCap className="w-6 h-6 text-slate-950" />
          </div>
          <h2 className="text-3xl font-black font-display text-white tracking-tight">
            Start Exploring
          </h2>
          <p className="text-sm text-slate-400">
            Explore is a well-organized ecosystem that helps you get the most out of your campus coding journey by providing structure, verified peer rankings, and collaborative answers.
          </p>
        </div>

        {/* 3 Core Feature Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <motion.div
            whileHover={{ y: -6 }}
            transition={{ duration: 0.2 }}
            onClick={onExploreLeaderboard}
            className="cursor-pointer glass-card rounded-2xl p-6 border border-[#202735] bg-[#0d111b]/80 hover:border-[#ffa116]/40 transition group flex flex-col justify-between"
          >
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
                  <Trophy className="w-6 h-6" />
                </div>
                <div className="flex items-center space-x-1.5">
                  <LeetCodeIcon className="w-4 h-4" />
                  <CodeforcesIcon className="w-4 h-4" />
                  <CodeChefIcon className="w-4 h-4" />
                </div>
              </div>
              <h3 className="text-lg font-bold text-white group-hover:text-amber-400 transition font-display">
                Multi-Platform Standings
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Connect your LeetCode, Codeforces, and CodeChef handles. Track individual platform rankings without artificially distorted mixed formulas.
              </p>
            </div>

            <div className="mt-6 pt-4 border-t border-[#202735] flex items-center text-xs font-semibold text-amber-400 group-hover:translate-x-1 transition-transform">
              <span>View Leaderboards</span>
              <ArrowRight className="w-3.5 h-3.5 ml-1" />
            </div>
          </motion.div>

          <motion.div
            whileHover={{ y: -6 }}
            transition={{ duration: 0.2 }}
            onClick={onExplorePractice}
            className="cursor-pointer glass-card rounded-2xl p-6 border border-[#202735] bg-[#0d111b]/80 hover:border-[#84d9eb]/40 transition group flex flex-col justify-between"
          >
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 rounded-xl bg-[#84d9eb]/10 border border-[#84d9eb]/20 flex items-center justify-center text-[#84d9eb]">
                  <Code2 className="w-6 h-6" />
                </div>
                <span className="text-[11px] px-2 py-0.5 rounded-full bg-[#161d2d] text-[#84d9eb] border border-[#222936] font-mono">
                  300+ Classic Tasks
                </span>
              </div>
              <h3 className="text-lg font-bold text-white group-hover:text-[#84d9eb] transition font-display">
                CSES Practice Arena
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Master 300+ curated algorithmic problems across DP, Graphs, Range Queries, Trees, and Mathematics with live embedded CSES integration and progress tracking.
              </p>
            </div>

            <div className="mt-6 pt-4 border-t border-[#202735] flex items-center text-xs font-semibold text-[#84d9eb] group-hover:translate-x-1 transition-transform">
              <span>Start Practicing</span>
              <ArrowRight className="w-3.5 h-3.5 ml-1" />
            </div>
          </motion.div>

          <motion.div
            whileHover={{ y: -6 }}
            transition={{ duration: 0.2 }}
            onClick={onExploreLeaderboard}
            className="cursor-pointer glass-card rounded-2xl p-6 border border-[#202735] bg-[#0d111b]/80 hover:border-[#84d9eb]/40 transition group flex flex-col justify-between"
          >
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 rounded-xl bg-[#84d9eb]/10 border border-[#84d9eb]/20 flex items-center justify-center text-[#84d9eb]">
                  <Users className="w-6 h-6" />
                </div>
                <span className="text-[11px] px-2 py-0.5 rounded-full bg-[#161d2d] text-[#84d9eb] border border-[#222936] font-mono">
                  CSE &middot; IT &middot; ECE
                </span>
              </div>
              <h3 className="text-lg font-bold text-white group-hover:text-[#84d9eb] transition font-display">
                Batch & Branch Rankings
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Filter standings by academic year (1st to 4th year) and engineering department to see where you stand among your immediate peers.
              </p>
            </div>

            <div className="mt-6 pt-4 border-t border-[#202735] flex items-center text-xs font-semibold text-[#84d9eb] group-hover:translate-x-1 transition-transform">
              <span>Filter by Department</span>
              <ArrowRight className="w-3.5 h-3.5 ml-1" />
            </div>
          </motion.div>
        </div>
      </section>

      {/* 5. Bottom CTA Banner for Guests */}
      {!isAuthenticated && (
        <section className="relative rounded-3xl p-8 sm:p-12 overflow-hidden border border-[#202735] bg-gradient-to-r from-[#0d111b] via-[#121927] to-[#0d111b] text-center space-y-6">
          <div className="absolute inset-0 bg-grid-pattern opacity-30 pointer-events-none" />
          <div className="relative z-10 max-w-xl mx-auto space-y-4">
            <h3 className="text-2xl sm:text-3xl font-black font-display text-white">
              Ready to climb your campus leaderboard?
            </h3>
            <p className="text-xs sm:text-sm text-slate-300">
              Join students from your college already tracking their competitive programming progress on CodeRank.
            </p>
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
              <motion.button
                onClick={() => onOpenAuth('register')}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.98 }}
                className="w-full sm:w-auto px-7 py-3 rounded-xl font-bold text-sm bg-gradient-to-r from-[#00b8a3] to-[#00d2b4] text-slate-950 shadow-lg shadow-[#00b8a3]/25 transition"
              >
                Sign Up Now &middot; Free
              </motion.button>
              <motion.button
                onClick={() => onOpenAuth('login')}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full sm:w-auto px-6 py-3 rounded-xl font-medium text-xs text-slate-300 hover:text-white bg-[#080b12] border border-[#222936] transition"
              >
                Already registered? Sign In
              </motion.button>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
