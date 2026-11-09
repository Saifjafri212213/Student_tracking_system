import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Calendar, 
  Clock, 
  ExternalLink, 
  RefreshCw, 
  Zap, 
  Bell, 
  Filter, 
  Sparkles,
  ChevronRight,
  Share2,
  CheckCircle2,
  Flame
} from 'lucide-react';
import { api } from '../services/api';
import { LeetCodeIcon, CodeforcesIcon, CodeChefIcon, PlatformIcon } from './PlatformIcons';

export function ContestSchedule({ user, compact = false }) {
  const [contests, setContests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('all');
  const [currentTime, setCurrentTime] = useState(Date.now());
  const [copiedId, setCopiedId] = useState(null);

  // Tick every second for live countdown precision
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(Date.now());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Fetch contests from API
  useEffect(() => {
    async function loadContests() {
      setLoading(true);
      try {
        const data = await api.getUpcomingContests();
        if (data && Array.isArray(data.contests)) {
          setContests(data.contests);
        }
      } catch (err) {
        console.warn('Contest schedule fetch failed:', err.message);
      } finally {
        setLoading(false);
      }
    }
    loadContests();
  }, []);

  // Format countdown string
  const getCountdown = (startTime, durationMinutes) => {
    const diff = startTime - currentTime;
    const durationMs = (durationMinutes || 120) * 60 * 1000;

    // Is it currently ongoing?
    if (diff <= 0 && currentTime < startTime + durationMs) {
      const remainingMs = startTime + durationMs - currentTime;
      const m = Math.floor((remainingMs / (1000 * 60)) % 60);
      const s = Math.floor((remainingMs / 1000) % 60);
      return {
        label: 'LIVE NOW',
        isLive: true,
        timeLeft: `${m}m ${s}s remaining`
      };
    }

    if (diff <= 0) {
      return { label: 'ENDED', isLive: false, timeLeft: 'Completed' };
    }

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
    const minutes = Math.floor((diff / (1000 * 60)) % 60);
    const seconds = Math.floor((diff / 1000) % 60);

    return {
      label: 'STARTS IN',
      isLive: false,
      isSoon: days === 0 && hours < 12,
      days,
      hours,
      minutes,
      seconds,
      timeLeft: days > 0 
        ? `${days}d ${hours}h ${minutes}m ${seconds}s` 
        : `${hours}h ${minutes}m ${seconds}s`
    };
  };

  // Google Calendar Link generator
  const getGoogleCalendarUrl = (contest) => {
    const start = new Date(contest.startTime).toISOString().replace(/-|:|\.\d\d\d/g, '');
    const end = new Date(contest.startTime + (contest.durationMinutes || 120) * 60000).toISOString().replace(/-|:|\.\d\d\d/g, '');
    const title = encodeURIComponent(`[${contest.platform.toUpperCase()}] ${contest.name}`);
    const details = encodeURIComponent(`Campus Contest Reminder\nPlatform: ${contest.platform}\nContest URL: ${contest.url}\nTrack live on CodeRank.`);
    return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${start}/${end}&details=${details}&location=${encodeURIComponent(contest.url)}`;
  };

  const handleShare = (contest) => {
    const text = `Join ${contest.name} on ${contest.platform}! Starts ${new Date(contest.startTime).toLocaleString()}: ${contest.url}`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text);
      setCopiedId(contest.id);
      setTimeout(() => setCopiedId(null), 2500);
    }
  };

  const filteredContests = contests.filter((c) => {
    if (activeFilter === 'all') return true;
    return c.platform?.toLowerCase() === activeFilter.toLowerCase();
  });

  const platformMeta = {
    leetcode: {
      name: 'LeetCode',
      borderClass: 'hover:border-amber-500/40',
      badgeClass: 'bg-amber-500/10 text-amber-400 border-amber-500/25',
      icon: LeetCodeIcon,
      accent: '#ffa116'
    },
    codeforces: {
      name: 'Codeforces',
      borderClass: 'hover:border-blue-500/40',
      badgeClass: 'bg-blue-500/10 text-blue-400 border-blue-500/25',
      icon: CodeforcesIcon,
      accent: '#3b82f6'
    },
    codechef: {
      name: 'CodeChef',
      borderClass: 'hover:border-emerald-500/40',
      badgeClass: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/25',
      icon: CodeChefIcon,
      accent: '#10b981'
    }
  };

  return (
    <div className="w-full space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-[#ffa116] via-[#3b82f6] to-[#10b981] p-[1px]">
              <div className="w-full h-full bg-[#080b12] rounded-[7px] flex items-center justify-center">
                <Clock className="w-4 h-4 text-[#84d9eb]" />
              </div>
            </div>
            <h2 className="text-xl sm:text-2xl font-black font-display text-white tracking-tight">
              Upcoming Contests & Timing
            </h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Real-time countdown schedule across LeetCode, Codeforces, and CodeChef.
          </p>
        </div>

        {/* Platform Filter Buttons */}
        <div className="flex items-center p-1 rounded-xl bg-[#0d111b] border border-[#202735] text-xs">
          {[
            { id: 'all', label: 'All Contests' },
            { id: 'leetcode', label: 'LeetCode', icon: LeetCodeIcon },
            { id: 'codeforces', label: 'Codeforces', icon: CodeforcesIcon },
            { id: 'codechef', label: 'CodeChef', icon: CodeChefIcon }
          ].map((f) => {
            const Icon = f.icon;
            const isActive = activeFilter === f.id;
            return (
              <button
                key={f.id}
                onClick={() => setActiveFilter(f.id)}
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg font-medium transition duration-150 ${
                  isActive 
                    ? 'bg-[#1b2436] text-white shadow-sm' 
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {Icon && <Icon className="w-3.5 h-3.5 flex-shrink-0" />}
                <span>{f.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Contests Grid */}
      {loading ? (
        <div className="py-16 text-center glass-card rounded-2xl border border-[#202735] bg-[#0d111b]/80">
          <RefreshCw className="w-6 h-6 text-[#84d9eb] animate-spin mx-auto mb-2" />
          <p className="text-xs text-slate-400 font-mono">Syncing live contest calendar...</p>
        </div>
      ) : filteredContests.length === 0 ? (
        <div className="py-12 text-center glass-card rounded-2xl border border-[#202735] bg-[#0d111b]/80">
          <Calendar className="w-8 h-8 text-slate-600 mx-auto mb-2" />
          <p className="text-sm font-semibold text-slate-300">No contests found for this filter</p>
          <p className="text-xs text-slate-500 mt-1">Select "All Contests" to see other upcoming rounds.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <AnimatePresence>
            {filteredContests.map((contest, idx) => {
              const meta = platformMeta[contest.platform] || platformMeta.leetcode;
              const countdown = getCountdown(contest.startTime, contest.durationMinutes);
              const PlatformLogo = meta.icon;

              const contestDate = new Date(contest.startTime);
              const dateString = contestDate.toLocaleDateString(undefined, {
                weekday: 'short',
                month: 'short',
                day: 'numeric'
              });
              const timeString = contestDate.toLocaleTimeString(undefined, {
                hour: '2-digit',
                minute: '2-digit'
              });

              // Check if user has handle for this platform
              const userHandle = user?.handles?.[contest.platform];

              return (
                <motion.div
                  key={contest.id || idx}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.25, delay: idx * 0.04 }}
                  className={`glass-card rounded-2xl p-5 border border-[#202735] bg-[#0d111b]/90 backdrop-blur-xl transition-all duration-200 flex flex-col justify-between group ${meta.borderClass} hover:shadow-xl`}
                >
                  {/* Top Row: Platform Badge & Status */}
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <div className={`inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-lg border text-xs font-semibold ${meta.badgeClass}`}>
                        <PlatformLogo className="w-3.5 h-3.5 flex-shrink-0" />
                        <span>{meta.name}</span>
                      </div>

                      {countdown.isLive ? (
                        <span className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 text-[10px] font-bold font-mono animate-pulse">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                          <span>LIVE NOW</span>
                        </span>
                      ) : countdown.isSoon ? (
                        <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[10px] font-semibold font-mono">
                          <Flame className="w-3 h-3 text-amber-400" />
                          <span>Starting Soon</span>
                        </span>
                      ) : (
                        <span className="text-[10px] text-slate-500 font-mono">
                          {contest.durationMinutes} mins
                        </span>
                      )}
                    </div>

                    {/* Contest Name */}
                    <h3 className="text-base font-bold text-white group-hover:text-[#84d9eb] transition-colors line-clamp-2 font-display mb-2">
                      {contest.name}
                    </h3>

                    {/* Date & Time display */}
                    <div className="space-y-1 text-xs text-slate-400 mb-4 font-mono">
                      <div className="flex items-center space-x-2">
                        <Calendar className="w-3.5 h-3.5 text-slate-500 flex-shrink-0" />
                        <span>{dateString}</span>
                        <span>&middot;</span>
                        <span className="text-white font-semibold">{timeString}</span>
                      </div>
                      <div className="flex items-center space-x-2 text-[11px] text-slate-500">
                        <Clock className="w-3 h-3 text-slate-600 flex-shrink-0" />
                        <span>Duration: {Math.floor(contest.durationMinutes / 60)}h {contest.durationMinutes % 60 ? `${contest.durationMinutes % 60}m` : ''}</span>
                      </div>
                    </div>
                  </div>

                  {/* Countdown Box & Action Links */}
                  <div className="space-y-3 pt-3 border-t border-[#202735]">
                    {/* Dynamic Countdown Display */}
                    <div className="p-2.5 rounded-xl bg-[#080b12]/90 border border-[#222936] flex items-center justify-between font-mono">
                      <span className="text-[10px] uppercase font-bold text-slate-400">
                        {countdown.label}
                      </span>
                      <span className={`text-xs font-black ${
                        countdown.isLive ? 'text-emerald-400 animate-pulse' : 'text-[#84d9eb]'
                      }`}>
                        {countdown.timeLeft}
                      </span>
                    </div>

                    {/* Handle reminder if logged in */}
                    {userHandle && (
                      <div className="text-[10px] text-slate-400 flex items-center justify-between font-mono px-1">
                        <span>Your Handle:</span>
                        <span className="text-slate-200 font-semibold">@{userHandle}</span>
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex items-center space-x-2 pt-1">
                      <a
                        href={contest.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 py-2 px-3 rounded-xl bg-gradient-to-r from-[#1b2436] to-[#222f47] hover:from-[#243149] hover:to-[#2c3d5c] border border-slate-700/60 text-white text-xs font-semibold flex items-center justify-center space-x-1.5 transition group/btn"
                      >
                        <span>Participate</span>
                        <ExternalLink className="w-3.5 h-3.5 text-slate-400 group-hover/btn:text-white transition" />
                      </a>

                      {/* Add to Google Calendar */}
                      <a
                        href={getGoogleCalendarUrl(contest)}
                        target="_blank"
                        rel="noopener noreferrer"
                        title="Add to Google Calendar"
                        className="p-2 rounded-xl bg-[#080b12] border border-[#222936] hover:border-slate-600 text-slate-400 hover:text-white transition"
                      >
                        <Bell className="w-3.5 h-3.5" />
                      </a>

                      {/* Share contest link */}
                      <button
                        onClick={() => handleShare(contest)}
                        title="Copy contest details"
                        className="p-2 rounded-xl bg-[#080b12] border border-[#222936] hover:border-slate-600 text-slate-400 hover:text-white transition"
                      >
                        {copiedId === contest.id ? (
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                        ) : (
                          <Share2 className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}

