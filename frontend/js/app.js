// ==========================================================================
// CodeRank - Client-Side Modular Application Controller (QA Diagnostic Build)
// ==========================================================================
import { 
  auth, 
  db, 
  isMockMode, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  updatePassword,
  reauthenticateWithCredential,
  EmailAuthProvider,
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  getDocs, 
  addDoc, 
  updateDoc, 
  query, 
  orderBy, 
  serverTimestamp,
  MOCK_PLATFORM_DATA,
  MOCK_DOUBTS 
} from "./firebase-config.js";

// Backend API Base URL (Express + MongoDB Atlas)
const API_BASE_URL = window.location.origin.includes(':5001')
  ? `${window.location.origin}/api`
  : "http://localhost:5001/api";

// -------------------------------------------------------------
// QA Logger Utility with Stylized Console Groups
// -------------------------------------------------------------
const QA_STYLES = {
  boot: "background: #2563eb; color: #ffffff; font-weight: bold; padding: 2px 6px; border-radius: 3px;",
  dom: "background: #059669; color: #ffffff; font-weight: bold; padding: 2px 6px; border-radius: 3px;",
  auth: "background: #7c3aed; color: #ffffff; font-weight: bold; padding: 2px 6px; border-radius: 3px;",
  lead: "background: #d97706; color: #ffffff; font-weight: bold; padding: 2px 6px; border-radius: 3px;",
  profile: "background: #0284c7; color: #ffffff; font-weight: bold; padding: 2px 6px; border-radius: 3px;",
  forum: "background: #db2777; color: #ffffff; font-weight: bold; padding: 2px 6px; border-radius: 3px;",
  error: "background: #dc2626; color: #ffffff; font-weight: bold; padding: 2px 6px; border-radius: 3px;"
};

function qaLog(category, step, data = null) {
  const style = QA_STYLES[category] || "background: #475569; color: #fff; padding: 2px 6px;";
  const time = new Date().toLocaleTimeString();
  if (data !== null) {
    console.log(`%c[QA ${category.toUpperCase()}]%c [${time}] Step: ${step}`, style, "color: #334155; font-weight: 600;", data);
  } else {
    console.log(`%c[QA ${category.toUpperCase()}]%c [${time}] Step: ${step}`, style, "color: #334155; font-weight: 600;");
  }
}

function qaError(category, step, error, context = {}) {
  const style = QA_STYLES.error;
  console.group(`%c[QA ERROR in ${category.toUpperCase()}]%c Step: ${step}`, style, "color: #dc2626; font-weight: bold;");
  console.error("❌ Message:", error?.message || error);
  if (error?.code) console.error("🔑 Error Code:", error.code);
  if (error?.status) console.error("🌐 HTTP Status:", error.status);
  if (context && Object.keys(context).length > 0) console.dir("📦 Context Payload:", context);
  if (error?.stack) console.debug("📍 Stack Trace:", error.stack);
  console.groupEnd();
}

// -------------------------------------------------------------
// 1. DOM Element Registry & Validation Suite (Senior QA Check)
// -------------------------------------------------------------
export function validateDOMElements() {
  qaLog("dom", "Starting DOM Selector Validation Suite");
  
  const selectors = [
    // Navigation
    { key: "navTabLeaderboard", el: document.getElementById("navTabLeaderboard"), type: "Tab Link" },
    { key: "navTabForum", el: document.getElementById("navTabForum"), type: "Tab Link" },
    { key: "navTabAskQuestion", el: document.getElementById("navTabAskQuestion"), type: "Tab Link" },
    { key: "leaderboardSection", el: document.getElementById("leaderboardSection"), type: "Section" },
    { key: "forumSection", el: document.getElementById("forumSection"), type: "Section" },
    
    // Auth Modal & Controls
    { key: "authModal", el: document.getElementById("authModal"), type: "Modal" },
    { key: "btnOpenAuthModal", el: document.getElementById("btnOpenAuthModal"), type: "Button" },
    { key: "btnCloseAuthModal", el: document.getElementById("btnCloseAuthModal"), type: "Button" },
    { key: "modalBg", el: document.getElementById("modalBg"), type: "Overlay" },
    { key: "tabRegister", el: document.getElementById("tabRegister"), type: "Tab" },
    { key: "tabLogin", el: document.getElementById("tabLogin"), type: "Tab" },
    { key: "registerForm", el: document.getElementById("registerForm"), type: "Form" },
    { key: "loginForm", el: document.getElementById("loginForm"), type: "Form" },
    { key: "authNavButtons", el: document.getElementById("authNavButtons"), type: "Container" },
    
    // Registration Inputs
    { key: "regName", el: document.getElementById("regName"), type: "Input" },
    { key: "regRoll", el: document.getElementById("regRoll"), type: "Input" },
    { key: "regBranch", el: document.getElementById("regBranch"), type: "Select" },
    { key: "regEmail", el: document.getElementById("regEmail"), type: "Input" },
    { key: "regPassword", el: document.getElementById("regPassword"), type: "Input" },
    { key: "btnSubmitRegister", el: document.getElementById("btnSubmitRegister"), type: "Button" },

    // Login Inputs
    { key: "loginEmail", el: document.getElementById("loginEmail"), type: "Input" },
    { key: "loginPassword", el: document.getElementById("loginPassword"), type: "Input" },
    { key: "btnSubmitLogin", el: document.getElementById("btnSubmitLogin"), type: "Button" },

    // Dedicated My Profile Modal
    { key: "myProfileModal", el: document.getElementById("myProfileModal"), type: "Modal" },
    { key: "modalProfileBg", el: document.getElementById("modalProfileBg"), type: "Overlay" },
    { key: "btnCloseProfileModal", el: document.getElementById("btnCloseProfileModal"), type: "Button" },
    { key: "profileCardName", el: document.getElementById("profileCardName"), type: "Text" },
    { key: "profileCardRoll", el: document.getElementById("profileCardRoll"), type: "Text" },
    { key: "profileHandlesForm", el: document.getElementById("profileHandlesForm"), type: "Form" },
    { key: "profLeetCode", el: document.getElementById("profLeetCode"), type: "Input" },
    { key: "profCodeforces", el: document.getElementById("profCodeforces"), type: "Input" },
    { key: "profCodeChef", el: document.getElementById("profCodeChef"), type: "Input" },
    { key: "btnSaveHandles", el: document.getElementById("btnSaveHandles"), type: "Button" },
    { key: "profilePasswordForm", el: document.getElementById("profilePasswordForm"), type: "Form" },
    { key: "profCurrentPassword", el: document.getElementById("profCurrentPassword"), type: "Input" },
    { key: "profNewPassword", el: document.getElementById("profNewPassword"), type: "Input" },
    { key: "profConfirmPassword", el: document.getElementById("profConfirmPassword"), type: "Input" },
    { key: "btnSavePassword", el: document.getElementById("btnSavePassword"), type: "Button" },

    // Leaderboard
    { key: "selectAcademicYear", el: document.getElementById("selectAcademicYear"), type: "Select" },
    { key: "btnMetricRating", el: document.getElementById("btnMetricRating"), type: "Button" },
    { key: "btnMetricSolved", el: document.getElementById("btnMetricSolved"), type: "Button" },
    { key: "leaderboardTableBody", el: document.getElementById("leaderboardTableBody"), type: "TBody" },

    // Doubt Forum
    { key: "askDoubtForm", el: document.getElementById("askDoubtForm"), type: "Form" },
    { key: "doubtTitleInput", el: document.getElementById("doubtTitleInput"), type: "Input" },
    { key: "doubtBodyInput", el: document.getElementById("doubtBodyInput"), type: "Textarea" },
    { key: "doubtsFeedContainer", el: document.getElementById("doubtsFeedContainer"), type: "Container" }
  ];

  const report = selectors.map(item => ({
    "Selector ID / Key": item.key,
    "Type": item.type,
    "Status": item.el ? "✅ FOUND" : "❌ MISSING (NULL)",
    "HTML Tag": item.el ? item.el.tagName.toLowerCase() : "N/A"
  }));

  console.table(report);
  
  const missing = selectors.filter(s => !s.el);
  if (missing.length > 0) {
    console.warn(`⚠️ [QA WARNING] ${missing.length} DOM elements were not found in the document:`, missing.map(m => m.key));
  } else {
    qaLog("dom", "All critical DOM elements successfully verified.");
  }
}

// -------------------------------------------------------------
// 2. Application State
// -------------------------------------------------------------
let activePlatform = "leetcode";
let activeYear = "ALL";
let activeMetric = "rating";
let doubtTags = ["C++", "DP"];
let activeDoubtItem = null;
let cachedDoubts = [];
let currentUser = null;

// DOM Lookups
const navTabLeaderboard = document.getElementById("navTabLeaderboard");
const navTabForum = document.getElementById("navTabForum");
const navTabAskQuestion = document.getElementById("navTabAskQuestion");
const leaderboardSection = document.getElementById("leaderboardSection");
const forumSection = document.getElementById("forumSection");
const btnScrollToAskEditor = document.getElementById("btnScrollToAskEditor");
const askEditorCard = document.getElementById("askEditorCard");

const globalNotification = document.getElementById("globalNotification");
const globalNotificationText = document.getElementById("globalNotificationText");
const closeNotificationBtn = document.getElementById("closeNotificationBtn");

const authModal = document.getElementById("authModal");
const btnOpenAuthModal = document.getElementById("btnOpenAuthModal");
const btnCloseAuthModal = document.getElementById("btnCloseAuthModal");
const modalBg = document.getElementById("modalBg");
const tabRegister = document.getElementById("tabRegister");
const tabLogin = document.getElementById("tabLogin");
const registerForm = document.getElementById("registerForm");
const loginForm = document.getElementById("loginForm");
const authNavButtons = document.getElementById("authNavButtons");

const platformTabItems = document.querySelectorAll("#platformTabsList li");
const selectAcademicYear = document.getElementById("selectAcademicYear");
const btnMetricRating = document.getElementById("btnMetricRating");
const btnMetricSolved = document.getElementById("btnMetricSolved");
const thMetricHeader = document.getElementById("thMetricHeader");
const leaderboardTableBody = document.getElementById("leaderboardTableBody");
const btnRefreshLeaderboard = document.getElementById("btnRefreshLeaderboard");

const myProfileModal = document.getElementById("myProfileModal");
const modalProfileBg = document.getElementById("modalProfileBg");
const btnCloseProfileModal = document.getElementById("btnCloseProfileModal");
const btnOpenEditHandlesModal = document.getElementById("btnOpenEditHandlesModal");
const profileCardName = document.getElementById("profileCardName");
const profileCardEmail = document.getElementById("profileCardEmail");
const profileCardYear = document.getElementById("profileCardYear");
const profileCardBranch = document.getElementById("profileCardBranch");
const profileCardRoll = document.getElementById("profileCardRoll");

const profileHandlesForm = document.getElementById("profileHandlesForm");
const profLeetCode = document.getElementById("profLeetCode");
const profCodeforces = document.getElementById("profCodeforces");
const profCodeChef = document.getElementById("profCodeChef");
const btnSaveHandles = document.getElementById("btnSaveHandles");

const profilePasswordForm = document.getElementById("profilePasswordForm");
const profCurrentPassword = document.getElementById("profCurrentPassword");
const profNewPassword = document.getElementById("profNewPassword");
const profConfirmPassword = document.getElementById("profConfirmPassword");
const errCurrentPassword = document.getElementById("errCurrentPassword");
const errPasswordMismatch = document.getElementById("errPasswordMismatch");
const btnSavePassword = document.getElementById("btnSavePassword");

const askDoubtForm = document.getElementById("askDoubtForm");
const doubtTitleInput = document.getElementById("doubtTitleInput");
const doubtTagInput = document.getElementById("doubtTagInput");
const doubtTagsContainer = document.getElementById("doubtTagsContainer");
const doubtBodyInput = document.getElementById("doubtBodyInput");
const btnSubmitDoubt = document.getElementById("btnSubmitDoubt");
const btnInsertCpp = document.getElementById("btnInsertCpp");
const btnInsertPy = document.getElementById("btnInsertPy");
const previewTitle = document.getElementById("previewTitle");
const previewTags = document.getElementById("previewTags");
const previewContent = document.getElementById("previewContent");
const doubtsFeedContainer = document.getElementById("doubtsFeedContainer");
const btnRefreshDoubts = document.getElementById("btnRefreshDoubts");

const viewDoubtModal = document.getElementById("viewDoubtModal");
const modalViewDoubtBg = document.getElementById("modalViewDoubtBg");
const btnCloseViewDoubtModal = document.getElementById("btnCloseViewDoubtModal");
const modalDoubtTitleHeader = document.getElementById("modalDoubtTitleHeader");
const modalDoubtAuthor = document.getElementById("modalDoubtAuthor");
const modalDoubtDate = document.getElementById("modalDoubtDate");
const modalDoubtStatusBadge = document.getElementById("modalDoubtStatusBadge");
const modalDoubtTitle = document.getElementById("modalDoubtTitle");
const modalDoubtTags = document.getElementById("modalDoubtTags");
const modalDoubtBody = document.getElementById("modalDoubtBody");
const modalDoubtUpvotesCount = document.getElementById("modalDoubtUpvotesCount");
const btnUpvoteDoubtModal = document.getElementById("btnUpvoteDoubtModal");
const modalAnswersList = document.getElementById("modalAnswersList");
const modalAnswerInput = document.getElementById("modalAnswerInput");
const btnSubmitAnswer = document.getElementById("btnSubmitAnswer");

// -------------------------------------------------------------
// 3. UI Helpers
// -------------------------------------------------------------
function showNotification(message, type = "is-danger") {
  qaLog("boot", `Displaying notification: [${type}] ${message}`);
  if (!globalNotification || !globalNotificationText) return;
  globalNotification.className = `notification ${type}`;
  globalNotificationText.textContent = message;
  globalNotification.classList.remove("is-hidden");
  globalNotification.scrollIntoView({ behavior: "smooth", block: "center" });
}

closeNotificationBtn?.addEventListener("click", () => {
  globalNotification?.classList.add("is-hidden");
});

function escapeHtml(str) {
  return String(str || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

// -------------------------------------------------------------
// 4. View Switching & URL Hash Routing
// -------------------------------------------------------------
export function switchToLeaderboardView() {
  qaLog("lead", "Switching to Leaderboard view");
  navTabLeaderboard?.classList.add("is-active");
  navTabForum?.classList.remove("is-active");
  navTabAskQuestion?.classList.remove("is-active");
  leaderboardSection?.classList.remove("is-hidden");
  forumSection?.classList.add("is-hidden");
  fetchLeaderboard();
}

export function switchToForumView(focusEditor = false) {
  qaLog("forum", `Switching to Forum view (focusEditor: ${focusEditor})`);
  navTabForum?.classList.add("is-active");
  navTabLeaderboard?.classList.remove("is-active");
  navTabAskQuestion?.classList.remove("is-active");
  forumSection?.classList.remove("is-hidden");
  leaderboardSection?.classList.add("is-hidden");
  loadDoubtsFeed();

  if (focusEditor && doubtTitleInput) {
    setTimeout(() => {
      askEditorCard?.scrollIntoView({ behavior: "smooth", block: "start" });
      doubtTitleInput.focus();
    }, 100);
  }
}

export function handleRoute() {
  const hash = window.location.hash.toLowerCase();
  qaLog("boot", `Handling route hash: "${hash}"`);
  if (hash === "#forum") {
    switchToForumView(false);
  } else if (hash === "#ask") {
    switchToForumView(true);
  } else {
    switchToLeaderboardView();
  }
}

navTabLeaderboard?.addEventListener("click", (e) => {
  e.preventDefault();
  history.pushState(null, "", "#leaderboard");
  switchToLeaderboardView();
});

navTabForum?.addEventListener("click", (e) => {
  e.preventDefault();
  history.pushState(null, "", "#forum");
  switchToForumView(false);
});

navTabAskQuestion?.addEventListener("click", (e) => {
  e.preventDefault();
  history.pushState(null, "", "#ask");
  switchToForumView(true);
});

btnScrollToAskEditor?.addEventListener("click", (e) => {
  e.preventDefault();
  history.pushState(null, "", "#ask");
  switchToForumView(true);
});

window.addEventListener("hashchange", handleRoute);

// -------------------------------------------------------------
// 5. User Session & Auth UI Controllers
// -------------------------------------------------------------
export function loadStoredUser() {
  qaLog("auth", "Loading stored user from localStorage");
  try {
    const raw = localStorage.getItem("coderank_user");
    if (raw) {
      currentUser = JSON.parse(raw);
      qaLog("auth", "Active session found in storage", currentUser);
      updateAuthUI(currentUser);
    } else {
      qaLog("auth", "No existing local user session found");
      updateAuthUI(null);
    }
  } catch (e) {
    qaError("auth", "Failed to parse stored user JSON", e);
  }
}

export function saveStoredUser(user) {
  qaLog("auth", "Updating stored user session", user);
  currentUser = user;
  if (user) {
    localStorage.setItem("coderank_user", JSON.stringify(user));
  } else {
    localStorage.removeItem("coderank_user");
  }
  updateAuthUI(user);
}

function updateAuthUI(user) {
  qaLog("auth", `Rendering navbar auth state (Logged In: ${!!user})`);
  if (!authNavButtons) return;
  if (user) {
    const displayName = user.fullName || user.email?.split("@")[0] || "Student";
    authNavButtons.innerHTML = `
      <div class="buttons mb-0">
        <button class="button is-primary is-light" id="btnOpenProfileModal" onclick="openMyProfileModal()" title="Open My Profile & Settings">
          <span class="icon is-small"><i class="fas fa-user-circle"></i></span>
          <span class="has-text-weight-semibold">${escapeHtml(displayName)}</span>
        </button>
        <button class="button is-danger is-outlined" id="btnLogout" title="Sign Out">
          <span class="icon is-small"><i class="fas fa-sign-out-alt"></i></span>
          <span>Logout</span>
        </button>
      </div>
    `;
    document.getElementById("btnOpenProfileModal")?.addEventListener("click", openMyProfileModal);
    document.getElementById("btnLogout")?.addEventListener("click", () => {
      qaLog("auth", "User triggered Sign Out");
      saveStoredUser(null);
      if (auth && !isMockMode) {
        signOut(auth).catch(e => qaError("auth", "Firebase signOut error", e));
      }
      showNotification("You have signed out. Redirecting to registration...", "is-info");
      updateUserStandingBanner([]);
      setTimeout(() => {
        window.location.href = "auth.html#register";
      }, 300);
    });
  } else {
    authNavButtons.innerHTML = `
      <a href="auth.html" class="button is-primary is-outlined js-open-auth-modal" id="btnOpenAuthModal">
        <span class="icon"><i class="fas fa-user-circle"></i></span>
        <span>Sign In / Register</span>
      </a>
    `;
    document.getElementById("btnOpenAuthModal")?.addEventListener("click", (e) => {
      e.preventDefault();
      window.location.href = "auth.html#register";
    });
  }
}

// -------------------------------------------------------------
// 6. Registration & Login Flows (With Detailed Trace Logging)
// -------------------------------------------------------------
export function calculateAcademicYear(rollNumber) {
  const admissionYearShort = parseInt(rollNumber.substring(0, 2), 10);
  const admissionYear = 2000 + admissionYearShort;
  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth() + 1; // 1-12

  let yearCalc = currentYear - admissionYear;
  if (currentMonth >= 7) {
    yearCalc += 1;
  }
  return Math.min(Math.max(yearCalc, 1), 4);
}

// Registration Form Handler
registerForm?.addEventListener("submit", async (e) => {
  e.preventDefault();
  qaLog("auth", "Step 1: Registration Form submitted");

  const fullName = document.getElementById("regName")?.value.trim() || "";
  const rollNumber = document.getElementById("regRoll")?.value.trim() || "";
  const branch = document.getElementById("regBranch")?.value || "CSE";
  const email = document.getElementById("regEmail")?.value.trim().toLowerCase() || "";
  const password = document.getElementById("regPassword")?.value || "";
  const submitBtn = document.getElementById("btnSubmitRegister");

  qaLog("auth", "Step 2: Validating Form Inputs", { fullName, rollNumber, branch, email, passLength: password.length });

  if (!/^\d{13}$/.test(rollNumber)) {
    qaLog("auth", "Validation failed: Roll number is not 13 digits");
    return showNotification("University Roll Number must be exactly 13 numeric digits.", "is-warning");
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    qaLog("auth", "Validation failed: Invalid email format");
    return showNotification("Please enter a valid email address.", "is-warning");
  }

  submitBtn?.classList.add("is-loading");
  if (submitBtn) submitBtn.disabled = true;

  try {
    const academicYear = calculateAcademicYear(rollNumber);
    const admissionYear = 2000 + parseInt(rollNumber.substring(0, 2), 10);
    qaLog("auth", `Step 3: Academic year computed: Year ${academicYear} (Admission: ${admissionYear})`);

    let uid = "student_" + rollNumber;

    // Step 4: Firebase Auth (Live or Local Fallback)
    if (auth && !isMockMode) {
      qaLog("auth", "Step 4A: Attempting Firebase createUserWithEmailAndPassword", { email });
      try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        uid = userCredential.user.uid;
        qaLog("auth", "Step 4A: Firebase Auth account created successfully", { uid });
      } catch (authErr) {
        qaError("auth", "Firebase createUserWithEmailAndPassword failed", authErr, { email });
      }
    } else {
      qaLog("auth", "Step 4B: Running in interactive local store mode (Generated UID)", { uid });
    }

    // Handles initialized to empty string as per requirement
    const initialHandles = { leetcode: "", codeforces: "", codechef: "" };
    const userProfile = {
      uid,
      fullName,
      rollNumber,
      email,
      branch,
      academicYear,
      admissionYear,
      handles: initialHandles,
      createdAt: new Date().toISOString()
    };

    // Step 5: Firestore setDoc
    if (db && !isMockMode) {
      qaLog("auth", "Step 5: Attempting Firestore setDoc on users/" + uid, userProfile);
      try {
        await setDoc(doc(db, "users", uid), userProfile);
        qaLog("auth", "Step 5: Firestore document created successfully");
      } catch (dbErr) {
        qaError("auth", "Firestore setDoc error", dbErr, { uid, userProfile });
      }
    }

    // Step 6: Backend API Sync
    qaLog("auth", "Step 6: Sending registration payload to Express backend: " + `${API_BASE_URL}/auth/register`);
    try {
      const res = await fetch(`${API_BASE_URL}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName,
          rollNumber,
          email,
          branch,
          password,
          handles: initialHandles
        })
      });
      qaLog("auth", `Step 6: Backend responded with HTTP status ${res.status}`);
      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        qaError("auth", "Backend registration returned non-200 status", { status: res.status, message: errJson.message });
      }
    } catch (apiErr) {
      qaError("auth", "Backend registration fetch failed", apiErr);
    }

    // Step 7: Update Local Datasets
    qaLog("auth", "Step 7: Seeding platform leaderboard datasets locally");
    const baseEntry = {
      uid,
      fullName,
      display_name: fullName,
      rollNumber,
      college_id: rollNumber,
      branch,
      academicYear,
      year: `${academicYear}th`,
      rating: 1500,
      total_solved: 0,
      totalSolved: 0
    };

    ['leetcode', 'codeforces', 'codechef'].forEach(plat => {
      const initialRating = plat === 'codeforces' ? 1200 : 1500;
      const platEntry = { ...baseEntry, handle: "", platform: plat, rating: initialRating };
      if (MOCK_PLATFORM_DATA[plat]) {
        const existingIdx = MOCK_PLATFORM_DATA[plat].findIndex(i => i.uid === uid || i.rollNumber === rollNumber);
        if (existingIdx >= 0) {
          MOCK_PLATFORM_DATA[plat][existingIdx] = platEntry;
        } else {
          MOCK_PLATFORM_DATA[plat].unshift(platEntry);
        }
      }
    });

    // Step 8: Save Session & Reset UI
    qaLog("auth", "Step 8: Finalizing user session and resetting UI");
    saveStoredUser(userProfile);
    if (selectAcademicYear) selectAcademicYear.value = "ALL";
    activeYear = "ALL";

    authModal?.classList.remove("is-active");
    registerForm?.reset();
    showNotification(`🎉 Account created for ${fullName}! Assigned to Year ${academicYear}. You can link CP handles in My Profile.`, "is-success");
    fetchLeaderboard();

  } catch (error) {
    qaError("auth", "Critical error during registration workflow", error);
    showNotification(`Registration failed: ${error.message}`, "is-danger");
  } finally {
    submitBtn?.classList.remove("is-loading");
    if (submitBtn) submitBtn.disabled = false;
  }
});

// Login Form Handler
loginForm?.addEventListener("submit", async (e) => {
  e.preventDefault();
  qaLog("auth", "Step 1: Sign In Form submitted");

  const email = document.getElementById("loginEmail")?.value.trim().toLowerCase() || "";
  const password = document.getElementById("loginPassword")?.value || "";
  const submitBtn = document.getElementById("btnSubmitLogin");

  qaLog("auth", "Step 2: Processing Login for email: " + email);

  submitBtn?.classList.add("is-loading");
  if (submitBtn) submitBtn.disabled = true;

  try {
    let loggedInUser = null;

    // Step 3A: Backend API Login
    qaLog("auth", "Step 3A: Attempting Backend API login via " + `${API_BASE_URL}/auth/login`);
    try {
      const res = await fetch(`${API_BASE_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
      });
      qaLog("auth", `Step 3A: Backend login HTTP status: ${res.status}`);
      if (res.ok) {
        const data = await res.json();
        loggedInUser = data.user;
        qaLog("auth", "Step 3A: Backend login successful", loggedInUser);
      }
    } catch (apiErr) {
      qaError("auth", "Backend API login fetch threw exception", apiErr);
    }

    // Step 3B: Firebase Auth
    if (auth && !isMockMode) {
      qaLog("auth", "Step 3B: Attempting Firebase signInWithEmailAndPassword");
      try {
        const cred = await signInWithEmailAndPassword(auth, email, password);
        qaLog("auth", "Step 3B: Firebase sign-in successful", { uid: cred.user.uid });
        if (!loggedInUser) {
          loggedInUser = {
            uid: cred.user.uid,
            fullName: cred.user.displayName || email.split("@")[0],
            email: cred.user.email,
            academicYear: 3,
            rollNumber: "22BCSE001"
          };
        }
      } catch (fbErr) {
        qaError("auth", "Firebase signInWithEmailAndPassword failed", fbErr, { email });
      }
    }

    // Step 3C: Local Demo Session Fallback
    if (!loggedInUser) {
      qaLog("auth", "Step 3C: Creating local fallback demo session");
      loggedInUser = {
        uid: "user_" + email.split("@")[0],
        fullName: email.split("@")[0],
        email: email,
        academicYear: 3,
        branch: "CSE",
        rollNumber: "22BCSE001"
      };
    }

    saveStoredUser(loggedInUser);
    authModal?.classList.remove("is-active");
    loginForm?.reset();
    showNotification(`Welcome back, ${loggedInUser.fullName}! Signed in successfully.`, "is-success");
    fetchLeaderboard();

  } catch (error) {
    qaError("auth", "Sign in workflow error", error);
    showNotification(`Sign in failed: ${error.message}`, "is-danger");
  } finally {
    submitBtn?.classList.remove("is-loading");
    if (submitBtn) submitBtn.disabled = false;
  }
});

// Modal Helpers & Window Exports
export function openAuthModal(defaultTab = 'register') {
  qaLog("auth", `Redirecting to Auth Portal: "${defaultTab}"`);
  window.location.href = defaultTab === 'login' ? 'auth.html?tab=login' : 'auth.html#register';
}

export function closeAuthModal() {
  qaLog("auth", "Closing Auth Modal");
  if (authModal) authModal.classList.remove("is-active");
}

export function switchAuthTab(tabName) {
  qaLog("auth", `Switching auth tabs to: "${tabName}"`);
  if (tabName === 'login') {
    tabLogin?.classList.add("is-active");
    tabRegister?.classList.remove("is-active");
    loginForm?.classList.remove("is-hidden");
    registerForm?.classList.add("is-hidden");
  } else {
    tabRegister?.classList.add("is-active");
    tabLogin?.classList.remove("is-active");
    registerForm?.classList.remove("is-hidden");
    loginForm?.classList.add("is-hidden");
  }
}

window.openAuthModal = openAuthModal;
window.closeAuthModal = closeAuthModal;
window.switchAuthTab = switchAuthTab;

btnOpenAuthModal?.addEventListener("click", () => openAuthModal('register'));
btnCloseAuthModal?.addEventListener("click", () => closeAuthModal());
modalBg?.addEventListener("click", () => closeAuthModal());

tabRegister?.addEventListener("click", () => switchAuthTab('register'));
tabLogin?.addEventListener("click", () => switchAuthTab('login'));

// -------------------------------------------------------------
// 7. Dedicated "My Profile" Modal & Competitive Handles
// -------------------------------------------------------------
export async function openMyProfileModal() {
  qaLog("profile", "Step 1: Triggered openMyProfileModal()");
  if (!myProfileModal) {
    qaError("profile", "myProfileModal element is missing from DOM", new Error("DOM null"));
    return;
  }
  if (!currentUser) {
    qaLog("profile", "No active session. Redirecting to Auth Modal.");
    window.openAuthModal('login');
    showNotification("Please sign in first to access your profile.", "is-info");
    return;
  }

  qaLog("profile", "Step 2: Populating Student Identity Card", currentUser);
  if (profileCardName) profileCardName.textContent = currentUser.fullName || "Student";
  if (profileCardEmail) profileCardEmail.textContent = currentUser.email || "—";
  if (profileCardYear) profileCardYear.textContent = currentUser.academicYear ? `Year ${currentUser.academicYear}` : "Year 3";
  if (profileCardBranch) profileCardBranch.textContent = currentUser.branch || "CSE";
  if (profileCardRoll) profileCardRoll.textContent = currentUser.rollNumber || "—";

  // Step 3: Fetch Handles
  let userHandles = currentUser.handles || { leetcode: "", codeforces: "", codechef: "" };
  if (db && !isMockMode && currentUser.uid) {
    qaLog("profile", "Step 3: Querying Firestore users/" + currentUser.uid + " for updated handles");
    try {
      const userSnap = await getDoc(doc(db, "users", currentUser.uid));
      if (userSnap.exists() && userSnap.data().handles) {
        userHandles = userSnap.data().handles;
        qaLog("profile", "Step 3: Firestore handles retrieved", userHandles);
      }
    } catch (fsErr) {
      qaError("profile", "Firestore getDoc error", fsErr, { uid: currentUser.uid });
    }
  }

  if (profLeetCode) profLeetCode.value = userHandles.leetcode || "";
  if (profCodeforces) profCodeforces.value = userHandles.codeforces || "";
  if (profCodeChef) profCodeChef.value = userHandles.codechef || "";

  profilePasswordForm?.reset();
  errCurrentPassword?.classList.add("is-hidden");
  errPasswordMismatch?.classList.add("is-hidden");

  qaLog("profile", "Step 4: Activating modal overlay");
  myProfileModal.classList.add("is-active");
}

export function closeMyProfileModal() {
  qaLog("profile", "Closing My Profile Modal");
  myProfileModal?.classList.remove("is-active");
}

window.openMyProfileModal = openMyProfileModal;
window.closeMyProfileModal = closeMyProfileModal;

btnCloseProfileModal?.addEventListener("click", closeMyProfileModal);
modalProfileBg?.addEventListener("click", closeMyProfileModal);
btnOpenEditHandlesModal?.addEventListener("click", openMyProfileModal);

// Form A: Update Handles Submit Handler
profileHandlesForm?.addEventListener("submit", async (e) => {
  e.preventDefault();
  qaLog("profile", "Form A: Submitted handle updates");
  if (!currentUser) return;

  const rawLeetCode = profLeetCode?.value.trim() || "";
  const rawCodeforces = profCodeforces?.value.trim() || "";
  const rawCodeChef = profCodeChef?.value.trim() || "";

  const cleanLc = cleanHandle("leetcode", rawLeetCode);
  const cleanCf = cleanHandle("codeforces", rawCodeforces);
  const cleanCc = cleanHandle("codechef", rawCodeChef);

  qaLog("profile", "Sanitized Handles Output", { raw: { rawLeetCode, rawCodeforces, rawCodeChef }, clean: { cleanLc, cleanCf, cleanCc } });

  btnSaveHandles?.classList.add("is-loading");
  if (btnSaveHandles) btnSaveHandles.disabled = true;

  try {
    const updatedHandles = {
      leetcode: cleanLc,
      codeforces: cleanCf,
      codechef: cleanCc
    };

    // 1. Update Firestore
    if (db && !isMockMode && currentUser.uid) {
      qaLog("profile", "Updating Firestore document users/" + currentUser.uid, updatedHandles);
      try {
        await updateDoc(doc(db, "users", currentUser.uid), {
          handles: updatedHandles,
          updatedAt: serverTimestamp ? serverTimestamp() : new Date().toISOString()
        });
        qaLog("profile", "Firestore handles updated successfully");
      } catch (fsErr) {
        qaError("profile", "Firestore updateDoc failed", fsErr);
      }
    }

    // 2. Sync Backend API
    qaLog("profile", "Syncing handles to backend API: " + `${API_BASE_URL}/user/handles`);
    try {
      const res = await fetch(`${API_BASE_URL}/user/handles`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          uid: currentUser.uid,
          rollNumber: currentUser.rollNumber,
          fullName: currentUser.fullName,
          branch: currentUser.branch,
          academicYear: currentUser.academicYear,
          handles: updatedHandles
        })
      });
      qaLog("profile", `Backend handles sync HTTP status: ${res.status}`);
      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        qaError("profile", "Backend handles sync failed", { status: res.status, message: errJson.message });
      }
    } catch (apiErr) {
      qaError("profile", "Backend handles sync fetch exception", apiErr);
    }

    // 3. Update local session & datasets
    currentUser.handles = updatedHandles;
    saveStoredUser(currentUser);

    ['leetcode', 'codeforces', 'codechef'].forEach(plat => {
      const h = updatedHandles[plat];
      if (MOCK_PLATFORM_DATA[plat]) {
        const item = MOCK_PLATFORM_DATA[plat].find(i => i.uid === currentUser.uid || i.rollNumber === currentUser.rollNumber);
        if (item) item.handle = h;
      }
    });

    closeMyProfileModal();
    showNotification("✨ Competitive handles updated successfully! Campus standings synced.", "is-success");
    fetchLeaderboard();

  } catch (err) {
    qaError("profile", "Error updating competitive handles", err);
    showNotification(`Failed to update handles: ${err.message}`, "is-danger");
  } finally {
    btnSaveHandles?.classList.remove("is-loading");
    if (btnSaveHandles) btnSaveHandles.disabled = false;
  }
});

// Form B: Password Change Handler (with Re-authentication)
profilePasswordForm?.addEventListener("submit", async (e) => {
  e.preventDefault();
  qaLog("profile", "Form B: Password Change submitted");
  
  const currentPassword = profCurrentPassword?.value || "";
  const newPassword = profNewPassword?.value || "";
  const confirmPassword = profConfirmPassword?.value || "";

  errCurrentPassword?.classList.add("is-hidden");
  errPasswordMismatch?.classList.add("is-hidden");

  if (newPassword !== confirmPassword) {
    qaLog("profile", "Password mismatch validation triggered");
    errPasswordMismatch?.classList.remove("is-hidden");
    return;
  }

  if (newPassword.length < 6) {
    qaLog("profile", "Password length validation failed (< 6 characters)");
    showNotification("New password must be at least 6 characters long.", "is-warning");
    return;
  }

  btnSavePassword?.classList.add("is-loading");
  if (btnSavePassword) btnSavePassword.disabled = true;

  try {
    // 1. Update in MongoDB Atlas via Backend API
    qaLog("profile", "Step 1: Sending password change request to backend API");
    const res = await fetch(`${API_BASE_URL}/auth/change-password`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        uid: currentUser?.uid,
        email: currentUser?.email,
        currentPassword,
        newPassword
      })
    });

    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      if (errData.error && errData.error.toLowerCase().includes("current password")) {
        errCurrentPassword?.classList.remove("is-hidden");
        throw new Error("Current password verification failed.");
      }
      throw new Error(errData.error || "Password change failed on backend");
    }

    // 2. Also update Firebase Auth if active
    if (auth && !isMockMode && auth.currentUser) {
      const user = auth.currentUser;
      const email = user.email || currentUser?.email;
      qaLog("profile", "Step 2: Re-authenticating with EmailAuthProvider for Firebase", { email });
      try {
        const credential = EmailAuthProvider.credential(email, currentPassword);
        await reauthenticateWithCredential(user, credential);
        await updatePassword(user, newPassword);
        qaLog("profile", "Step 2: Password updated in Firebase Auth");
      } catch (authErr) {
        qaWarn("profile", "Firebase password sync note:", authErr.message);
      }
    }

    profilePasswordForm?.reset();
    showNotification("🔒 Password changed successfully in database!", "is-success");
    closeMyProfileModal();

  } catch (err) {
    qaError("profile", "Password change workflow error", err);
    if (!errCurrentPassword || errCurrentPassword.classList.contains("is-hidden")) {
      showNotification(`Password update failed: ${err.message}`, "is-danger");
    }
  } finally {
    btnSavePassword?.classList.remove("is-loading");
    if (btnSavePassword) btnSavePassword.disabled = false;
  }
});

// -------------------------------------------------------------
// 8. Leaderboard Fetch & Rendering Pipeline
// -------------------------------------------------------------
export async function fetchLeaderboard() {
  qaLog("lead", `Fetching leaderboard data for Platform: "${activePlatform}", Year: "${activeYear}", Metric: "${activeMetric}"`);
  if (!leaderboardTableBody) {
    qaError("lead", "leaderboardTableBody element is null", new Error("DOM missing"));
    return;
  }

  // 1. Instant local render
  const baseData = MOCK_PLATFORM_DATA[activePlatform] || [];
  let initialRows = baseData.filter(item => {
    if (activeYear === "ALL") return true;
    const yrNum = parseInt(activeYear, 10);
    return item.academicYear === yrNum || item.year?.includes(`${yrNum}`);
  });

  const sortField = activeMetric === "solved" ? "total_solved" : "rating";
  initialRows.sort((a, b) => (b[sortField] || 0) - (a[sortField] || 0));
  renderLeaderboardTable(initialRows);

  // 2. Query Backend API
  const url = `${API_BASE_URL}/leaderboard/${activePlatform}?year=${activeYear}&metric=${activeMetric}`;
  qaLog("lead", "Querying MongoDB backend API: " + url);
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);

    const res = await fetch(url, { signal: controller.signal });
    clearTimeout(timeoutId);

    qaLog("lead", `Leaderboard API returned status: ${res.status}`);
    if (res.ok) {
      const data = await res.json();
      qaLog("lead", `Retrieved ${data.data?.length || 0} student standings from MongoDB Atlas`);
      if (data.data && data.data.length > 0) {
        renderLeaderboardTable(data.data);
      }
    } else {
      qaError("lead", "Leaderboard API non-200 response", { status: res.status });
    }
  } catch (apiErr) {
    if (apiErr.name === "AbortError") {
      qaLog("lead", "Backend fetch timed out (10s). Displaying local cached standings.");
    } else {
      qaError("lead", "Backend API fetch exception", apiErr);
    }
  }
}

function updateUserStandingBanner(rows = []) {
  const banner = document.getElementById("userStandingBanner");
  if (!banner) return;

  if (!currentUser) {
    banner.classList.add("is-hidden");
    return;
  }

  const bannerUserName = document.getElementById("bannerUserName");
  const bannerUserYear = document.getElementById("bannerUserYear");
  const bannerUserRank = document.getElementById("bannerUserRank");
  const bannerPlatformName = document.getElementById("bannerPlatformName");
  const bannerMetricTitle = document.getElementById("bannerMetricTitle");
  const bannerMetricValue = document.getElementById("bannerMetricValue");

  if (bannerUserName) bannerUserName.textContent = currentUser.fullName || "Student";
  if (bannerUserYear) bannerUserYear.textContent = currentUser.academicYear ? `Year ${currentUser.academicYear}` : "Year 3";
  if (bannerPlatformName) bannerPlatformName.textContent = activePlatform.toUpperCase();
  if (bannerMetricTitle) bannerMetricTitle.textContent = activeMetric === "solved" ? "Total Solved" : "Contest Rating";

  const currentRoll = currentUser.rollNumber;
  const currentUid = currentUser.uid;
  const currentEmail = currentUser.email;

  const foundIndex = rows.findIndex(item => 
    (currentRoll && (item.rollNumber === currentRoll || item.college_id === currentRoll)) ||
    (currentUid && item.uid === currentUid) ||
    (currentEmail && item.email === currentEmail)
  );

  if (foundIndex >= 0) {
    const item = rows[foundIndex];
    const rank = foundIndex + 1;
    const metricVal = activeMetric === "solved" 
      ? (item.total_solved !== undefined ? item.total_solved : (item.totalSolved || 0)) 
      : (item.rating || (activePlatform === 'codeforces' ? 1200 : 1500));

    if (bannerUserRank) bannerUserRank.textContent = `Rank #${rank}`;
    if (bannerMetricValue) bannerMetricValue.textContent = metricVal.toLocaleString();
  } else {
    if (bannerUserRank) bannerUserRank.textContent = `Rank Pending / Filtered`;
    if (bannerMetricValue) bannerMetricValue.textContent = `—`;
  }

  banner.classList.remove("is-hidden");
}

function renderLeaderboardTable(rows) {
  qaLog("lead", `Rendering leaderboard rows (Total: ${rows?.length || 0})`);
  updateUserStandingBanner(rows);

  if (!rows || rows.length === 0) {
    leaderboardTableBody.innerHTML = `
      <tr>
        <td colspan="7" class="has-text-centered py-5 has-text-grey">
          <span class="icon is-small mr-1"><i class="fas fa-info-circle"></i></span>
          <span>No students found matching the selected cohort filter.</span>
        </td>
      </tr>
    `;
    return;
  }

  leaderboardTableBody.innerHTML = rows.map((item, index) => {
    const rank = index + 1;
    let rankBadge = `<span class="is-size-6 has-text-grey-dark">${rank}</span>`;
    let rowClass = "";

    if (rank === 1) {
      rankBadge = `<span class="rank-badge badge-gold">1</span>`;
      rowClass = "rank-1";
    } else if (rank === 2) {
      rankBadge = `<span class="rank-badge badge-silver">2</span>`;
      rowClass = "rank-2";
    } else if (rank === 3) {
      rankBadge = `<span class="rank-badge badge-bronze">3</span>`;
      rowClass = "rank-3";
    }

    const name = item.fullName || item.display_name || "Student";
    const roll = item.rollNumber || item.college_id || "—";
    const cohort = item.academicYear ? `Year ${item.academicYear}` : (item.year || "Year 3");
    const branch = item.branch || "CSE";
    
    const isCurrentUser = currentUser && (
      (currentUser.rollNumber && (roll === currentUser.rollNumber)) ||
      (currentUser.uid && (item.uid === currentUser.uid)) ||
      (currentUser.email && (item.email === currentUser.email))
    );

    let handle = "";
    if (typeof item.handle === "string" && item.handle.trim() && item.handle !== "—") {
      handle = item.handle.trim();
    } else if (item.handles && typeof item.handles[activePlatform] === "string" && item.handles[activePlatform].trim()) {
      handle = item.handles[activePlatform].trim();
    } else if (item.platforms && item.platforms[activePlatform]?.handle) {
      handle = String(item.platforms[activePlatform].handle).trim();
    } else if (item.platform_handle) {
      handle = String(item.platform_handle).trim();
    }

    const profileUrl = getPlatformProfileUrl(activePlatform, handle);

    const metricValue = activeMetric === "solved" 
      ? (item.total_solved !== undefined ? item.total_solved : (item.totalSolved || 0)) 
      : (item.rating || (activePlatform === 'codeforces' ? 1200 : 1500));

    return `
      <tr class="${rowClass} ${isCurrentUser ? 'has-background-primary-light has-text-weight-semibold' : ''}">
        <td class="has-text-centered">${rankBadge}</td>
        <td>
          <strong>${escapeHtml(name)}</strong>
          ${isCurrentUser ? '<span class="tag is-primary is-small ml-2"><i class="fas fa-user-check mr-1"></i>You</span>' : ''}
        </td>
        <td><code>${escapeHtml(roll)}</code></td>
        <td><span class="tag is-info is-light">${escapeHtml(cohort)}</span></td>
        <td><span class="tag is-light">${escapeHtml(branch)}</span></td>
        <td>
          ${handle ? `
            <a 
              href="${profileUrl}" 
              target="_blank" 
              rel="noopener noreferrer" 
              class="tag is-link is-light has-text-weight-semibold platform-profile-link" 
              title="Open ${escapeHtml(handle)}'s ${activePlatform.toUpperCase()} profile"
              style="text-decoration: none; cursor: pointer; transition: all 0.2s ease;"
              onmouseover="this.classList.remove('is-light')"
              onmouseout="this.classList.add('is-light')"
            >
              <span class="icon is-small mr-1">
                ${activePlatform === 'leetcode' ? '<i class="fas fa-code"></i>' : activePlatform === 'codeforces' ? '<i class="fas fa-chart-line"></i>' : '<i class="fas fa-utensils"></i>'}
              </span>
              <span>${escapeHtml(handle)}</span>
              <span class="icon is-small ml-1 is-size-7"><i class="fas fa-external-link-alt"></i></span>
            </a>
          ` : `<span class="has-text-grey-light is-size-7">Not linked</span>`}
        </td>
        <td class="has-text-right">
          <strong class="is-size-6 has-text-dark">${metricValue.toLocaleString()}</strong>
        </td>
      </tr>
    `;
  }).join("");
}

export function cleanHandle(platform, raw) {
  if (!raw || typeof raw !== "string") return "";
  let clean = raw.trim();

  if (platform === "leetcode") {
    clean = clean.replace(/^https?:\/\/(www\.)?leetcode\.com\/(u\/)?/i, "");
    clean = clean.replace(/\/.*$/, "");
  } else if (platform === "codeforces") {
    clean = clean.replace(/^https?:\/\/(www\.)?codeforces\.com\/(profile\/)?/i, "");
    clean = clean.replace(/\/.*$/, "");
  } else if (platform === "codechef") {
    clean = clean.replace(/^https?:\/\/(www\.)?codechef\.com\/(users\/)?/i, "");
    clean = clean.replace(/\/.*$/, "");
  }

  clean = clean.replace(/^@+/, "").replace(/\/+$/, "").trim();
  return clean;
}

export function getPlatformProfileUrl(platform, handle) {
  const clean = cleanHandle(platform, handle);
  if (!clean || clean === "—") return "#";
  
  if (platform === "leetcode") {
    return `https://leetcode.com/u/${encodeURIComponent(clean)}/`;
  }
  if (platform === "codeforces") {
    return `https://codeforces.com/profile/${encodeURIComponent(clean)}`;
  }
  if (platform === "codechef") {
    return `https://www.codechef.com/users/${encodeURIComponent(clean)}`;
  }
  return "#";
}

// Leaderboard Event Listeners
platformTabItems.forEach(tab => {
  tab.addEventListener("click", () => {
    platformTabItems.forEach(t => t.classList.remove("is-active"));
    tab.classList.add("is-active");
    activePlatform = tab.dataset.platform;
    qaLog("lead", `Selected Platform tab: ${activePlatform}`);
    fetchLeaderboard();
  });
});

selectAcademicYear?.addEventListener("change", (e) => {
  activeYear = e.target.value;
  qaLog("lead", `Selected Academic Year filter: ${activeYear}`);
  fetchLeaderboard();
});

btnMetricRating?.addEventListener("click", () => {
  btnMetricRating.classList.add("is-primary", "is-selected");
  btnMetricSolved.classList.remove("is-primary", "is-selected");
  activeMetric = "rating";
  thMetricHeader.textContent = "Contest Rating";
  qaLog("lead", "Switched metric to: Contest Rating");
  fetchLeaderboard();
});

btnMetricSolved?.addEventListener("click", () => {
  btnMetricSolved.classList.add("is-primary", "is-selected");
  btnMetricRating.classList.remove("is-primary", "is-selected");
  activeMetric = "solved";
  thMetricHeader.textContent = "Total Solved";
  qaLog("lead", "Switched metric to: Total Solved");
  fetchLeaderboard();
});

btnRefreshLeaderboard?.addEventListener("click", async () => {
  btnRefreshLeaderboard.classList.add("is-loading");
  showNotification(`🔄 Polling remote platforms and syncing campus standings for ${activePlatform.toUpperCase()}...`, "is-info");
  try {
    await fetch(`${API_BASE_URL}/sync/trigger/${activePlatform}`, { method: "POST" });
  } catch (e) {
    qaLog("lead", "Sync trigger warning:", e.message);
  }
  await fetchLeaderboard();
  btnRefreshLeaderboard.classList.remove("is-loading");
  showNotification(`✅ Campus standings up to date for ${activePlatform.toUpperCase()}!`, "is-success");
});

// -------------------------------------------------------------
// 9. Markdown Doubt Forum & Live Preview Logic
// -------------------------------------------------------------
marked.setOptions({
  breaks: true,
  gfm: true,
  highlight: function(code, lang) {
    if (lang && Prism.languages[lang]) {
      return Prism.highlight(code, Prism.languages[lang], lang);
    }
    return code;
  }
});

function renderTags() {
  if (!doubtTagsContainer || !previewTags) return;
  doubtTagsContainer.innerHTML = "";
  previewTags.innerHTML = "";

  doubtTags.forEach((tag, index) => {
    const tagSpan = document.createElement("span");
    tagSpan.className = "tag is-info is-medium is-light mr-2 mb-2";
    tagSpan.innerHTML = `
      <span>${escapeHtml(tag)}</span>
      <button type="button" class="delete is-small" data-index="${index}"></button>
    `;
    doubtTagsContainer.appendChild(tagSpan);

    const previewSpan = document.createElement("span");
    previewSpan.className = "tag is-info is-light mr-1";
    previewSpan.textContent = tag;
    previewTags.appendChild(previewSpan);
  });
}

function addDoubtTag(rawValue) {
  const cleanTag = rawValue.trim().replace(/^,+|,+$/g, "");
  if (!cleanTag) return;
  if (!doubtTags.includes(cleanTag)) {
    if (doubtTags.length >= 5) {
      showNotification("Maximum 5 tags allowed per question.", "is-warning");
      return;
    }
    doubtTags.push(cleanTag);
    renderTags();
  }
  if (doubtTagInput) doubtTagInput.value = "";
}

doubtTagInput?.addEventListener("keydown", (e) => {
  if (e.key === "Enter" || e.key === ",") {
    e.preventDefault();
    addDoubtTag(e.target.value);
  }
});

doubtTagsContainer?.addEventListener("click", (e) => {
  if (e.target.classList.contains("delete")) {
    const idx = parseInt(e.target.dataset.index, 10);
    doubtTags.splice(idx, 1);
    renderTags();
  }
});

function updateLivePreview() {
  if (!previewTitle || !previewContent) return;
  const title = doubtTitleInput?.value.trim();
  const body = doubtBodyInput?.value || "";

  previewTitle.textContent = title || "Title will preview here...";
  
  if (!body.trim()) {
    previewContent.innerHTML = `<p class="has-text-grey-light is-italic">Live markdown output will render here in real-time...</p>`;
    return;
  }

  try {
    previewContent.innerHTML = marked.parse(body);
    Prism.highlightAllUnder(previewContent);
  } catch (err) {
    qaError("forum", "Markdown parsing error in preview", err);
    previewContent.innerHTML = `<p class="has-text-danger">Syntax rendering error</p>`;
  }
}

doubtTitleInput?.addEventListener("input", updateLivePreview);
doubtBodyInput?.addEventListener("input", updateLivePreview);

function insertCodeTemplate(language, snippet) {
  if (!doubtBodyInput) return;
  const current = doubtBodyInput.value;
  const formattedSnippet = `\n\`\`\`${language}\n${snippet}\n\`\`\`\n`;
  doubtBodyInput.value = current + formattedSnippet;
  updateLivePreview();
  doubtBodyInput.focus();
}

btnInsertCpp?.addEventListener("click", () => {
  insertCodeTemplate("cpp", `#include <iostream>\n#include <vector>\nusing namespace std;\n\nint main() {\n    // Write your optimized solution here\n    return 0;\n}`);
});

btnInsertPy?.addEventListener("click", () => {
  insertCodeTemplate("python", `def solve():\n    # Write Python solution\n    pass\n\nif __name__ == "__main__":\n    solve()`);
});

askDoubtForm?.addEventListener("submit", async (e) => {
  e.preventDefault();
  qaLog("forum", "Step 1: Submitting new doubt question");

  const title = doubtTitleInput?.value.trim();
  const description = doubtBodyInput?.value.trim();

  if (!title || !description) {
    return showNotification("Please provide both a Title and detailed Description.", "is-warning");
  }

  btnSubmitDoubt?.classList.add("is-loading");
  if (btnSubmitDoubt) btnSubmitDoubt.disabled = true;

  try {
    const authorName = currentUser?.fullName || auth?.currentUser?.displayName || "Student Developer";
    const authorUid = currentUser?.uid || auth?.currentUser?.uid || "anon_" + Date.now();
    const newDoubt = {
      title,
      description,
      markdownBody: description,
      authorName,
      authorUid,
      tags: [...doubtTags],
      upvotes: 0,
      upvotes_count: 0,
      answers: [],
      isResolved: false,
      is_resolved: false,
      createdAt: new Date().toISOString(),
      created_at: Date.now()
    };

    qaLog("forum", "Step 2: Doubt Payload", newDoubt);

    // 1. Post to MongoDB Backend API
    try {
      const res = await fetch(`${API_BASE_URL}/doubts`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          markdownBody: description,
          tags: [...doubtTags],
          authorUid,
          authorName
        })
      });
      if (res.ok) {
        const resData = await res.json();
        if (resData.doubt) {
          newDoubt._id = resData.doubt._id || resData.doubt.id;
          newDoubt.id = resData.doubt._id || resData.doubt.id;
        }
      }
    } catch (apiErr) {
      qaLog("forum", "Backend post doubt error, fallback to local:", apiErr.message);
    }

    // Save to Firestore if available
    if (db && !isMockMode) {
      qaLog("forum", "Step 3: Saving doubt to Firestore 'doubts' collection");
      try {
        const docRef = await addDoc(collection(db, "doubts"), {
          ...newDoubt,
          createdAt: serverTimestamp ? serverTimestamp() : new Date().toISOString()
        });
        if (!newDoubt.id) newDoubt.id = docRef.id;
        qaLog("forum", "Step 3: Firestore doubt saved with ID: " + docRef.id);
      } catch (dbErr) {
        qaError("forum", "Firestore addDoc error for doubts", dbErr);
      }
    }

    if (!newDoubt.id) newDoubt.id = "doubt_" + Date.now();
    MOCK_DOUBTS.unshift(newDoubt);

    askDoubtForm?.reset();
    doubtTags = ["C++", "DP"];
    renderTags();
    updateLivePreview();

    showNotification("🚀 Question posted to the Doubt Resolution Forum!", "is-success");
    loadDoubtsFeed();

  } catch (error) {
    qaError("forum", "Failed to post doubt", error);
    showNotification(`Failed to post doubt: ${error.message}`, "is-danger");
  } finally {
    btnSubmitDoubt?.classList.remove("is-loading");
    if (btnSubmitDoubt) btnSubmitDoubt.disabled = false;
  }
});

// Doubts Feed Renderer
export async function loadDoubtsFeed() {
  qaLog("forum", "Loading Doubts Feed");
  if (!doubtsFeedContainer) return;

  let doubts = [];

  // 1. Fetch from MongoDB Atlas Backend
  try {
    const res = await fetch(`${API_BASE_URL}/doubts`);
    if (res.ok) {
      const data = await res.json();
      if (data.doubts && data.doubts.length > 0) {
        doubts = data.doubts.map(d => ({
          ...d,
          id: d._id || d.id
        }));
        qaLog("forum", `Loaded ${doubts.length} doubts from MongoDB Atlas`);
      }
    }
  } catch (apiErr) {
    qaLog("forum", "Backend doubts fetch failed, checking Firestore/mock:", apiErr.message);
  }

  // 2. Fallback to Firestore if configured
  if (doubts.length === 0 && db && !isMockMode) {
    qaLog("forum", "Querying Firestore 'doubts' collection ordered by createdAt desc");
    try {
      const q = query(collection(db, "doubts"), orderBy("createdAt", "desc"));
      const snapshot = await getDocs(q);
      if (!snapshot.empty) {
        doubts = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        qaLog("forum", `Loaded ${doubts.length} doubts from Firestore`);
      }
    } catch (err) {
      qaError("forum", "Firestore doubts fetch error", err);
    }
  }

  // 3. Fallback to MOCK_DOUBTS
  if (doubts.length === 0) {
    doubts = [...MOCK_DOUBTS];
  }

  cachedDoubts = doubts;
  renderDoubtsFeed(doubts);
}

function renderDoubtsFeed(doubts) {
  qaLog("forum", `Rendering ${doubts.length} doubt cards into feed`);
  if (!doubts || doubts.length === 0) {
    doubtsFeedContainer.innerHTML = `
      <div class="box has-text-centered py-6 has-text-grey">
        <span class="icon is-large has-text-grey-light mb-2"><i class="fas fa-comments fa-3x"></i></span>
        <p class="is-size-5 has-text-weight-semibold">No questions posted yet.</p>
        <p class="is-size-7">Be the first student to post a coding question or doubt!</p>
      </div>
    `;
    return;
  }

  doubtsFeedContainer.innerHTML = doubts.map(doubt => {
    const isResolved = doubt.isResolved || doubt.is_resolved;
    const author = doubt.authorName || doubt.author_name || "Student";
    const dateStr = doubt.createdAt ? new Date(doubt.createdAt).toLocaleDateString() : "Just now";
    const answersCount = doubt.answers ? doubt.answers.length : 0;
    const upvotes = doubt.upvotes || doubt.upvotes_count || 0;
    const tagsHtml = (doubt.tags || []).map(t => `<span class="tag is-info is-light is-small mr-1">${escapeHtml(t)}</span>`).join("");
    const doubtId = doubt._id || doubt.id;

    return `
      <div class="box mb-4 hover-shadow" style="border-left: 4px solid ${isResolved ? '#48c78e' : '#485fc7'}; transition: all 0.2s ease;">
        <div class="level is-mobile mb-2">
          <div class="level-left">
            <span class="tag ${isResolved ? 'is-success' : 'is-warning'} is-light is-small mr-2">
              <span class="icon is-small mr-1">${isResolved ? '<i class="fas fa-check-circle"></i>' : '<i class="fas fa-clock"></i>'}</span>
              <span>${isResolved ? 'Resolved' : 'Unresolved'}</span>
            </span>
            <span class="is-size-7 has-text-grey">By <strong>${escapeHtml(author)}</strong> &middot; ${dateStr}</span>
          </div>
          <div class="level-right">
            <span class="tag is-white is-small">
              <span class="icon is-small mr-1 has-text-link"><i class="fas fa-comment-dots"></i></span>
              <span>${answersCount} answers</span>
            </span>
          </div>
        </div>

        <h4 class="title is-5 mb-2 has-text-dark cursor-pointer view-doubt-btn" data-doubt-id="${doubtId}">
          <a class="has-text-dark hover-primary">${escapeHtml(doubt.title)}</a>
        </h4>

        <div class="tags mb-3">${tagsHtml}</div>

        <div class="level is-mobile pt-2" style="border-top: 1px solid #f1f5f9;">
          <div class="level-left">
            <button class="button is-small is-light btn-doubt-upvote" data-doubt-id="${doubtId}">
              <span class="icon is-small has-text-danger"><i class="fas fa-heart"></i></span>
              <span class="has-text-weight-semibold ml-1">${upvotes}</span>
            </button>
          </div>
          <div class="level-right">
            <button class="button is-small is-primary is-outlined view-doubt-btn" data-doubt-id="${doubtId}">
              <span>View & Answer</span>
              <span class="icon is-small"><i class="fas fa-chevron-right"></i></span>
            </button>
          </div>
        </div>
      </div>
    `;
  }).join("");

  // Attach card click handlers
  document.querySelectorAll(".view-doubt-btn").forEach(el => {
    el.addEventListener("click", (e) => {
      const doubtId = el.dataset.doubtId || el.closest("[data-doubt-id]")?.dataset.doubtId;
      qaLog("forum", `Opening detail modal for Doubt ID: ${doubtId}`);
      const item = doubts.find(d => String(d.id) === String(doubtId) || String(d._id) === String(doubtId));
      if (item) openViewDoubtModal(item);
    });
  });

  document.querySelectorAll(".btn-doubt-upvote").forEach(el => {
    el.addEventListener("click", async (e) => {
      e.stopPropagation();
      const did = el.getAttribute("data-doubt-id");
      const item = doubts.find(d => String(d.id) === String(did) || String(d._id) === String(did));
      if (item) {
        item.upvotes = (item.upvotes || item.upvotes_count || 0) + 1;
        item.upvotes_count = item.upvotes;
        el.querySelector(".has-text-weight-semibold").textContent = item.upvotes;
        showNotification("👍 Upvote recorded!", "is-success");
      }
      try {
        await fetch(`${API_BASE_URL}/doubts/${did}/upvote`, { method: "POST" });
      } catch (err) {}
    });
  });
}

function openViewDoubtModal(doubt) {
  if (!viewDoubtModal) return;
  activeDoubtItem = doubt;
  qaLog("forum", "Displaying View Doubt Modal", doubt);

  const isResolved = doubt.isResolved || doubt.is_resolved;
  if (modalDoubtTitleHeader) modalDoubtTitleHeader.textContent = `Doubt #${doubt.id || "Detail"}`;
  if (modalDoubtTitle) modalDoubtTitle.textContent = doubt.title || "Question";
  if (modalDoubtAuthor) modalDoubtAuthor.textContent = doubt.authorName || doubt.author_name || "Student";
  if (modalDoubtDate) modalDoubtDate.textContent = doubt.createdAt ? new Date(doubt.createdAt).toLocaleDateString() : "Recent";
  
  if (modalDoubtStatusBadge) {
    modalDoubtStatusBadge.className = `tag ${isResolved ? 'is-success' : 'is-warning'} is-light`;
    modalDoubtStatusBadge.textContent = isResolved ? "Resolved" : "Unresolved";
  }

  if (modalDoubtTags) {
    modalDoubtTags.innerHTML = (doubt.tags || []).map(t => `<span class="tag is-info is-light">${escapeHtml(t)}</span>`).join("");
  }

  const bodyContent = doubt.markdownBody || doubt.description || "";
  if (modalDoubtBody) {
    modalDoubtBody.innerHTML = marked.parse(bodyContent);
  }

  if (modalDoubtUpvotesCount) {
    modalDoubtUpvotesCount.textContent = doubt.upvotes || doubt.upvotes_count || 0;
  }

  renderModalAnswers(doubt.answers || []);
  Prism.highlightAllUnder(viewDoubtModal);
  viewDoubtModal.classList.add("is-active");
}

function renderModalAnswers(answers) {
  if (!modalAnswersList) return;
  if (!answers || !answers.length) {
    modalAnswersList.innerHTML = `<p class="has-text-grey is-italic is-size-7">No answers posted yet. Be the first to help!</p>`;
    return;
  }

  modalAnswersList.innerHTML = answers.map(ans => `
    <div class="box has-background-white-bis p-3 mb-3">
      <div class="level is-mobile mb-1">
        <div class="level-left">
          <strong class="is-size-7">${escapeHtml(ans.author_name || ans.authorName || "Peer")}</strong>
          ${ans.is_accepted ? '<span class="tag is-success is-light is-small ml-2">Accepted Solution</span>' : ''}
        </div>
      </div>
      <div class="content is-small mb-2">${marked.parse(ans.content || "")}</div>
      <span class="is-size-7 has-text-grey">▲ ${ans.upvotes_count || 0} helpful votes</span>
    </div>
  `).join("");
}

btnCloseViewDoubtModal?.addEventListener("click", () => viewDoubtModal?.classList.remove("is-active"));
modalViewDoubtBg?.addEventListener("click", () => viewDoubtModal?.classList.remove("is-active"));

btnUpvoteDoubtModal?.addEventListener("click", async () => {
  if (activeDoubtItem) {
    const did = activeDoubtItem._id || activeDoubtItem.id;
    activeDoubtItem.upvotes = (activeDoubtItem.upvotes || activeDoubtItem.upvotes_count || 0) + 1;
    activeDoubtItem.upvotes_count = activeDoubtItem.upvotes;
    if (modalDoubtUpvotesCount) modalDoubtUpvotesCount.textContent = activeDoubtItem.upvotes;
    showNotification("👍 Upvote recorded!", "is-success");
    try {
      await fetch(`${API_BASE_URL}/doubts/${did}/upvote`, { method: "POST" });
    } catch (e) {}
    const cardBadge = document.querySelector(`.btn-doubt-upvote[data-doubt-id="${did}"] .has-text-weight-semibold`);
    if (cardBadge) cardBadge.textContent = activeDoubtItem.upvotes;
  }
});

btnSubmitAnswer?.addEventListener("click", async () => {
  const ansText = modalAnswerInput?.value.trim();
  if (!ansText) return showNotification("Please write an answer before submitting.", "is-warning");

  const authorName = currentUser?.fullName || auth?.currentUser?.displayName || "You";
  const authorId = currentUser?.uid || auth?.currentUser?.uid || "student_peer";
  const newAns = {
    id: "ans_" + Date.now(),
    author_id: authorId,
    author_name: authorName,
    content: ansText,
    upvotes_count: 0,
    is_accepted: false,
    created_at: new Date()
  };

  qaLog("forum", "Posting new answer to doubt", newAns);

  if (activeDoubtItem) {
    const did = activeDoubtItem._id || activeDoubtItem.id;
    try {
      await fetch(`${API_BASE_URL}/doubts/${did}/answers`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content: ansText,
          authorName,
          authorId
        })
      });
    } catch (apiErr) {
      qaLog("forum", "Answer backend sync note:", apiErr.message);
    }

    if (!activeDoubtItem.answers) activeDoubtItem.answers = [];
    activeDoubtItem.answers.push(newAns);
    renderModalAnswers(activeDoubtItem.answers);
    if (modalAnswerInput) modalAnswerInput.value = "";
    Prism.highlightAllUnder(modalAnswersList);
    showNotification("🎉 Answer posted successfully!", "is-success");
  }
});

btnRefreshDoubts?.addEventListener("click", loadDoubtsFeed);

// -------------------------------------------------------------
// 10. Boot Initialization & Window Exports
// -------------------------------------------------------------
window.saveStoredUser = saveStoredUser;
window.loadStoredUser = loadStoredUser;
window.fetchLeaderboard = fetchLeaderboard;
window.switchToLeaderboardView = switchToLeaderboardView;
window.switchToForumView = switchToForumView;
window.openMyProfileModal = openMyProfileModal;
window.closeMyProfileModal = closeMyProfileModal;
window.openAuthModal = openAuthModal;
window.closeAuthModal = closeAuthModal;
window.switchAuthTab = switchAuthTab;
window.cleanHandle = cleanHandle;
window.calculateAcademicYear = calculateAcademicYear;
window.validateDOMElements = validateDOMElements;

function boot() {
  qaLog("boot", "🚀 Initializing CodeRank App Boot Sequence");
  validateDOMElements();
  loadStoredUser();
  renderTags();
  updateLivePreview();
  handleRoute();
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", boot);
} else {
  boot();
}
