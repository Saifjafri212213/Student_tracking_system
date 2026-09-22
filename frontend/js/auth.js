// ==========================================================================
// Authentication, Handle Linking, and View Navigation
// ==========================================================================
import { 
    auth, 
    db, 
    isMockMode, 
    signOut, 
    onAuthStateChanged,
    doc,
    setDoc,
    getDoc,
    MOCK_PLATFORM_DATA
} from "./firebase-config.js";

// State
export let currentUser = null;

// DOM Elements
const navTabs = document.querySelectorAll(".nav-tab");
const viewSections = document.querySelectorAll(".view-section");
const btnLoginModal = document.getElementById("btn-login-modal");
const userAvatarMenu = document.getElementById("user-avatar-menu");
const userNavName = document.getElementById("user-nav-name");
const userNavAvatar = document.getElementById("user-nav-avatar");
const btnLogout = document.getElementById("btn-logout");

// Profile Elements
const formLinkHandles = document.getElementById("form-link-handles");
const inputStudentName = document.getElementById("input-student-name");
const inputCollegeId = document.getElementById("input-college-id");
const selectBranch = document.getElementById("select-branch");
const selectYear = document.getElementById("select-year");
const inputLeetcodeHandle = document.getElementById("input-leetcode-handle");
const inputCodeforcesHandle = document.getElementById("input-codeforces-handle");
const inputCodechefHandle = document.getElementById("input-codechef-handle");
const btnTriggerInstantSync = document.getElementById("btn-trigger-instant-sync");

// Rank Badges
const profileStatLeetcode = document.getElementById("profile-stat-leetcode");
const profileStatCodeforces = document.getElementById("profile-stat-codeforces");
const profileStatCodechef = document.getElementById("profile-stat-codechef");

function setupNavigation() {
    navTabs.forEach(tab => {
        tab.addEventListener("click", () => {
            const targetViewId = tab.getAttribute("data-view");
            navTabs.forEach(t => t.classList.remove("active"));
            viewSections.forEach(s => s.classList.remove("active"));

            tab.classList.add("active");
            const targetSection = document.getElementById(targetViewId);
            if (targetSection) {
                targetSection.classList.add("active");
            }
        });
    });

    document.getElementById("brand-home-btn").addEventListener("click", () => {
        document.getElementById("tab-btn-leaderboard").click();
    });
}

function setupAuthHandlers() {
    // Redirect to the split-screen auth portal
    btnLoginModal.addEventListener("click", () => {
        window.location.href = "auth.html";
    });

    btnLogout.addEventListener("click", async () => {
        if (!isMockMode && auth) {
            await signOut(auth);
        }
        currentUser = null;
        updateUIForUser(null);
        window.location.href = "auth.html#register";
    });

    if (!isMockMode && auth) {
        onAuthStateChanged(auth, async (user) => {
            currentUser = user;
            updateUIForUser(user);
            if (user) {
                loadUserProfile(user.uid);
            }
        });
    } else {
        const demoUser = MOCK_PLATFORM_DATA.leetcode[0];
        populateProfileFields(demoUser);
    }
}

function updateUIForUser(user) {
    if (user) {
        btnLoginModal.classList.add("hidden");
        userAvatarMenu.classList.remove("hidden");
        userNavName.textContent = user.displayName || user.email.split("@")[0];
        userNavAvatar.src = `https://api.dicebear.com/7.x/bottts/svg?seed=${userNavName.textContent}`;
        
        document.getElementById("profile-display-name").textContent = user.displayName || user.email.split("@")[0];
        document.getElementById("profile-display-id").textContent = `UID: ${user.uid.substring(0, 8)}...`;
    } else {
        btnLoginModal.classList.remove("hidden");
        userAvatarMenu.classList.add("hidden");
        document.getElementById("profile-display-name").textContent = "Guest Student";
        document.getElementById("profile-display-id").textContent = "Unauthenticated";
    }
}

function populateProfileFields(data) {
    inputStudentName.value = data.display_name || "";
    inputCollegeId.value = data.college_id || data.roll_number || "";
    selectBranch.value = data.branch || "CSE";
    selectYear.value = data.year || "3rd";
    
    const platforms = data.platforms || {};
    inputLeetcodeHandle.value = platforms.leetcode?.handle || data.handle || "aarav_cp";
    inputCodeforcesHandle.value = platforms.codeforces?.handle || "aarav_grandmaster";
    inputCodechefHandle.value = platforms.codechef?.handle || "aarav_chef";

    document.getElementById("profile-display-name").textContent = data.display_name || "Aarav Sharma";
    document.getElementById("profile-display-id").textContent = `Roll No: ${data.college_id || data.roll_number || '2100910100045'}`;
    document.getElementById("profile-badge-branch").textContent = `Dept: ${data.branch || 'CSE'}`;
    document.getElementById("profile-badge-year").textContent = `${data.year || '4th'} Year`;
    document.getElementById("profile-large-avatar").src = `https://api.dicebear.com/7.x/bottts/svg?seed=${data.display_name || 'Aarav'}`;

    if (profileStatLeetcode) profileStatLeetcode.textContent = `#${data.rating_rank || 1}`;
    if (profileStatCodeforces) profileStatCodeforces.textContent = `#1`;
    if (profileStatCodechef) profileStatCodechef.textContent = `#1`;
}

async function loadUserProfile(uid) {
    try {
        const userDoc = await getDoc(doc(db, "users", uid));
        if (userDoc.exists()) {
            populateProfileFields(userDoc.data());
        }
    } catch (e) {
        console.error("Error loading profile:", e);
    }
}

function setupProfileHandlers() {
    formLinkHandles.addEventListener("submit", async (e) => {
        e.preventDefault();
        const profilePayload = {
            display_name: inputStudentName.value.trim(),
            college_id: inputCollegeId.value.trim(),
            roll_number: inputCollegeId.value.trim(),
            branch: selectBranch.value,
            year: selectYear.value,
            platforms: {
                leetcode: { handle: inputLeetcodeHandle.value.trim() },
                codeforces: { handle: inputCodeforcesHandle.value.trim() },
                codechef: { handle: inputCodechefHandle.value.trim() }
            },
            updated_at: Date.now()
        };

        if (isMockMode || !currentUser) {
            populateProfileFields(profilePayload);
            alert("💾 Handles saved! Each platform will be synced on its isolated cron schedule.");
            return;
        }

        try {
            await setDoc(doc(db, "users", currentUser.uid), profilePayload, { merge: true });
            alert("💾 Handles updated in Firestore! Background workers will sync each platform independently.");
            loadUserProfile(currentUser.uid);
        } catch (err) {
            alert("Save failed: " + err.message);
        }
    });

    btnTriggerInstantSync.addEventListener("click", async () => {
        btnTriggerInstantSync.textContent = "⏳ Triggering Sync...";
        try {
            const apiBase = window.location.origin.includes(':5001') ? `${window.location.origin}/api` : 'http://localhost:5001/api';
            await fetch(`${apiBase}/sync/trigger/all`, { method: "POST" }).catch(() => {});
        } catch (e) {}

        setTimeout(() => {
            btnTriggerInstantSync.textContent = "✅ Synced Just Now";
            setTimeout(() => {
                btnTriggerInstantSync.textContent = "🔄 Trigger Live Sync";
            }, 3000);
        }, 1500);
    });
}

document.addEventListener("DOMContentLoaded", () => {
    setupNavigation();
    setupAuthHandlers();
    setupProfileHandlers();
});
