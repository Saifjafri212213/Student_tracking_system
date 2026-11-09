import React from 'react';
import { motion } from 'framer-motion';
import { Trophy, LogOut, Compass, Code2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export function Navbar({ activeTab, setActiveTab, onOpenAuth, onOpenProfile }) {
  const { user, isAuthenticated, logout } = useAuth();

  const handleLogout = () => {
    logout();
    setActiveTab('home');
  };

  return (
    <header className="sticky top-0 z-40 border-b border-[#202735] bg-[#080b12]/85 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Platform Name */}
          <div className="flex items-center space-x-6">
            <motion.button 
              onClick={() => setActiveTab(isAuthenticated ? 'leaderboard' : 'home')}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="flex items-center space-x-3 text-left group transition focus:outline-none"
            >
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#8b9eff] via-[#566ae6] to-[#84d9eb] p-[1.5px] shadow-lg shadow-[#8b9eff]/20 group-hover:shadow-[#8b9eff]/40 transition">
                <div className="w-full h-full bg-[#080b12] rounded-[9px] flex items-center justify-center">
                  <Trophy className="w-5 h-5 text-[#84d9eb] group-hover:scale-110 transition-transform duration-300" />
                </div>
              </div>
              <div className="flex items-center space-x-1.5">
                <span className="text-xl font-bold font-display tracking-tight text-white group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-white group-hover:to-[#84d9eb] transition-all duration-300">
                  CodeRank
                </span>
              </div>
            </motion.button>

            {/* Main Navigation Links with Framer Motion Sliding Pill */}
            <nav className="hidden md:flex items-center p-1 rounded-xl bg-[#0d111b]/80 border border-[#222936] relative">
              <button
                onClick={() => setActiveTab('home')}
                className={`relative z-10 flex items-center space-x-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold tracking-wide transition-colors duration-200 ${
                  activeTab === 'home' ? 'text-white' : 'text-[#99a4b7] hover:text-white'
                }`}
              >
                <Compass className="w-3.5 h-3.5 text-[#84d9eb]" />
                <span>Home</span>
                {activeTab === 'home' && (
                  <motion.div
                    layoutId="activeNavTab"
                    className="absolute inset-0 bg-[#1b2436] rounded-lg border border-[#2c374d] shadow-sm -z-10"
                    transition={{ type: 'spring', stiffness: 450, damping: 32 }}
                  />
                )}
              </button>

              {isAuthenticated && (
                <button
                  onClick={() => setActiveTab('leaderboard')}
                  className={`relative z-10 flex items-center space-x-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold tracking-wide transition-colors duration-200 ${
                    activeTab === 'leaderboard' ? 'text-white' : 'text-[#99a4b7] hover:text-white'
                  }`}
                >
                  <Trophy className="w-3.5 h-3.5 text-[#ffa116]" />
                  <span>Leaderboards</span>
                  {activeTab === 'leaderboard' && (
                    <motion.div
                      layoutId="activeNavTab"
                      className="absolute inset-0 bg-[#1b2436] rounded-lg border border-[#2c374d] shadow-sm -z-10"
                      transition={{ type: 'spring', stiffness: 450, damping: 32 }}
                    />
                  )}
                </button>
              )}

              <button
                onClick={() => {
                  if (!isAuthenticated) {
                    onOpenAuth('login', 'practice');
                  } else {
                    setActiveTab('practice');
                  }
                }}
                className={`relative z-10 flex items-center space-x-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold tracking-wide transition-colors duration-200 ${
                  activeTab === 'practice' ? 'text-white' : 'text-[#99a4b7] hover:text-white'
                }`}
              >
                <Code2 className="w-3.5 h-3.5 text-[#00b8a3]" />
                <span>Practice</span>
                {activeTab === 'practice' && (
                  <motion.div
                    layoutId="activeNavTab"
                    className="absolute inset-0 bg-[#1b2436] rounded-lg border border-[#2c374d] shadow-sm -z-10"
                    transition={{ type: 'spring', stiffness: 450, damping: 32 }}
                  />
                )}
              </button>
            </nav>
          </div>

          {/* Right Action Section */}
          <div className="flex items-center space-x-3">
            {/* Auth Section */}
            {isAuthenticated ? (
              <div className="flex items-center space-x-2">
                <motion.button
                  onClick={onOpenProfile}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="flex items-center space-x-2.5 px-3 py-1.5 rounded-xl bg-[#0d111b] border border-[#222936] hover:border-[#8b9eff]/40 text-sm font-medium transition group"
                >
                  <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-[#8b9eff] to-[#84d9eb] flex items-center justify-center text-xs font-bold text-[#080b12] shadow-sm">
                    {user?.fullName?.charAt(0) || 'U'}
                  </div>
                  <div className="text-left hidden sm:block">
                    <div className="text-xs font-semibold text-white group-hover:text-[#84d9eb] transition leading-tight font-display">
                      {user?.fullName?.split(' ')[0]}
                    </div>
                    <div className="text-[10px] text-[#99a4b7] font-mono">
                      {user?.branch} &middot; Yr {user?.academicYear}
                    </div>
                  </div>
                </motion.button>

                <motion.button
                  onClick={handleLogout}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  title="Sign out"
                  className="p-2 rounded-xl bg-[#0d111b] border border-[#222936] text-[#99a4b7] hover:text-rose-400 hover:border-rose-500/30 transition"
                >
                  <LogOut className="w-4 h-4" />
                </motion.button>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <motion.button
                  onClick={() => onOpenAuth('login')}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="px-3.5 py-1.5 rounded-xl text-xs font-medium text-[#edf0f7] hover:text-white hover:bg-[#0d111b] border border-transparent hover:border-[#222936] transition"
                >
                  Sign In
                </motion.button>
                <motion.button
                  onClick={() => onOpenAuth('register')}
                  whileHover={{ scale: 1.03, y: -1 }}
                  whileTap={{ scale: 0.97 }}
                  className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-gradient-to-r from-[#00b8a3] to-[#00d2b4] hover:from-[#00c9b2] hover:to-[#1de9b6] text-slate-950 shadow-md shadow-[#00b8a3]/20 transition"
                >
                  Create Account
                </motion.button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Tab bar */}
      <div className="flex md:hidden border-t border-[#202735] bg-[#080b12]/95 px-4 py-2 space-x-2">
        <button
          onClick={() => setActiveTab('home')}
          className={`flex-1 flex items-center justify-center space-x-1.5 py-1.5 rounded-lg text-xs font-medium ${
            activeTab === 'home' ? 'bg-[#1b2436] text-white border border-[#2c374d]' : 'text-[#99a4b7]'
          }`}
        >
          <Compass className="w-3.5 h-3.5 text-[#84d9eb]" />
          <span>Home</span>
        </button>
        {isAuthenticated && (
          <button
            onClick={() => setActiveTab('leaderboard')}
            className={`flex-1 flex items-center justify-center space-x-1.5 py-1.5 rounded-lg text-xs font-medium ${
              activeTab === 'leaderboard' ? 'bg-[#1b2436] text-white border border-[#2c374d]' : 'text-[#99a4b7]'
            }`}
          >
            <Trophy className="w-3.5 h-3.5 text-[#ffa116]" />
            <span>Leaderboards</span>
          </button>
        )}
        <button
          onClick={() => {
            if (!isAuthenticated) {
              onOpenAuth('login', 'practice');
            } else {
              setActiveTab('practice');
            }
          }}
          className={`flex-1 flex items-center justify-center space-x-1.5 py-1.5 rounded-lg text-xs font-medium ${
            activeTab === 'practice' ? 'bg-[#1b2436] text-white border border-[#2c374d]' : 'text-[#99a4b7]'
          }`}
        >
          <Code2 className="w-3.5 h-3.5 text-[#00b8a3]" />
          <span>Practice</span>
        </button>
      </div>
    </header>
  );
}
