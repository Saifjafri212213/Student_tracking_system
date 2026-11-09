import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Navbar } from './components/Navbar';
import { LandingView } from './components/LandingView';
import { LeaderboardView } from './components/LeaderboardView';
import { PracticeView } from './components/PracticeView';
import { AuthModal } from './components/AuthModal';
import { ProfileModal } from './components/ProfileModal';
import { useAuth } from './context/AuthContext';

export default function App() {
  const { user, isAuthenticated } = useAuth();
  const [activeTab, setActiveTab] = useState(() => {
    return localStorage.getItem('coderank_token') ? 'leaderboard' : 'home';
  });
  
  // Modals state
  const [authModal, setAuthModal] = useState({ isOpen: false, mode: 'login', intendedTab: null });
  const [profileModalOpen, setProfileModalOpen] = useState(false);

  // When user is not authenticated, strictly lock activeTab to 'home'
  useEffect(() => {
    if (!isAuthenticated && activeTab !== 'home') {
      setActiveTab('home');
    }
  }, [isAuthenticated, activeTab]);

  const handleOpenAuth = (mode = 'login', intendedTab = null) => {
    setAuthModal({ isOpen: true, mode, intendedTab });
  };

  const handleAuthSuccess = () => {
    if (authModal.intendedTab) {
      setActiveTab(authModal.intendedTab);
    } else {
      setActiveTab('leaderboard');
    }
  };

  const handleExploreLeaderboard = () => {
    if (!isAuthenticated) {
      handleOpenAuth('login', 'leaderboard');
    } else {
      setActiveTab('leaderboard');
    }
  };

  const handleExplorePractice = () => {
    if (!isAuthenticated) {
      handleOpenAuth('login', 'practice');
    } else {
      setActiveTab('practice');
    }
  };

  return (
    <div className="min-h-screen bg-[#080b12] text-[#edf0f7] flex flex-col font-sans relative overflow-x-hidden selection:bg-[#566ae6] selection:text-white">
      {/* Ambient Motion Mesh Lighting - Inspired by parthsarthi.tech */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        {/* Subtle grid pattern */}
        <div className="absolute inset-0 bg-grid-pattern opacity-40" />

        {/* Ambient Top Glow Orbs */}
        <motion.div
          animate={{
            x: [0, 30, 0],
            y: [0, -20, 0],
            scale: [1, 1.1, 1],
          }}
          transition={{
            duration: 12,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="absolute -top-40 -left-40 w-96 h-96 rounded-full bg-[#8b9eff]/15 blur-[120px]"
        />
        <motion.div
          animate={{
            x: [0, -30, 0],
            y: [0, 25, 0],
            scale: [1, 1.15, 1],
          }}
          transition={{
            duration: 15,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="absolute -top-40 -right-40 w-96 h-96 rounded-full bg-[#84d9eb]/15 blur-[120px]"
        />
        <motion.div
          animate={{
            x: [0, 20, 0],
            y: [0, 30, 0],
          }}
          transition={{
            duration: 18,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="absolute top-1/2 left-1/3 w-80 h-80 rounded-full bg-[#ffa116]/8 blur-[140px]"
        />
      </div>

      {/* Navigation Bar */}
      <div className="relative z-30">
        <Navbar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          onOpenAuth={handleOpenAuth}
          onOpenProfile={() => setProfileModalOpen(true)}
        />
      </div>

      {/* Main Content Area with Page Motion Transitions */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10">
        <AnimatePresence mode="wait">
          {activeTab === 'home' ? (
            <motion.div
              key="home"
              initial={{ opacity: 0, y: 14, filter: 'blur(4px)' }}
              animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
              exit={{ opacity: 0, y: -14, filter: 'blur(4px)' }}
              transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            >
              <LandingView
                user={user}
                isAuthenticated={isAuthenticated}
                onOpenAuth={handleOpenAuth}
                onExploreLeaderboard={handleExploreLeaderboard}
                onExplorePractice={handleExplorePractice}
              />
            </motion.div>
          ) : activeTab === 'leaderboard' ? (
            <motion.div
              key="leaderboard"
              initial={{ opacity: 0, y: 12, filter: 'blur(4px)' }}
              animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
              exit={{ opacity: 0, y: -12, filter: 'blur(4px)' }}
              transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            >
              <LeaderboardView />
            </motion.div>
          ) : (
            <motion.div
              key="practice"
              initial={{ opacity: 0, y: 12, filter: 'blur(4px)' }}
              animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
              exit={{ opacity: 0, y: -12, filter: 'blur(4px)' }}
              transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            >
              <PracticeView />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Footer */}
      <footer className="border-t border-[#222936] bg-[#080b12]/90 backdrop-blur-md py-8 text-xs text-[#99a4b7] relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-2">
            <span className="font-bold text-white font-display text-sm tracking-tight">CodeRank</span>
            <span className="text-[#99a4b7]">&middot;</span>
            <span className="text-[#99a4b7]">Campus Competitive Programming System</span>
          </div>
        </div>
      </footer>

      {/* Modals */}
      <AuthModal
        isOpen={authModal.isOpen}
        initialMode={authModal.mode}
        onClose={() => setAuthModal({ isOpen: false, mode: 'login' })}
        onSuccess={handleAuthSuccess}
      />

      <ProfileModal
        isOpen={profileModalOpen}
        onClose={() => setProfileModalOpen(false)}
        onLogout={() => setActiveTab('home')}
      />
    </div>
  );
}
