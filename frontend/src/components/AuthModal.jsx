import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Lock, Mail, User, Hash, School, KeyRound, AlertCircle, CheckCircle2, Sparkles, ArrowRight, Calendar } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { AKTU_CSE_BRANCHES } from '../data/branches';

function calculateAge(dobString) {
  if (!dobString) return null;
  const birth = new Date(dobString);
  if (isNaN(birth.getTime())) return null;
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const m = today.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
  return age >= 0 ? age : null;
}

export function AuthModal({ isOpen, onClose, initialMode = 'login', onSuccess }) {
  const { login, register } = useAuth();
  const [mode, setMode] = useState(initialMode); // 'login' or 'register'

  useEffect(() => {
    if (isOpen) {
      setMode(initialMode);
      setError(null);
    }
  }, [isOpen, initialMode]);
  
  // Login fields
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Register fields
  const [fullName, setFullName] = useState('');
  const [rollNumber, setRollNumber] = useState('');
  const [registerEmail, setRegisterEmail] = useState('');
  const [registerDob, setRegisterDob] = useState('2003-05-14');
  const [branch, setBranch] = useState('CSE');
  const [registerPassword, setRegisterPassword] = useState('');
  const [lcHandle, setLcHandle] = useState('');
  const [cfHandle, setCfHandle] = useState('');
  const [ccHandle, setCcHandle] = useState('');

  // Status state
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);

  if (!isOpen) return null;

  // Derive academic year & admission year from 13-digit roll number
  const getRollYearDetails = () => {
    if (!rollNumber || rollNumber.length < 2) return null;
    const prefix = parseInt(rollNumber.substring(0, 2), 10);
    if (isNaN(prefix)) return null;
    const admissionYear = 2000 + prefix;
    const currentYear = 2026;
    const yearDiff = currentYear - admissionYear;
    let academicYear = 1;
    if (yearDiff === 1) academicYear = 2;
    else if (yearDiff === 2) academicYear = 3;
    else if (yearDiff >= 3) academicYear = 4;
    return { admissionYear, academicYear };
  };

  const rollDetails = getRollYearDetails();

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await login(loginEmail.trim(), loginPassword);
      setSuccessMsg('Authenticated successfully!');
      setTimeout(() => {
        onClose();
        onSuccess?.();
        setSuccessMsg(null);
      }, 700);
    } catch (err) {
      setError(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    if (rollNumber.length !== 13) {
      setError('College Roll Number must be exactly 13 digits (e.g. 2200000000099).');
      return;
    }
    if (registerPassword.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      await register({
        fullName: fullName.trim(),
        rollNumber: rollNumber.trim(),
        email: registerEmail.trim(),
        branch,
        password: registerPassword,
        handles: {
          leetcode: lcHandle.trim(),
          codeforces: cfHandle.trim(),
          codechef: ccHandle.trim(),
        }
      });
      setSuccessMsg('Student profile created! Signed in.');
      setTimeout(() => {
        onClose();
        onSuccess?.();
        setSuccessMsg(null);
      }, 700);
    } catch (err) {
      setError(err.message || 'Registration failed. Please review your details.');
    } finally {
      setLoading(false);
    }
  };

  // Demo user fast fill
  const fillDemo = (email, pass) => {
    setLoginEmail(email);
    setLoginPassword(pass);
    setError(null);
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#080b12]/80 backdrop-blur-md"
    >
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        transition={{ type: 'spring', stiffness: 350, damping: 28 }}
        className="glass-card w-full max-w-lg rounded-2xl border border-[#202735] bg-[#0d111b]/95 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
      >
        {/* Header Tabs */}
        <div className="px-6 py-4 border-b border-[#202735] flex items-center justify-between bg-[#080b12]/60">
          <div className="flex items-center p-1 rounded-xl bg-[#080b12] border border-[#202735] text-xs relative">
            <button
              onClick={() => { setMode('login'); setError(null); }}
              className={`relative z-10 px-4 py-1.5 rounded-lg font-semibold tracking-wide transition-colors duration-200 ${
                mode === 'login' ? 'text-white' : 'text-[#99a4b7] hover:text-white'
              }`}
            >
              Sign In
              {mode === 'login' && (
                <motion.div
                  layoutId="authTabSlider"
                  className="absolute inset-0 bg-[#1e273a] rounded-lg border border-[#32405d] shadow-sm -z-10"
                  transition={{ type: 'spring', stiffness: 450, damping: 30 }}
                />
              )}
            </button>
            <button
              onClick={() => { setMode('register'); setError(null); }}
              className={`relative z-10 px-4 py-1.5 rounded-lg font-semibold tracking-wide transition-colors duration-200 ${
                mode === 'register' ? 'text-white' : 'text-[#99a4b7] hover:text-white'
              }`}
            >
              Create Account
              {mode === 'register' && (
                <motion.div
                  layoutId="authTabSlider"
                  className="absolute inset-0 bg-[#1e273a] rounded-lg border border-[#32405d] shadow-sm -z-10"
                  transition={{ type: 'spring', stiffness: 450, damping: 30 }}
                />
              )}
            </button>
          </div>

          <motion.button
            onClick={onClose}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className="p-1.5 rounded-lg text-[#99a4b7] hover:text-white hover:bg-[#161d2d] transition"
          >
            <X className="w-5 h-5" />
          </motion.button>
        </div>

        {/* Content Area */}
        <div className="p-6 overflow-y-auto flex-1">
          {error && (
            <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-center space-x-2 animate-fadeIn">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {successMsg && (
            <div className="mb-4 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs flex items-center space-x-2 animate-fadeIn">
              <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {mode === 'login' ? (
            /* Sign In Form */
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  College Email
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input
                    type="email"
                    required
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    placeholder="student@college.edu"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950/80 border border-slate-800 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-amber-500 transition"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input
                    type="password"
                    required
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950/80 border border-slate-800 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-amber-500 transition"
                  />
                </div>
              </div>

              {/* Demo Accounts Quick-Fill Helper */}
              <div className="pt-2">
                <span className="text-[11px] text-slate-400 block mb-1.5 font-medium">
                  Instant Test Accounts (bcrypt verified):
                </span>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => fillDemo('aarav@college.edu', 'Password@123')}
                    className="px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 hover:border-amber-500/40 text-[11px] text-slate-300 transition"
                  >
                    👤 Aarav (Grandmaster)
                  </button>
                  <button
                    type="button"
                    onClick={() => fillDemo('saif@college.edu', 'SecretPassword123')}
                    className="px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 hover:border-amber-500/40 text-[11px] text-slate-300 transition"
                  >
                    👤 Saif Jafri
                  </button>
                </div>
              </div>

              <div className="pt-3">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex items-center justify-center space-x-2 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-sm shadow-lg shadow-amber-500/20 transition transform active:scale-95 disabled:opacity-50"
                >
                  <KeyRound className="w-4 h-4" />
                  <span>{loading ? 'Authenticating...' : 'Sign In to CodeRank'}</span>
                </button>
              </div>
            </form>
          ) : (
            /* Register Form */
            <form onSubmit={handleRegisterSubmit} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Full Name *
                </label>
                <div className="relative">
                  <User className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="e.g. Priyanshu Sharma"
                    className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-950/80 border border-slate-800 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-amber-500 transition"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    13-Digit Roll Number *
                  </label>
                  <div className="relative">
                    <Hash className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                    <input
                      type="text"
                      required
                      maxLength={13}
                      value={rollNumber}
                      onChange={(e) => setRollNumber(e.target.value.replace(/\D/g, ''))}
                      placeholder="2200000000099"
                      className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-950/80 border border-slate-800 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-amber-500 font-mono transition"
                    />
                  </div>
                  {rollDetails && (
                    <span className="text-[10px] text-amber-400 mt-0.5 block font-mono">
                      Batch {rollDetails.admissionYear} &middot; Year {rollDetails.academicYear}
                    </span>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    AKTU Engineering Branch *
                  </label>
                  <select
                    value={branch}
                    onChange={(e) => setBranch(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950/80 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-amber-500 transition cursor-pointer max-w-full truncate"
                  >
                    {AKTU_CSE_BRANCHES.map((b) => (
                      <option key={b.code} value={b.code}>
                        {b.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  College Email *
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input
                    type="email"
                    required
                    value={registerEmail}
                    onChange={(e) => setRegisterEmail(e.target.value)}
                    placeholder="student@college.edu"
                    className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-950/80 border border-slate-800 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-amber-500 transition"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Create Password * (min 6 characters)
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input
                    type="password"
                    required
                    minLength={6}
                    value={registerPassword}
                    onChange={(e) => setRegisterPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-950/80 border border-slate-800 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-amber-500 transition"
                  />
                </div>
              </div>

              {/* Competitive Programming Handles Section */}
              <div className="pt-2 border-t border-slate-800/80">
                <span className="text-[11px] font-bold text-slate-300 block mb-2 uppercase tracking-wider">
                  Platform Handles (Optional - Syncs to Leaderboards)
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <div>
                    <label className="block text-[10px] text-amber-400 font-semibold mb-0.5">LeetCode</label>
                    <input
                      type="text"
                      value={lcHandle}
                      onChange={(e) => setLcHandle(e.target.value)}
                      placeholder="handle"
                      className="w-full px-2.5 py-1.5 rounded-lg bg-slate-950/90 border border-slate-800 text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:border-amber-500 font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-blue-400 font-semibold mb-0.5">Codeforces</label>
                    <input
                      type="text"
                      value={cfHandle}
                      onChange={(e) => setCfHandle(e.target.value)}
                      placeholder="handle"
                      className="w-full px-2.5 py-1.5 rounded-lg bg-slate-950/90 border border-slate-800 text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:border-blue-500 font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-emerald-400 font-semibold mb-0.5">CodeChef</label>
                    <input
                      type="text"
                      value={ccHandle}
                      onChange={(e) => setCcHandle(e.target.value)}
                      placeholder="handle"
                      className="w-full px-2.5 py-1.5 rounded-lg bg-slate-950/90 border border-slate-800 text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:border-emerald-500 font-mono"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-3">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex items-center justify-center space-x-2 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-sm shadow-lg shadow-amber-500/20 transition transform active:scale-95 disabled:opacity-50"
                >
                  <ArrowRight className="w-4 h-4" />
                  <span>{loading ? 'Creating Student Profile...' : 'Complete Registration'}</span>
                </button>
              </div>
            </form>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}
