import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  User, 
  Lock, 
  RefreshCw, 
  CheckCircle, 
  LogOut, 
  ExternalLink, 
  Hash, 
  School, 
  KeyRound, 
  AlertCircle,
  Sparkles,
  ShieldCheck,
  Calendar,
  Phone,
  Cake,
  Mail,
  Save,
  Check
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { LeetCodeIcon, CodeforcesIcon, CodeChefIcon } from './PlatformIcons';
import { AKTU_CSE_BRANCHES } from '../data/branches';

/**
 * Calculate age dynamically from a YYYY-MM-DD DOB string
 */
function calculateAge(dobString) {
  if (!dobString) return null;
  const birth = new Date(dobString);
  if (isNaN(birth.getTime())) return null;
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const m = today.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  return age >= 0 ? age : null;
}

export function ProfileModal({ isOpen, onClose, onLogout }) {
  const { user, updateHandles, updateProfile, changePassword, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('personal'); // 'personal', 'handles', 'security'

  // Personal details state
  const [fullName, setFullName] = useState('');
  const [dob, setDob] = useState('');
  const [age, setAge] = useState(21);
  const [gender, setGender] = useState('Male');
  const [phone, setPhone] = useState('');
  const [branch, setBranch] = useState('CSE');

  // Platform handles state
  const [lcHandle, setLcHandle] = useState('');
  const [cfHandle, setCfHandle] = useState('');
  const [ccHandle, setCcHandle] = useState('');

  // Password state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Status & loading indicators
  const [savingPersonal, setSavingPersonal] = useState(false);
  const [savingHandles, setSavingHandles] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);
  const [statusMsg, setStatusMsg] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);

  // Synchronize state with current user whenever modal opens or user updates
  useEffect(() => {
    if (user) {
      setFullName(user.fullName || '');
      const userDob = user.dob || '2003-05-14';
      setDob(userDob);
      const computed = user.age || calculateAge(userDob) || 21;
      setAge(computed);
      setGender(user.gender || 'Male');
      setPhone(user.phone || '+91 98765 43210');
      setBranch(user.branch || 'CSE');

      setLcHandle(user.handles?.leetcode || '');
      setCfHandle(user.handles?.codeforces || '');
      setCcHandle(user.handles?.codechef || '');
    }
  }, [user, isOpen]);

  if (!isOpen || !user) return null;

  // Handle DOB change and auto-compute age
  const handleDobChange = (newDob) => {
    setDob(newDob);
    const computed = calculateAge(newDob);
    if (computed !== null) {
      setAge(computed);
    }
  };

  // Save Personal Details (Name, DOB, Age, Gender, Phone, Branch)
  const handleSavePersonal = async (e) => {
    e.preventDefault();
    setSavingPersonal(true);
    setStatusMsg(null);
    setErrorMsg(null);
    try {
      if (!fullName.trim()) {
        throw new Error('Full Name cannot be empty.');
      }
      await updateProfile({
        fullName: fullName.trim(),
        dob,
        age,
        gender,
        phone: phone.trim(),
        branch
      });
      setStatusMsg('Personal details (Name, Age, DOB) saved successfully!');
      setTimeout(() => setStatusMsg(null), 4000);
    } catch (err) {
      setErrorMsg(err.message || 'Failed to update personal details.');
    } finally {
      setSavingPersonal(false);
    }
  };

  // Save Platform Handles & Trigger External Stats Sync
  const handleSaveHandles = async (e) => {
    e.preventDefault();
    setSavingHandles(true);
    setStatusMsg(null);
    setErrorMsg(null);
    try {
      await updateHandles({
        leetcode: lcHandle.trim(),
        codeforces: cfHandle.trim(),
        codechef: ccHandle.trim(),
      });
      setStatusMsg('Coding handles updated & external stats synced successfully!');
      setTimeout(() => setStatusMsg(null), 4000);
    } catch (err) {
      setErrorMsg(err.message || 'Failed to update platform handles.');
    } finally {
      setSavingHandles(false);
    }
  };

  // Change Password
  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (newPassword.length < 6) {
      setErrorMsg('New password must be at least 6 characters.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setErrorMsg('New passwords do not match.');
      return;
    }

    setSavingPassword(true);
    setStatusMsg(null);
    setErrorMsg(null);
    try {
      await changePassword(currentPassword, newPassword);
      setStatusMsg('Password updated successfully with secure bcrypt hashing.');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setTimeout(() => setStatusMsg(null), 4000);
    } catch (err) {
      setErrorMsg(err.message || 'Failed to change password.');
    } finally {
      setSavingPassword(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#080b12]/85 backdrop-blur-md"
    >
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        transition={{ type: 'spring', stiffness: 350, damping: 28 }}
        className="glass-card w-full max-w-xl rounded-2xl border border-[#202735] bg-[#0d111b]/95 shadow-2xl overflow-hidden flex flex-col max-h-[92vh]"
      >
        {/* Header */}
        <div className="px-6 py-5 border-b border-[#202735] flex items-center justify-between bg-[#080b12]/70">
          <div className="flex items-center space-x-3.5">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-[#8b9eff] to-[#84d9eb] flex items-center justify-center text-[#080b12] font-black text-base shadow-lg shadow-[#8b9eff]/20 font-display">
              {fullName?.charAt(0) || user.fullName?.charAt(0) || 'U'}
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-lg font-bold text-white font-display leading-tight">{fullName || user.fullName}</h2>
                <span className="text-[11px] px-2 py-0.5 rounded-full bg-[#161d2d] text-[#84d9eb] font-mono border border-[#222936]">
                  {age} yrs
                </span>
              </div>
              <div className="flex items-center space-x-2 text-xs text-[#99a4b7] font-mono mt-0.5">
                <span className="text-[#84d9eb]">{user.rollNumber}</span>
                <span>&middot;</span>
                <span>{branch}</span>
                <span>&middot;</span>
                <span>Year {user.academicYear}</span>
              </div>
            </div>
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

        {/* Modal Navigation Tabs (Personal Details, Handles, Security) */}
        <div className="px-6 pt-3 pb-2 border-b border-[#202735] bg-[#0d111b]/80">
          <div className="grid grid-cols-3 gap-1 p-1 rounded-xl bg-[#080b12] border border-[#202735] text-xs">
            <button
              onClick={() => { setActiveTab('personal'); setErrorMsg(null); }}
              className={`py-2 px-3 rounded-lg font-semibold tracking-wide transition flex items-center justify-center space-x-1.5 ${
                activeTab === 'personal'
                  ? 'bg-[#1b2436] text-white shadow-sm'
                  : 'text-[#99a4b7] hover:text-white'
              }`}
            >
              <User className="w-3.5 h-3.5 text-[#84d9eb]" />
              <span>Personal Details</span>
            </button>

            <button
              onClick={() => { setActiveTab('handles'); setErrorMsg(null); }}
              className={`py-2 px-3 rounded-lg font-semibold tracking-wide transition flex items-center justify-center space-x-1.5 ${
                activeTab === 'handles'
                  ? 'bg-[#1b2436] text-white shadow-sm'
                  : 'text-[#99a4b7] hover:text-white'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Platform Handles</span>
            </button>

            <button
              onClick={() => { setActiveTab('security'); setErrorMsg(null); }}
              className={`py-2 px-3 rounded-lg font-semibold tracking-wide transition flex items-center justify-center space-x-1.5 ${
                activeTab === 'security'
                  ? 'bg-[#1b2436] text-white shadow-sm'
                  : 'text-[#99a4b7] hover:text-white'
              }`}
            >
              <Lock className="w-3.5 h-3.5 text-[#8b9eff]" />
              <span>Security</span>
            </button>
          </div>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-6 space-y-5 overflow-y-auto flex-1">
          {/* Status Banners */}
          {statusMsg && (
            <motion.div 
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs flex items-center space-x-2"
            >
              <CheckCircle className="w-4 h-4 flex-shrink-0" />
              <span>{statusMsg}</span>
            </motion.div>
          )}

          {errorMsg && (
            <motion.div 
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-center space-x-2"
            >
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{errorMsg}</span>
            </motion.div>
          )}

          {/* TAB 1: Personal Details (Name, Age, DOB, Gender, Phone, College Info) */}
          {activeTab === 'personal' && (
            <motion.form 
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
              onSubmit={handleSavePersonal} 
              className="space-y-4"
            >
              {/* Full Name */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center space-x-1.5">
                  <User className="w-3.5 h-3.5 text-[#84d9eb]" />
                  <span>Full Name</span>
                </label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. Aarav Sharma"
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950/80 border border-slate-800 text-xs text-slate-100 placeholder-slate-600 focus:outline-none focus:border-[#84d9eb] font-sans transition"
                />
              </div>

              {/* DOB & Age Row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {/* Date of Birth (DOB) */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center space-x-1.5">
                    <Calendar className="w-3.5 h-3.5 text-[#ffa116]" />
                    <span>Date of Birth (DOB)</span>
                  </label>
                  <input
                    type="date"
                    value={dob}
                    onChange={(e) => handleDobChange(e.target.value)}
                    required
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950/80 border border-slate-800 text-xs text-slate-100 focus:outline-none focus:border-[#ffa116] font-mono transition"
                  />
                </div>

                {/* Age (Auto-calculated badge) */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center space-x-1.5">
                    <Cake className="w-3.5 h-3.5 text-pink-400" />
                    <span>Age</span>
                  </label>
                  <div className="px-3.5 py-2.5 rounded-xl bg-slate-950/80 border border-slate-800 flex items-center justify-between font-mono text-xs">
                    <span className="font-bold text-[#84d9eb] text-sm">
                      {age !== null ? `${age} years old` : '—'}
                    </span>
                    <span className="text-[10px] text-slate-500 font-sans">
                      Calculated from DOB
                    </span>
                  </div>
                </div>
              </div>

              {/* AKTU Engineering Branch */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center space-x-1.5">
                  <School className="w-3.5 h-3.5 text-[#84d9eb]" />
                  <span>AKTU Engineering Branch</span>
                </label>
                <select
                  value={branch}
                  onChange={(e) => setBranch(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950/80 border border-slate-800 text-xs text-slate-100 focus:outline-none focus:border-[#84d9eb] font-sans transition cursor-pointer"
                >
                  {AKTU_CSE_BRANCHES.map((b) => (
                    <option key={b.code} value={b.code}>
                      {b.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Gender & Phone Row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {/* Gender */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Gender
                  </label>
                  <select
                    value={gender}
                    onChange={(e) => setGender(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950/80 border border-slate-800 text-xs text-slate-100 focus:outline-none focus:border-[#8b9eff] font-sans transition"
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                    <option value="Prefer not to say">Prefer not to say</option>
                  </select>
                </div>

                {/* Phone */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center space-x-1.5">
                    <Phone className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Phone Number</span>
                  </label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+91 98765 43210"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950/80 border border-slate-800 text-xs text-slate-100 placeholder-slate-600 focus:outline-none focus:border-emerald-400 font-mono transition"
                  />
                </div>
              </div>

              {/* Academic & University Profile Badges (Read-Only Verified) */}
              <div className="p-3.5 rounded-xl bg-[#080b12]/80 border border-[#202735] space-y-2">
                <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider font-mono">
                  Verified Academic Credentials
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs font-mono">
                  <div className="p-2 rounded-lg bg-[#161d2d]/80 border border-[#222936]">
                    <div className="text-[10px] text-slate-500">Roll Number</div>
                    <div className="font-bold text-white text-xs truncate">{user.rollNumber}</div>
                  </div>
                  <div className="p-2 rounded-lg bg-[#161d2d]/80 border border-[#222936]">
                    <div className="text-[10px] text-slate-500">Department</div>
                    <div className="font-bold text-[#84d9eb] text-xs">{branch}</div>
                  </div>
                  <div className="p-2 rounded-lg bg-[#161d2d]/80 border border-[#222936] col-span-2 sm:col-span-1">
                    <div className="text-[10px] text-slate-500">Academic Year</div>
                    <div className="font-bold text-amber-400 text-xs">Year {user.academicYear}</div>
                  </div>
                </div>
              </div>

              {/* Save Button */}
              <div className="pt-2 flex justify-end">
                <button
                  type="submit"
                  disabled={savingPersonal}
                  className="flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#00b8a3] to-[#00d2b4] hover:from-[#00c9b2] hover:to-[#1de9b6] text-slate-950 text-xs font-bold shadow-md shadow-[#00b8a3]/20 transition disabled:opacity-50"
                >
                  {savingPersonal ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Saving Details...</span>
                    </>
                  ) : (
                    <>
                      <Save className="w-3.5 h-3.5" />
                      <span>Save Personal Details</span>
                    </>
                  )}
                </button>
              </div>
            </motion.form>
          )}

          {/* TAB 2: Coding Platform Handles */}
          {activeTab === 'handles' && (
            <motion.form 
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
              onSubmit={handleSaveHandles} 
              className="space-y-4"
            >
              <div className="text-xs text-slate-400">
                Connect your competitive programming profile handles to enable real-time rating and solved counts synchronization.
              </div>

              {/* LeetCode */}
              <div>
                <label className="flex items-center space-x-1.5 text-xs font-semibold text-amber-400 mb-1.5">
                  <LeetCodeIcon className="w-4 h-4 flex-shrink-0" />
                  <span>LeetCode Handle</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={lcHandle}
                    onChange={(e) => setLcHandle(e.target.value)}
                    placeholder="e.g. tourist"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950/80 border border-slate-800 text-xs text-slate-100 placeholder-slate-600 focus:outline-none focus:border-amber-500 font-mono transition"
                  />
                  {lcHandle && (
                    <a
                      href={`https://leetcode.com/u/${lcHandle}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-amber-400 transition"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  )}
                </div>
              </div>

              {/* Codeforces */}
              <div>
                <label className="flex items-center space-x-1.5 text-xs font-semibold text-blue-400 mb-1.5">
                  <CodeforcesIcon className="w-4 h-4 flex-shrink-0" />
                  <span>Codeforces Handle</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={cfHandle}
                    onChange={(e) => setCfHandle(e.target.value)}
                    placeholder="e.g. tourist"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950/80 border border-slate-800 text-xs text-slate-100 placeholder-slate-600 focus:outline-none focus:border-blue-500 font-mono transition"
                  />
                  {cfHandle && (
                    <a
                      href={`https://codeforces.com/profile/${cfHandle}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-blue-400 transition"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  )}
                </div>
              </div>

              {/* CodeChef */}
              <div>
                <label className="flex items-center space-x-1.5 text-xs font-semibold text-emerald-400 mb-1.5">
                  <CodeChefIcon className="w-4 h-4 flex-shrink-0" />
                  <span>CodeChef Handle</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={ccHandle}
                    onChange={(e) => setCcHandle(e.target.value)}
                    placeholder="e.g. chef_user"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950/80 border border-slate-800 text-xs text-slate-100 placeholder-slate-600 focus:outline-none focus:border-emerald-500 font-mono transition"
                  />
                  {ccHandle && (
                    <a
                      href={`https://www.codechef.com/users/${ccHandle}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-emerald-400 transition"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  )}
                </div>
              </div>

              {/* Save & Sync Button */}
              <div className="pt-2 flex justify-end">
                <button
                  type="submit"
                  disabled={savingHandles}
                  className="flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#566ae6] to-[#8b9eff] hover:from-[#667af0] hover:to-[#9cb0ff] text-white text-xs font-bold shadow-md shadow-[#566ae6]/25 transition disabled:opacity-50"
                >
                  {savingHandles ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Syncing External Stats...</span>
                    </>
                  ) : (
                    <>
                      <RefreshCw className="w-3.5 h-3.5" />
                      <span>Save & Sync External Stats</span>
                    </>
                  )}
                </button>
              </div>
            </motion.form>
          )}

          {/* TAB 3: Security & Change Password */}
          {activeTab === 'security' && (
            <motion.form 
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
              onSubmit={handleChangePassword} 
              className="space-y-4"
            >
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center space-x-1.5">
                  <Lock className="w-3.5 h-3.5 text-slate-400" />
                  <span>Current Password</span>
                </label>
                <input
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950/80 border border-slate-800 text-xs text-slate-100 placeholder-slate-600 focus:outline-none focus:border-indigo-500 font-mono transition"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    New Password
                  </label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Min 6 chars"
                    required
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950/80 border border-slate-800 text-xs text-slate-100 placeholder-slate-600 focus:outline-none focus:border-indigo-500 font-mono transition"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Confirm New Password
                  </label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Re-enter password"
                    required
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950/80 border border-slate-800 text-xs text-slate-100 placeholder-slate-600 focus:outline-none focus:border-indigo-500 font-mono transition"
                  />
                </div>
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="submit"
                  disabled={savingPassword}
                  className="flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white text-xs font-bold shadow-md shadow-indigo-500/25 transition disabled:opacity-50"
                >
                  <KeyRound className="w-3.5 h-3.5" />
                  <span>{savingPassword ? 'Updating...' : 'Update Password'}</span>
                </button>
              </div>
            </motion.form>
          )}

          {/* Footer Action: Sign Out */}
          <div className="pt-4 border-t border-[#202735] flex items-center justify-between">
            <span className="text-[11px] text-slate-500 font-mono">
              Session secured with JWT (7d valid)
            </span>
            <button
              onClick={() => {
                logout();
                onClose();
                onLogout?.();
              }}
              className="flex items-center space-x-1.5 px-3.5 py-1.5 rounded-xl bg-rose-500/10 border border-rose-500/30 hover:bg-rose-500/20 text-rose-400 text-xs font-semibold transition"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
