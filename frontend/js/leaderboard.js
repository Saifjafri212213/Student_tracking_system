// ==========================================================================
// Platform-Isolated Leaderboard Controller
// Fetches only the active platform's dataset on-demand.
// ==========================================================================
import { 
    db, 
    isMockMode, 
    collection, 
    onSnapshot, 
    MOCK_PLATFORM_DATA 
} from "./firebase-config.js";

// Active State
let activePlatform = "leetcode"; // 'leetcode' | 'codeforces' | 'codechef'
let activeSubTab = "rating";     // 'rating' | 'questions'
let searchQuery = "";
let selectedBranch = "ALL";
let selectedYear = "ALL";
let currentPlatformData = [];

// DOM Elements
const platformButtons = document.querySelectorAll(".platform-tab-btn");
const subtabButtons = document.querySelectorAll(".subtab-btn");
const searchInput = document.getElementById("leaderboard-search-input");
const filterBranch = document.getElementById("filter-branch");
const filterYear = document.getElementById("filter-year");
const tableBody = document.getElementById("leaderboard-table-body");
const thPlatformHandle = document.getElementById("th-platform-handle");
const thPrimaryMetric = document.getElementById("th-primary-metric");
const thBreakdownMetric = document.getElementById("th-breakdown-metric");

// Top Ribbon Elements
const ribbonLabel1 = document.getElementById("ribbon-label-1");
const statPrimaryMetric = document.getElementById("stat-primary-metric");
const statActiveCoders = document.getElementById("stat-active-coders");
const statTopDelta = document.getElementById("stat-top-delta");
const statRankOne = document.getElementById("stat-rank-one");

// Ambient Glow Elements
const glow1 = document.getElementById("ambient-glow-1");
const glow2 = document.getElementById("ambient-glow-2");

/**
 * Data Fetching: Fetches ONLY the active platform's data.
 * When a user clicks 'Codeforces', only Codeforces data is fetched.
 */
async function fetchActivePlatformData() {
    tableBody.innerHTML = `
        <tr class="loading-row">
            <td colspan="7">
                <div class="loader-spinner"></div>
                <p>Fetching ${getPlatformDisplayName(activePlatform)} rankings...</p>
            </td>
        </tr>
    `;

    try {
        // Attempt fetch from Express REST API
        const apiUrl = window.location.origin.includes(':5001') ? `${window.location.origin}/api` : 'http://localhost:5001/api';
        const url = `${apiUrl}/leaderboard/${activePlatform}?sort=${activeSubTab}&branch=${selectedBranch}&year=${selectedYear}`;
        const res = await fetch(url).catch(() => null);

        if (res && res.ok) {
            const json = await res.json();
            currentPlatformData = json.data || [];
            updateStatsRibbon();
            renderLeaderboard();
            return;
        }

        // Live Firestore fallback
        if (!isMockMode && db) {
            onSnapshot(collection(db, `leaderboard_${activePlatform}`), (snap) => {
                const list = [];
                snap.forEach(doc => {
                    const data = doc.data();
                    data.uid = doc.id;
                    list.push(data);
                });
                if (list.length > 0) {
                    currentPlatformData = list;
                    updateStatsRibbon();
                    renderLeaderboard();
                    return;
                }
            });
        }

        // Default to platform isolated mock data
        currentPlatformData = [...(MOCK_PLATFORM_DATA[activePlatform] || [])];
        updateStatsRibbon();
        renderLeaderboard();

    } catch (err) {
        console.warn(`[Leaderboard] Fallback for ${activePlatform}:`, err.message);
        currentPlatformData = [...(MOCK_PLATFORM_DATA[activePlatform] || [])];
        updateStatsRibbon();
        renderLeaderboard();
    }
}

/**
 * Setup Event Listeners and Platform Navigation
 */
function setupPlatformLeaderboards() {
    // 1. Platform Switcher (LeetCode / Codeforces / CodeChef)
    platformButtons.forEach(btn => {
        btn.addEventListener("click", () => {
            platformButtons.forEach(b => b.classList.remove("active"));
            btn.classList.add("active");
            activePlatform = btn.getAttribute("data-platform");

            updatePlatformTheme();
            updateTableHeaders();
            fetchActivePlatformData();
        });
    });

    // 2. Sub-Tabs (Contest Ratings vs Total Questions)
    subtabButtons.forEach(btn => {
        btn.addEventListener("click", () => {
            subtabButtons.forEach(b => b.classList.remove("active"));
            btn.classList.add("active");
            activeSubTab = btn.getAttribute("data-subtab");

            updateTableHeaders();
            renderLeaderboard();
        });
    });

    // 3. Search and Department Filters
    searchInput.addEventListener("input", (e) => {
        searchQuery = e.target.value.toLowerCase().trim();
        renderLeaderboard();
    });

    filterBranch.addEventListener("change", (e) => {
        selectedBranch = e.target.value;
        fetchActivePlatformData();
    });

    filterYear.addEventListener("change", (e) => {
        selectedYear = e.target.value;
        fetchActivePlatformData();
    });

    updatePlatformTheme();
    updateTableHeaders();
    fetchActivePlatformData();
}

/**
 * Update Background Glow & Theme Accents for the Active Platform
 */
function updatePlatformTheme() {
    if (activePlatform === "leetcode") {
        glow1.style.background = "radial-gradient(circle, rgba(255, 161, 22, 0.15), transparent 70%)";
        glow2.style.background = "radial-gradient(circle, rgba(255, 192, 30, 0.12), transparent 70%)";
    } else if (activePlatform === "codeforces") {
        glow1.style.background = "radial-gradient(circle, rgba(49, 130, 206, 0.18), transparent 70%)";
        glow2.style.background = "radial-gradient(circle, rgba(99, 179, 237, 0.12), transparent 70%)";
    } else if (activePlatform === "codechef") {
        glow1.style.background = "radial-gradient(circle, rgba(176, 125, 75, 0.2), transparent 70%)";
        glow2.style.background = "radial-gradient(circle, rgba(226, 183, 136, 0.15), transparent 70%)";
    }
}

/**
 * Dynamically updates table headers according to the active platform and sub-tab
 */
function updateTableHeaders() {
    const pName = getPlatformDisplayName(activePlatform);
    thPlatformHandle.textContent = `${pName} Handle`;

    if (activeSubTab === "rating") {
        thPrimaryMetric.textContent = `${pName} Rating`;
        thBreakdownMetric.textContent = activePlatform === "leetcode" ? "Solved Breakdown" : (activePlatform === "codeforces" ? "Rank Title" : "Star Tier");
    } else {
        thPrimaryMetric.textContent = `Total Solved`;
        thBreakdownMetric.textContent = activePlatform === "leetcode" ? "Easy / Med / Hard" : (activePlatform === "codeforces" ? "Rating Status" : "Division / Stars");
    }
}

/**
 * Updates Stats Ribbon for the active platform
 */
function updateStatsRibbon() {
    if (!currentPlatformData.length) {
        statPrimaryMetric.textContent = "--";
        statActiveCoders.textContent = "0";
        statTopDelta.textContent = "--";
        statRankOne.textContent = "N/A";
        return;
    }

    statActiveCoders.textContent = currentPlatformData.length.toString();

    let totalProblems = currentPlatformData.reduce((acc, c) => acc + (c.total_solved || 0), 0);
    let maxDelta = 0;
    let rankOne = currentPlatformData[0]?.display_name || "N/A";

    currentPlatformData.forEach(stu => {
        const delta = stu.recent_contest?.rating_delta || 0;
        if (delta > maxDelta) maxDelta = delta;
    });

    ribbonLabel1.textContent = `${getPlatformDisplayName(activePlatform)} Problems Solved`;
    statPrimaryMetric.textContent = totalProblems.toLocaleString();
    statTopDelta.textContent = `+${maxDelta} pts`;
    statRankOne.textContent = rankOne;
}

/**
 * Filters & Sorts active platform records
 */
function getFilteredSortedPlatformData() {
    let list = currentPlatformData.filter(stu => {
        const name = (stu.display_name || "").toLowerCase();
        const collegeId = (stu.college_id || "").toLowerCase();
        const handle = (stu.handle || "").toLowerCase();

        const matchesSearch = !searchQuery || name.includes(searchQuery) || collegeId.includes(searchQuery) || handle.includes(searchQuery);
        const matchesBranch = selectedBranch === "ALL" || stu.branch === selectedBranch;
        const matchesYear = selectedYear === "ALL" || stu.year === selectedYear;

        return matchesSearch && matchesBranch && matchesYear;
    });

    // Sub-tab sorting
    if (activeSubTab === "rating") {
        list.sort((a, b) => {
            if (b.rating !== a.rating) return (b.rating || 0) - (a.rating || 0);
            return (b.recent_contest?.rating_delta || 0) - (a.recent_contest?.rating_delta || 0);
        });
    } else {
        list.sort((a, b) => (b.total_solved || 0) - (a.total_solved || 0));
    }

    return list;
}

/**
 * Renders the Table Rows for the Active Platform
 */
function renderLeaderboard() {
    const students = getFilteredSortedPlatformData();

    if (students.length === 0) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="7" style="text-align: center; padding: 3rem; color: var(--text-muted);">
                    No students found for ${getPlatformDisplayName(activePlatform)} matching the current filters.
                </td>
            </tr>
        `;
        return;
    }

    let rowsHtml = "";

    students.forEach((stu, idx) => {
        const rank = idx + 1;
        let rankBadgeClass = "rank-standard";
        let rankIcon = rank;

        if (rank === 1) { rankBadgeClass = "rank-1"; rankIcon = "🥇 1"; }
        else if (rank === 2) { rankBadgeClass = "rank-2"; rankIcon = "🥈 2"; }
        else if (rank === 3) { rankBadgeClass = "rank-3"; rankIcon = "🥉 3"; }

        // Primary Metric Display
        let primaryMetricHtml = "";
        let scoreClass = `score-${activePlatform}`;

        if (activeSubTab === "rating") {
            primaryMetricHtml = `
                <div class="score-highlight ${scoreClass}">${stu.rating || 'unrated'}</div>
                <small style="color: var(--text-dim);">${stu.stats?.global_rank ? `Global #${stu.stats.global_rank}` : 'Rating'}</small>
            `;
        } else {
            primaryMetricHtml = `
                <div class="score-highlight ${scoreClass}">${stu.total_solved || 0}</div>
                <small style="color: var(--text-dim);">Problems Solved</small>
            `;
        }

        // Platform Handle Link
        const handle = stu.handle || "N/A";
        let handleUrl = "#";
        if (activePlatform === "leetcode") handleUrl = `https://leetcode.com/${handle}/`;
        else if (activePlatform === "codeforces") handleUrl = `https://codeforces.com/profile/${handle}`;
        else if (activePlatform === "codechef") handleUrl = `https://www.codechef.com/users/${handle}`;

        const handleHtml = `
            <a href="${handleUrl}" target="_blank" class="platform-handle-link link-${activePlatform}" title="Open ${handle} on ${activePlatform}">
                <span>${handle}</span> ↗
            </a>
        `;

        // Platform-Specific Breakdown
        let breakdownHtml = "";
        if (activePlatform === "leetcode") {
            const stats = stu.stats || {};
            breakdownHtml = `
                <div class="lc-breakdown-tags">
                    <span class="tag-easy">E: ${stats.easy_solved || 0}</span>
                    <span class="tag-medium">M: ${stats.medium_solved || 0}</span>
                    <span class="tag-hard">H: ${stats.hard_solved || 0}</span>
                </div>
            `;
        } else if (activePlatform === "codeforces") {
            const title = stu.stats?.rank_title || 'unrated';
            breakdownHtml = `
                <span class="cf-title-tag">${title.toUpperCase()}</span>
                <small style="display:block; color: var(--text-dim); margin-top:2px;">Max: ${stu.stats?.max_rating || stu.rating || 0}</small>
            `;
        } else if (activePlatform === "codechef") {
            const stars = stu.stats?.stars || 0;
            const starStr = stars > 0 ? "★".repeat(Math.min(stars, 7)) : "Unrated";
            breakdownHtml = `
                <span class="cc-stars-tag">${starStr}</span>
                <small style="display:block; color: var(--text-dim); margin-top:2px;">${stars} Star Coder</small>
            `;
        }

        // Recent Contest
        const recent = stu.recent_contest;
        let recentContestHtml = `<span style="color: var(--text-dim);">No contest history</span>`;
        if (recent && recent.contest_name && recent.contest_name !== "No recent contest") {
            const delta = recent.rating_delta || 0;
            const deltaClass = delta > 0 ? "delta-positive" : (delta < 0 ? "delta-negative" : "delta-neutral");
            const sign = delta > 0 ? "+" : "";

            recentContestHtml = `
                <div>
                    <strong style="color: #fff; font-size: 0.85rem; display:block;">${recent.contest_name}</strong>
                    <div style="display:flex; align-items:center; gap: 0.4rem; margin-top: 2px;">
                        <span class="delta-pill ${deltaClass}">${sign}${delta}</span>
                        <small style="color: var(--text-dim);">Rank #${recent.rank || '--'}</small>
                    </div>
                </div>
            `;
        }

        rowsHtml += `
            <tr>
                <td class="th-rank">
                    <span class="rank-badge ${rankBadgeClass}">${rankIcon}</span>
                </td>
                <td class="th-student">
                    <div class="student-cell">
                        <img src="https://api.dicebear.com/7.x/bottts/svg?seed=${stu.display_name}" class="student-avatar" alt="${stu.display_name}">
                        <div class="student-name-group">
                            <strong>${stu.display_name}</strong>
                            <small>${stu.college_id || 'Campus Student'}</small>
                        </div>
                    </div>
                </td>
                <td class="th-branch">
                    <span class="badge badge-branch">${stu.branch || 'CSE'}</span>
                    <small style="color: var(--text-dim); margin-left: 4px;">${stu.year || '3rd'} Yr</small>
                </td>
                <td class="th-handle">
                    ${handleHtml}
                </td>
                <td class="th-score">
                    ${primaryMetricHtml}
                </td>
                <td class="th-breakdown">
                    ${breakdownHtml}
                </td>
                <td class="th-recent">
                    ${recentContestHtml}
                </td>
            </tr>
        `;
    });

    tableBody.innerHTML = rowsHtml;
}

function getPlatformDisplayName(p) {
    if (p === "leetcode") return "LeetCode";
    if (p === "codeforces") return "Codeforces";
    if (p === "codechef") return "CodeChef";
    return p;
}

document.addEventListener("DOMContentLoaded", setupPlatformLeaderboards);
