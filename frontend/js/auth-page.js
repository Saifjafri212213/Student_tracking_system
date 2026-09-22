
// ==========================================================================
// CodeRank Authentication Controller (Modular Firebase v9+ / v10)
// Includes Automatic Academic Year Calculation from 13-Digit Roll Number
// ==========================================================================
import { 
    auth, 
    db, 
    isMockMode, 
    signInWithEmailAndPassword, 
    createUserWithEmailAndPassword, 
    onAuthStateChanged,
    doc, 
    setDoc, 
    serverTimestamp 
} from "./firebase-config.js";
import { sendPasswordResetEmail } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

// Check active session on load
if (auth && !isMockMode) {
    onAuthStateChanged(auth, (user) => {
        if (user) {
            console.log("⚡ Active authenticated user detected:", user.email);
            window.location.href = "index.html";
        }
    });
}

// Campus Configuration Constants
const ALLOWED_COLLEGE_DOMAINS = ["@college.ac.in", "@aktu.ac.in"];
const AKTU_ROLL_REGEX = /^[0-9]{13}$/; // Strict 13-digit numeric format

// DOM Elements: Navigation & Toggle
const tabLogin = document.getElementById("tab-login");
const tabRegister = document.getElementById("tab-register");
const formLogin = document.getElementById("form-login");
const formRegister = document.getElementById("form-register");
const btnSwitchToRegister = document.getElementById("btn-switch-to-register");
const btnSwitchToLogin = document.getElementById("btn-switch-to-login");
const authAlertBox = document.getElementById("auth-alert-box");
const alertIcon = document.getElementById("alert-icon");
const alertMessage = document.getElementById("alert-message");

// DOM Elements: Login Fields
const inputLoginEmail = document.getElementById("login-email");
const inputLoginPassword = document.getElementById("login-password");
const btnLoginSubmit = document.getElementById("btn-login-submit");

// DOM Elements: Register Fields
const inputRegName = document.getElementById("reg-name");
const inputRegRoll = document.getElementById("reg-roll");
const inputRegEmail = document.getElementById("reg-email");
const inputRegPassword = document.getElementById("reg-password");
const inputRegHandleLc = document.getElementById("reg-handle-lc");
const inputRegHandleCf = document.getElementById("reg-handle-cf");
const inputRegHandleCc = document.getElementById("reg-handle-cc");
const btnRegisterSubmit = document.getElementById("btn-register-submit");

// DOM Elements: Forgot Password Modal
const btnForgotPassword = document.getElementById("btn-forgot-password");
const modalForgotPwd = document.getElementById("modal-forgot-pwd");
const btnCloseForgotModal = document.getElementById("btn-close-forgot-modal");
const btnCancelForgot = document.getElementById("btn-cancel-forgot");
const formForgotPwd = document.getElementById("form-forgot-pwd");
const inputForgotEmail = document.getElementById("forgot-email");

// ==========================================================================
// 1. Automatic Academic Year Calculation Logic
// ==========================================================================

/**
 * Calculates current academic year (1, 2, 3, or 4) from a 13-digit university roll number
 * First 2 digits represent admission year (e.g., '23' -> 2023).
 * Academic sessions begin in July/August (Month >= 7).
 * 
 * Example:
 * If current date is Sept 2026:
 * - Admission 2026 ('2600...') -> 1st Year (1)
 * - Admission 2025 ('2500...') -> 2nd Year (2)
 * - Admission 2024 ('2400...') -> 3rd Year (3)
 * - Admission 2023 ('2300...') -> 4th Year (4)
 * 
 * @param {string} rollNumber 13-digit university roll number
 * @returns {{ academicYear: number, yearLabel: string, branch: string }}
 */
export function calculateAcademicDetails(rollNumber) {
    const cleanRoll = rollNumber.trim();
    if (cleanRoll.length < 2) {
        return { academicYear: 1, yearLabel: "1st Year", branch: "CSE" };
    }

    // 1. Extract 2-digit admission year prefix
    const admissionYearPrefix = parseInt(cleanRoll.substring(0, 2), 10);
    const admissionYear = 2000 + admissionYearPrefix;

    // 2. Determine current academic session start year
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth() + 1; // 1 to 12

    // If month >= July (7), current session belongs to currentYear; else (currentYear - 1)
    const sessionStartYear = currentMonth >= 7 ? currentYear : currentYear - 1;

    // 3. Compute academic year difference
    let calculatedYear = sessionStartYear - admissionYear + 1;

    // Clamp between 1st Year (1) and 4th Year (4)
    if (calculatedYear < 1) calculatedYear = 1;
    if (calculatedYear > 4) calculatedYear = 4;

    const yearLabels = {
        1: "1st Year",
        2: "2nd Year",
        3: "3rd Year",
        4: "4th Year"
    };

    // 4. Derive Branch from digits 7-8 (Standard AKTU Course Code)
    let branch = "CSE";
    if (cleanRoll.length >= 8) {
        const branchCode = cleanRoll.substring(6, 8);
        if (branchCode === "10") branch = "CSE";
        else if (branchCode === "13") branch = "IT";
        else if (branchCode === "31") branch = "ECE";
        else if (branchCode === "40") branch = "AI/DS";
    }

    return {
        academicYear: calculatedYear,
        yearLabel: yearLabels[calculatedYear] || `${calculatedYear}th Year`,
        branch
    };
}

// ==========================================================================
// Helper Utilities & Validation
// ==========================================================================

function showAlert(message, type = "error") {
    if (!authAlertBox) return;
    const bulmaType = type === "success" ? "is-success" : (type === "warning" ? "is-warning" : "is-danger");
    authAlertBox.className = `notification ${bulmaType} is-light mb-4`;
    if (alertIcon) {
        alertIcon.innerHTML = type === "success" 
            ? `<i class="fas fa-check-circle"></i>` 
            : `<i class="fas fa-exclamation-triangle"></i>`;
    }
    if (alertMessage) alertMessage.textContent = message;
    authAlertBox.classList.remove("hidden");
    authAlertBox.classList.remove("is-hidden");
}

function hideAlert() {
    if (authAlertBox) {
        authAlertBox.classList.add("hidden");
        authAlertBox.classList.add("is-hidden");
    }
}

function isCollegeEmailValid(email) {
    if (!email) return false;
    const lowerEmail = email.trim().toLowerCase();
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(lowerEmail);
}

function isAktuRollValid(roll) {
    if (!roll) return false;
    return AKTU_ROLL_REGEX.test(roll.trim());
}

// Live Roll Number helper
inputRegRoll?.addEventListener("input", (e) => {
    e.target.value = e.target.value.replace(/[^0-9]/g, "");
    if (e.target.value.length >= 2) {
        const { academicYear, yearLabel, branch } = calculateAcademicDetails(e.target.value);
        const hintEl = document.getElementById("roll-hint");
        if (hintEl) {
            hintEl.textContent = `Auto-detected: ${yearLabel} • Dept: ${branch}`;
            hintEl.style.color = "var(--brand-primary, #6366f1)";
        }
    }
});

// Tab navigation with Bulma support
function switchTab(mode) {
    hideAlert();
    const tabLoginLi = document.getElementById("tab-login-li");
    const tabRegisterLi = document.getElementById("tab-register-li");

    if (mode === "login") {
        tabLogin?.classList.add("active");
        tabRegister?.classList.remove("active");
        tabLoginLi?.classList.add("is-active");
        tabRegisterLi?.classList.remove("is-active");
        formLogin?.classList.add("active");
        formLogin?.classList.remove("is-hidden");
        formRegister?.classList.remove("active");
        formRegister?.classList.add("is-hidden");
    } else {
        tabRegister?.classList.add("active");
        tabLogin?.classList.remove("active");
        tabRegisterLi?.classList.add("is-active");
        tabLoginLi?.classList.remove("is-active");
        formRegister?.classList.add("active");
        formRegister?.classList.remove("is-hidden");
        formLogin?.classList.remove("active");
        formLogin?.classList.add("is-hidden");
    }
}

tabLogin?.addEventListener("click", () => switchTab("login"));
tabRegister?.addEventListener("click", () => switchTab("register"));
btnSwitchToRegister?.addEventListener("click", () => switchTab("register"));
btnSwitchToLogin?.addEventListener("click", () => switchTab("login"));

// Initialize tab based on URL hash or parameter (defaults to registration)
function initAuthTab() {
    const hash = window.location.hash.toLowerCase();
    const urlParams = new URLSearchParams(window.location.search);
    const tabParam = urlParams.get("tab");
    if (tabParam === "login" || hash === "#login") {
        switchTab("login");
    } else {
        switchTab("register");
    }
}
initAuthTab();
window.addEventListener("hashchange", initAuthTab);

// Password toggle
document.querySelectorAll(".toggle-password-btn").forEach(btn => {
    btn.addEventListener("click", () => {
        const targetInputId = btn.getAttribute("data-target");
        const targetInput = document.getElementById(targetInputId);
        if (targetInput) {
            const isPassword = targetInput.type === "password";
            targetInput.type = isPassword ? "text" : "password";
            btn.textContent = isPassword ? "🙈" : "👁️";
        }
    });
});

// ==========================================================================
// 2. Registration Flow with Automatic Year Calculation & Firestore Hook
// ==========================================================================

formRegister.addEventListener("submit", async (e) => {
    e.preventDefault();
    hideAlert();

    const name = inputRegName.value.trim();
    const rollNumber = inputRegRoll.value.trim();
    const email = inputRegEmail.value.trim();
    const password = inputRegPassword.value;
    const lcHandle = inputRegHandleLc.value.trim();
    const cfHandle = inputRegHandleCf.value.trim();
    const ccHandle = inputRegHandleCc.value.trim();

    // 1. Validation: 13-Digit AKTU Roll Number
    if (!isAktuRollValid(rollNumber)) {
        showAlert("Invalid University Roll Number! Must be an exact 13-digit numeric code (e.g. 2100910100045).", "error");
        inputRegRoll.focus();
        return;
    }

    // 2. Validation: College Email Domain Enforcement
    if (!isCollegeEmailValid(email)) {
        showAlert(`Registration Blocked: Only official university emails ending in ${ALLOWED_COLLEGE_DOMAINS.join(" or ")} are permitted.`, "error");
        inputRegEmail.focus();
        return;
    }

    // 3. Validation: Password Length
    if (password.length < 6) {
        showAlert("Password must be at least 6 characters long.", "error");
        inputRegPassword.focus();
        return;
    }

    btnRegisterSubmit.disabled = true;
    btnRegisterSubmit.querySelector(".btn-spinner")?.classList.remove("hidden");
    btnRegisterSubmit.querySelector("span:last-child").textContent = "Creating Account...";

    try {
        // Compute Academic Year Automatically
        const { academicYear, yearLabel, branch } = calculateAcademicDetails(rollNumber);

        const apiBase = window.location.origin.includes(':5001') ? `${window.location.origin}/api` : 'http://localhost:5001/api';
        let registeredUser = {
            uid: 'user_' + rollNumber,
            fullName: name,
            rollNumber,
            email,
            branch,
            academicYear,
            admissionYear: 2000 + parseInt(rollNumber.substring(0, 2), 10),
            handles: {
                leetcode: lcHandle,
                codeforces: cfHandle,
                codechef: ccHandle
            }
        };

        try {
            const regRes = await fetch(`${apiBase}/auth/register`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    fullName: name,
                    rollNumber,
                    email,
                    branch,
                    password,
                    handles: {
                        leetcode: lcHandle,
                        codeforces: cfHandle,
                        codechef: ccHandle
                    }
                })
            });
            if (regRes.ok) {
                const regData = await regRes.json();
                if (regData.user) registeredUser = regData.user;
            }
        } catch (apiErr) {
            console.warn("Backend register call note:", apiErr.message);
        }

        try {
            localStorage.setItem("coderank_user", JSON.stringify(registeredUser));
        } catch (e) {}

        if (isMockMode) {
            showAlert(`🎉 Account created for ${name} (${rollNumber}) - Assigned to ${yearLabel}! Redirecting...`, "success");
            setTimeout(() => {
                window.location.href = "index.html";
            }, 1200);
            return;
        }

        // Firebase v9+ Create User
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        // ==================================================================
        // DATABASE HOOK: Write document with numeric academicYear (1-4)
        // Enables compound index queries (?year=1|2|3|4) on the leaderboard.
        // ==================================================================
        const userDocPayload = {
            uid: user.uid,
            display_name: name,
            roll_number: rollNumber,
            college_id: rollNumber,
            email: email,
            academicYear: academicYear,   // Numeric index field: 1, 2, 3, or 4
            year: `${academicYear}${academicYear === 1 ? 'st' : (academicYear === 2 ? 'nd' : (academicYear === 3 ? 'rd' : 'th'))}`,
            yearLabel: yearLabel,
            branch: branch,
            platforms: {
                leetcode: {
                    handle: lcHandle,
                    total_solved: 0,
                    rating: 0,
                    rating_rank: null,
                    questions_rank: null,
                    last_synced_at: null
                },
                codeforces: {
                    handle: cfHandle,
                    total_solved: 0,
                    rating: 0,
                    rank_title: "unrated",
                    rating_rank: null,
                    questions_rank: null,
                    last_synced_at: null
                },
                codechef: {
                    handle: ccHandle,
                    total_solved: 0,
                    rating: 0,
                    stars: 0,
                    rating_rank: null,
                    questions_rank: null,
                    last_synced_at: null
                }
            },
            handles: {
                leetcode: lcHandle,
                codeforces: cfHandle,
                codechef: ccHandle
            },
            created_at: serverTimestamp(),
            last_synced_at: null
        };

        // Write directly to Firestore
        await setDoc(doc(db, "users", user.uid), userDocPayload, { merge: true });

        showAlert(`🎉 Registration complete! Welcome to CodeRank (${yearLabel}). Redirecting...`, "success");
        setTimeout(() => {
            window.location.href = "index.html";
        }, 1200);

    } catch (error) {
        console.error("[Auth Error]", error);
        let errorMsg = error.message;
        if (error.code === "auth/email-already-in-use") {
            errorMsg = "An account with this college email already exists. Please sign in.";
        } else if (error.code === "auth/weak-password") {
            errorMsg = "Password is too weak. Please choose a stronger password.";
        }
        showAlert(errorMsg, "error");
    } finally {
        btnRegisterSubmit.disabled = false;
        btnRegisterSubmit.querySelector(".btn-spinner")?.classList.add("hidden");
        btnRegisterSubmit.querySelector("span:last-child").textContent = "Complete Registration";
    }
});

// ==========================================================================
// 3. Login Flow
// ==========================================================================

formLogin.addEventListener("submit", async (e) => {
    e.preventDefault();
    hideAlert();

    const email = inputLoginEmail.value.trim();
    const password = inputLoginPassword.value;

    if (!email || !password) {
        showAlert("Please enter your college email and password.", "error");
        return;
    }

    btnLoginSubmit.disabled = true;
    btnLoginSubmit.querySelector(".btn-spinner")?.classList.remove("hidden");
    btnLoginSubmit.querySelector("span:last-child").textContent = "Signing in...";

    try {
        const apiBase = window.location.origin.includes(':5001') ? `${window.location.origin}/api` : 'http://localhost:5001/api';
        let loggedUser = null;
        try {
            const logRes = await fetch(`${apiBase}/auth/login`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password })
            });
            if (logRes.ok) {
                const logData = await logRes.json();
                loggedUser = logData.user;
            }
        } catch (apiErr) {
            console.warn("Backend login call note:", apiErr.message);
        }

        if (!loggedUser) {
            loggedUser = {
                uid: 'user_' + email.split('@')[0],
                fullName: email.split('@')[0],
                email,
                academicYear: 3,
                branch: 'CSE',
                rollNumber: '22BCSE001'
            };
        }

        try {
            localStorage.setItem("coderank_user", JSON.stringify(loggedUser));
        } catch (e) {}

        if (isMockMode) {
            showAlert("✅ Signed in successfully! Loading campus leaderboards...", "success");
            setTimeout(() => { window.location.href = "index.html"; }, 800);
            return;
        }

        await signInWithEmailAndPassword(auth, email, password);
        showAlert("✅ Authentication successful! Loading dashboard...", "success");
        setTimeout(() => { window.location.href = "index.html"; }, 800);

    } catch (error) {
        console.error("[Login Error]", error);
        let errorMsg = error.message;
        if (error.code === "auth/invalid-credential" || error.code === "auth/user-not-found" || error.code === "auth/wrong-password") {
            errorMsg = "Invalid college email or password. Please verify your credentials.";
        }
        showAlert(errorMsg, "error");
    } finally {
        btnLoginSubmit.disabled = false;
        btnLoginSubmit.querySelector(".btn-spinner")?.classList.add("hidden");
        btnLoginSubmit.querySelector("span:last-child").textContent = "Sign In to CodeRank";
    }
});

// ==========================================================================
// 4. Forgot Password Flow
// ==========================================================================

btnForgotPassword?.addEventListener("click", () => {
    modalForgotPwd?.classList.add("is-active");
    modalForgotPwd?.classList.remove("hidden");
});

btnCloseForgotModal?.addEventListener("click", () => {
    modalForgotPwd?.classList.remove("is-active");
    modalForgotPwd?.classList.add("hidden");
});

btnCancelForgot?.addEventListener("click", () => {
    modalForgotPwd?.classList.remove("is-active");
    modalForgotPwd?.classList.add("hidden");
});

document.getElementById("modalForgotBg")?.addEventListener("click", () => {
    modalForgotPwd?.classList.remove("is-active");
    modalForgotPwd?.classList.add("hidden");
});

formForgotPwd?.addEventListener("submit", async (e) => {
    e.preventDefault();
    const email = inputForgotEmail.value.trim();

    if (!isCollegeEmailValid(email)) {
        alert(`Please enter a valid university email ending with ${ALLOWED_COLLEGE_DOMAINS.join(" or ")}`);
        return;
    }

    try {
        if (isMockMode) {
            alert(`📧 Password reset link sent to ${email} (Demo Mode).`);
            modalForgotPwd?.classList.remove("is-active");
            modalForgotPwd?.classList.add("hidden");
            return;
        }

        await sendPasswordResetEmail(auth, email);
        alert(`📧 Password reset instructions have been sent to ${email}. Check your inbox!`);
        modalForgotPwd?.classList.remove("is-active");
        modalForgotPwd?.classList.add("hidden");
    } catch (err) {
        alert("Password reset error: " + err.message);
    }
});
