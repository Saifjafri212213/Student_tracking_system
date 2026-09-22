// ==========================================================================
// Doubt Resolution Forum: Real-time Q&A, Code Highlighting, Upvotes & Solutions
// ==========================================================================
import { 
    db, 
    isMockMode, 
    collection, 
    doc, 
    addDoc, 
    updateDoc, 
    onSnapshot, 
    increment,
    MOCK_DOUBTS 
} from "./firebase-config.js";
import { currentUser } from "./auth.js";

// State
let allDoubts = [...MOCK_DOUBTS];
let selectedTag = "ALL";
let onlyUnresolved = false;
let currentDoubtThread = null;
let activeTags = ["LeetCode", "Dynamic Programming"];

// DOM Elements
const doubtsFeedContainer = document.getElementById("doubts-feed-container");
const tagButtons = document.querySelectorAll(".tag-chip");
const toggleUnresolved = document.getElementById("toggle-unresolved-only");

// Ask Doubt Split-Screen Elements
const btnAskDoubt = document.getElementById("btn-ask-doubt");
const modalAskDoubt = document.getElementById("modal-ask-doubt");
const btnCloseAskModal = document.getElementById("btn-close-ask-modal");
const btnCancelAsk = document.getElementById("btn-cancel-ask");
const formAskDoubt = document.getElementById("form-ask-doubt");
const inputDoubtTitle = document.getElementById("doubt-title");
const inputDoubtTag = document.getElementById("doubt-tag-input");
const tagChipsWrapper = document.getElementById("tag-chips-wrapper");
const textareaDoubtDesc = document.getElementById("doubt-description");
const renderedPostPreview = document.getElementById("rendered-post-preview");
const previewSyncStatus = document.getElementById("preview-sync-status");
const btnSubmitDoubt = document.getElementById("btn-submit-doubt");
const askBtnSpinner = document.getElementById("ask-btn-spinner");
const askBtnText = document.getElementById("ask-btn-text");

// View Toggle Buttons
const btnViewEditor = document.getElementById("btn-view-editor");
const btnViewSplit = document.getElementById("btn-view-split");
const btnViewPreview = document.getElementById("btn-view-preview");
const paneEditor = document.getElementById("pane-editor");
const panePreview = document.getElementById("pane-preview");
const splitLayoutContainer = document.getElementById("split-layout-container");

// View Doubt Thread Modal Elements
const modalViewDoubt = document.getElementById("modal-view-doubt");
const btnCloseViewModal = document.getElementById("btn-close-view-modal");
const modalDoubtStatus = document.getElementById("modal-doubt-status");
const modalDoubtTitle = document.getElementById("modal-doubt-title");
const modalDoubtAuthorAvatar = document.getElementById("modal-doubt-author-avatar");
const modalDoubtAuthorName = document.getElementById("modal-doubt-author-name");
const modalDoubtTime = document.getElementById("modal-doubt-time");
const modalDoubtTags = document.getElementById("modal-doubt-tags");
const modalDoubtDesc = document.getElementById("modal-doubt-desc");
const modalDoubtCodeWrapper = document.getElementById("modal-doubt-code-wrapper");
const modalDoubtCode = document.getElementById("modal-doubt-code");
const modalDoubtCodeLang = document.getElementById("modal-doubt-code-lang");
const btnCopyQuestionCode = document.getElementById("btn-copy-question-code");
const btnUpvoteQuestion = document.getElementById("btn-upvote-question");
const modalDoubtUpvotesCount = document.getElementById("modal-doubt-upvotes-count");
const modalAnswersCount = document.getElementById("modal-answers-count");
const modalAnswersList = document.getElementById("modal-answers-list");
const formPostAnswer = document.getElementById("form-post-answer");

/**
 * Configure Marked.js with Prism syntax highlighting
 */
function configureMarkdownParser() {
    if (window.marked) {
        marked.setOptions({
            gfm: true,
            breaks: true,
            headerIds: false,
            highlight: function (code, lang) {
                if (window.Prism) {
                    const validLang = Prism.languages[lang] ? lang : 'cpp';
                    return Prism.highlight(code, Prism.languages[validLang], validLang);
                }
                return code;
            }
        });
    }
}

/**
 * Render Dynamic Tag Chips
 */
function renderTagChips() {
    if (!tagChipsWrapper) return;
    tagChipsWrapper.innerHTML = activeTags.map((tag, idx) => `
        <span class="tag-chip-item">
            #${escapeHtml(tag)}
            <button type="button" class="tag-remove-btn" data-index="${idx}" title="Remove tag">&times;</button>
        </span>
    `).join("");

    tagChipsWrapper.querySelectorAll(".tag-remove-btn").forEach(btn => {
        btn.addEventListener("click", (e) => {
            e.stopPropagation();
            const index = parseInt(btn.getAttribute("data-index"), 10);
            activeTags.splice(index, 1);
            renderTagChips();
            updateLivePreview();
        });
    });
}

/**
 * Add a new tag to the question
 */
function addTag(rawTag) {
    const cleanTag = rawTag.replace(/[#,\s]/g, "").trim();
    if (!cleanTag) return;
    if (activeTags.length >= 5) {
        alert("Maximum 5 tags allowed per question.");
        return;
    }
    if (!activeTags.some(t => t.toLowerCase() === cleanTag.toLowerCase())) {
        activeTags.push(cleanTag);
        renderTagChips();
        updateLivePreview();
    }
    if (inputDoubtTag) inputDoubtTag.value = "";
}

/**
 * Updates the Live HTML Preview Pane in Real-Time
 */
function updateLivePreview() {
    if (!renderedPostPreview) return;

    const title = inputDoubtTitle?.value.trim() || "";
    const markdownBody = textareaDoubtDesc?.value.trim() || "";

    if (!title && !markdownBody && activeTags.length === 0) {
        renderedPostPreview.innerHTML = `
            <div class="preview-empty-state">
                <div class="empty-icon">📝</div>
                <h3>Live Preview Area</h3>
                <p>Start typing your title, tags, and Markdown in the editor. Your rendered question with formatted code blocks will appear here automatically.</p>
            </div>
        `;
        if (previewSyncStatus) previewSyncStatus.textContent = "🟢 Ready";
        return;
    }

    const authorName = currentUser?.displayName || currentUser?.email?.split("@")[0] || "Student Coder";
    const authorAvatar = `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(authorName)}`;

    let parsedHtml = "";
    if (window.marked && markdownBody) {
        try {
            parsedHtml = marked.parse(markdownBody);
        } catch (e) {
            parsedHtml = `<p>${escapeHtml(markdownBody)}</p>`;
        }
    } else if (markdownBody) {
        parsedHtml = `<p>${escapeHtml(markdownBody)}</p>`;
    }

    const tagsHtml = activeTags.map(t => `<span class="tag-mini">#${escapeHtml(t)}</span>`).join(" ");

    renderedPostPreview.innerHTML = `
        <h1 class="preview-rendered-title">${escapeHtml(title) || '<span style="color:var(--text-muted); font-style:italic;">Untitled Question</span>'}</h1>
        
        <div class="preview-rendered-meta">
            <div class="author-meta">
                <img src="${authorAvatar}" class="avatar-xs" alt="">
                <strong style="color:#ffffff;">${escapeHtml(authorName)}</strong>
                <span class="meta-dot">&bull;</span>
                <span class="meta-time">Just now (Draft)</span>
            </div>
            <div class="preview-rendered-tags">${tagsHtml}</div>
        </div>

        <div class="preview-rendered-body">
            ${parsedHtml || '<p style="color:var(--text-muted); font-style:italic;">No description provided yet...</p>'}
        </div>
    `;

    // Highlight any rendered code blocks with Prism
    if (window.Prism) {
        renderedPostPreview.querySelectorAll("pre code").forEach(el => {
            Prism.highlightElement(el);
        });
    }

    if (previewSyncStatus) previewSyncStatus.textContent = "🟢 In Sync";
}

/**
 * Handle Markdown Toolbar Actions
 */
function handleToolbarAction(action) {
    if (!textareaDoubtDesc) return;
    const textarea = textareaDoubtDesc;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selected = textarea.value.substring(start, end);
    let replacement = "";
    let cursorOffset = 0;

    switch (action) {
        case "bold":
            replacement = `**${selected || 'bold text'}**`;
            cursorOffset = selected ? replacement.length : 2;
            break;
        case "italic":
            replacement = `*${selected || 'italic text'}*`;
            cursorOffset = selected ? replacement.length : 1;
            break;
        case "heading":
            replacement = `\n### ${selected || 'Heading'}\n`;
            cursorOffset = replacement.length;
            break;
        case "code-inline":
            replacement = `\`${selected || 'code'}\``;
            cursorOffset = selected ? replacement.length : 1;
            break;
        case "code-cpp":
            replacement = `\n\`\`\`cpp\n${selected || '// C++ (GCC 17)\n#include <bits/stdc++.h>\nusing namespace std;\n\nint main() {\n    // your logic here\n    return 0;\n}'}\n\`\`\`\n`;
            cursorOffset = replacement.length;
            break;
        case "code-python":
            replacement = `\n\`\`\`python\n${selected || '# Python 3 Solution\ndef solve():\n    pass\n'}\n\`\`\`\n`;
            cursorOffset = replacement.length;
            break;
        case "code-java":
            replacement = `\n\`\`\`java\n${selected || '// Java Solution\npublic class Solution {\n    public static void main(String[] args) {\n    }\n}'}\n\`\`\`\n`;
            cursorOffset = replacement.length;
            break;
        case "quote":
            replacement = `\n> ${selected || 'Quoted problem statement or constraint...'}\n`;
            cursorOffset = replacement.length;
            break;
        case "ul":
            replacement = `\n- ${selected || 'Item 1'}\n- Item 2\n- Item 3\n`;
            cursorOffset = replacement.length;
            break;
        case "ol":
            replacement = `\n1. ${selected || 'Step 1'}\n2. Step 2\n3. Step 3\n`;
            cursorOffset = replacement.length;
            break;
        case "table":
            replacement = `\n| Input | Expected Output | Actual Output |\n| :--- | :--- | :--- |\n| [1, 2, 3] | 6 | TLE |\n`;
            cursorOffset = replacement.length;
            break;
        default:
            return;
    }

    textarea.setRangeText(replacement, start, end, 'select');
    textarea.focus();
    updateLivePreview();
}

function setupForum() {
    configureMarkdownParser();
    renderTagChips();

    // 1. Tag Filtering for Forum Feed
    tagButtons.forEach(btn => {
        btn.addEventListener("click", () => {
            tagButtons.forEach(b => b.classList.remove("active"));
            btn.classList.add("active");
            selectedTag = btn.getAttribute("data-tag");
            renderDoubtsFeed();
        });
    });

    toggleUnresolved.addEventListener("change", (e) => {
        onlyUnresolved = e.target.checked;
        renderDoubtsFeed();
    });

    // 2. Open / Close Ask Modal
    btnAskDoubt.addEventListener("click", () => {
        modalAskDoubt.classList.remove("hidden");
        updateLivePreview();
        inputDoubtTitle.focus();
    });

    btnCloseAskModal.addEventListener("click", () => modalAskDoubt.classList.add("hidden"));
    btnCancelAsk.addEventListener("click", () => modalAskDoubt.classList.add("hidden"));
    btnCloseViewModal.addEventListener("click", () => modalViewDoubt.classList.add("hidden"));

    // 3. Layout Mode Switching (Write / Split / Preview)
    if (btnViewEditor && btnViewSplit && btnViewPreview) {
        btnViewEditor.addEventListener("click", () => {
            btnViewEditor.classList.add("active");
            btnViewSplit.classList.remove("active");
            btnViewPreview.classList.remove("active");
            paneEditor.style.display = "flex";
            panePreview.style.display = "none";
            splitLayoutContainer.style.gridTemplateColumns = "1fr";
        });

        btnViewSplit.addEventListener("click", () => {
            btnViewSplit.classList.add("active");
            btnViewEditor.classList.remove("active");
            btnViewPreview.classList.remove("active");
            paneEditor.style.display = "flex";
            panePreview.style.display = "flex";
            splitLayoutContainer.style.gridTemplateColumns = "1fr 1fr";
            updateLivePreview();
        });

        btnViewPreview.addEventListener("click", () => {
            btnViewPreview.classList.add("active");
            btnViewEditor.classList.remove("active");
            btnViewSplit.classList.remove("active");
            paneEditor.style.display = "none";
            panePreview.style.display = "flex";
            splitLayoutContainer.style.gridTemplateColumns = "1fr";
            updateLivePreview();
        });
    }

    // 4. Tag Input Listeners
    if (inputDoubtTag) {
        inputDoubtTag.addEventListener("keydown", (e) => {
            if (e.key === "Enter" || e.key === ",") {
                e.preventDefault();
                addTag(inputDoubtTag.value);
            }
        });
    }

    // Suggestion Tag Buttons
    document.querySelectorAll(".btn-suggest-tag").forEach(btn => {
        btn.addEventListener("click", () => {
            const tag = btn.getAttribute("data-tag");
            addTag(tag);
        });
    });

    // 5. Live Markdown Preview Listeners
    if (inputDoubtTitle) inputDoubtTitle.addEventListener("input", updateLivePreview);
    if (textareaDoubtDesc) {
        textareaDoubtDesc.addEventListener("input", updateLivePreview);
        
        // Tab key support in textarea
        textareaDoubtDesc.addEventListener("keydown", (e) => {
            if (e.key === "Tab") {
                e.preventDefault();
                const start = textareaDoubtDesc.selectionStart;
                const end = textareaDoubtDesc.selectionEnd;
                textareaDoubtDesc.setRangeText("    ", start, end, "end");
                updateLivePreview();
            }
            // Ctrl/Cmd + Enter to Submit
            if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
                formAskDoubt.requestSubmit();
            }
        });
    }

    // 6. Toolbar Buttons
    document.querySelectorAll(".btn-toolbar").forEach(btn => {
        btn.addEventListener("click", () => {
            const action = btn.getAttribute("data-action");
            handleToolbarAction(action);
        });
    });

    // 7. Form Submission with Firebase Firestore Hook
    formAskDoubt.addEventListener("submit", async (e) => {
        e.preventDefault();

        const title = inputDoubtTitle.value.trim();
        const markdownBody = textareaDoubtDesc.value.trim();

        if (title.length < 5) {
            alert("Please provide a descriptive title (at least 5 characters).");
            inputDoubtTitle.focus();
            return;
        }

        if (activeTags.length === 0) {
            alert("Please add at least one topic tag (e.g., LeetCode, DP, C++).");
            inputDoubtTag.focus();
            return;
        }

        if (markdownBody.length < 10) {
            alert("Please describe your question or issue in detail.");
            textareaDoubtDesc.focus();
            return;
        }

        // Start Loading State on Button
        btnSubmitDoubt.disabled = true;
        askBtnSpinner.classList.remove("hidden");
        askBtnText.textContent = "Publishing Question...";

        const authorName = currentUser?.displayName || currentUser?.email?.split("@")[0] || "Student Coder";
        const authorAvatar = `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(authorName)}`;

        const newDoubt = {
            title: title,
            tags: [...activeTags],
            description: markdownBody, // Body content
            markdown_body: markdownBody,
            author_id: currentUser ? currentUser.uid : "guest_user",
            author_name: authorName,
            author_avatar: authorAvatar,
            upvotes_count: 0,
            is_resolved: false,
            answers: [],
            created_at: Date.now()
        };

        try {
            if (!isMockMode && db) {
                // Save to Firestore 'doubts' collection
                const docRef = await addDoc(collection(db, "doubts"), newDoubt);
                newDoubt.id = docRef.id;
            } else {
                newDoubt.id = "doubt_" + Date.now();
                allDoubts.unshift(newDoubt);
            }

            // Reset Form and Modal
            formAskDoubt.reset();
            activeTags = ["LeetCode", "Dynamic Programming"];
            renderTagChips();
            modalAskDoubt.classList.add("hidden");
            renderDoubtsFeed();

            alert("🚀 Question published successfully to the Doubt Resolution Forum!");
        } catch (err) {
            console.error("Firestore submission error:", err);
            alert("Failed to submit doubt: " + err.message);
        } finally {
            // Restore Button State
            btnSubmitDoubt.disabled = false;
            askBtnSpinner.classList.add("hidden");
            askBtnText.textContent = "Post Question 🚀";
        }
    });

    btnUpvoteQuestion.addEventListener("click", async () => {
        if (!currentDoubtThread) return;
        currentDoubtThread.upvotes_count = (currentDoubtThread.upvotes_count || 0) + 1;
        modalDoubtUpvotesCount.textContent = currentDoubtThread.upvotes_count;
        renderDoubtsFeed();

        if (!isMockMode && db) {
            try {
                await updateDoc(doc(db, "doubts", currentDoubtThread.id), {
                    upvotes_count: increment(1)
                });
            } catch (e) {
                console.error("Upvote error:", e);
            }
        }
    });

    formPostAnswer.addEventListener("submit", async (e) => {
        e.preventDefault();
        if (!currentDoubtThread) return;

        const content = document.getElementById("answer-text").value.trim();
        const codeLang = document.getElementById("answer-code-lang").value;
        const code = document.getElementById("answer-code").value.trim();

        const newAnswer = {
            id: "ans_" + Date.now(),
            author_id: currentUser ? currentUser.uid : "ans_author",
            author_name: currentUser ? (currentUser.displayName || "Peer Mentor") : "Campus Peer",
            author_avatar: `https://api.dicebear.com/7.x/bottts/svg?seed=${currentUser?.displayName || 'Peer'}`,
            content,
            code_lang: codeLang,
            code,
            upvotes_count: 1,
            is_accepted: false,
            created_at: Date.now()
        };

        if (!currentDoubtThread.answers) {
            currentDoubtThread.answers = [];
        }
        currentDoubtThread.answers.push(newAnswer);
        formPostAnswer.reset();
        renderThreadDetails(currentDoubtThread);
        renderDoubtsFeed();

        if (!isMockMode && db) {
            try {
                await addDoc(collection(db, "doubts", currentDoubtThread.id, "answers"), newAnswer);
            } catch (e) {
                console.error("Answer submission error:", e);
            }
        }
    });

    if (!isMockMode && db) {
        onSnapshot(collection(db, "doubts"), (snapshot) => {
            const doubtsList = [];
            snapshot.forEach(doc => {
                const data = doc.data();
                data.id = doc.id;
                doubtsList.push(data);
            });
            if (doubtsList.length > 0) {
                allDoubts = doubtsList;
                renderDoubtsFeed();
            }
        });
    }

    renderDoubtsFeed();
}

function renderDoubtsFeed() {
    const filtered = allDoubts.filter(d => {
        const matchesTag = selectedTag === "ALL" || (d.tags && d.tags.some(t => t.toLowerCase() === selectedTag.toLowerCase()));
        const matchesResolved = !onlyUnresolved || !d.is_resolved;
        return matchesTag && matchesResolved;
    });

    if (filtered.length === 0) {
        doubtsFeedContainer.innerHTML = `
            <div class="glass-panel" style="padding: 3rem; text-align: center; color: var(--text-muted);">
                <span style="font-size: 2.5rem; display:block; margin-bottom: 0.5rem;">💡</span>
                <h3>No doubts found in this category</h3>
                <p>Be the first student to ask a question!</p>
            </div>
        `;
        return;
    }

    let feedHtml = "";
    filtered.forEach(doubt => {
        const answersCount = (doubt.answers || []).length;
        const statusBadge = doubt.is_resolved 
            ? `<span class="status-badge-resolved">✓ Resolved</span>` 
            : `<span class="status-badge-unresolved">● Open</span>`;

        const tagsHtml = (doubt.tags || []).map(t => `<span class="tag-mini">#${t}</span>`).join("");

        feedHtml += `
            <div class="doubt-card" data-doubt-id="${doubt.id}">
                <div class="doubt-vote-box">
                    <span class="vote-num">${doubt.upvotes_count || 0}</span>
                    <span class="vote-label">Votes</span>
                </div>
                <div class="doubt-content-box">
                    <div class="doubt-title-row">
                        <h3 class="doubt-card-title">${escapeHtml(doubt.title)}</h3>
                        ${statusBadge}
                    </div>
                    <p class="doubt-card-desc">${escapeHtml(doubt.description)}</p>
                    
                    <div class="doubt-meta-footer">
                        <div class="doubt-author-info">
                            <img src="${doubt.author_avatar || 'https://api.dicebear.com/7.x/bottts/svg?seed=Coder'}" class="avatar-xs" alt="">
                            <span>${escapeHtml(doubt.author_name || 'Student')}</span>
                            <span style="color: var(--text-dim);">&bull;</span>
                            <span style="color: var(--text-dim);">${formatTimeAgo(doubt.created_at)}</span>
                        </div>
                        <div class="doubt-tags-row">
                            ${tagsHtml}
                        </div>
                        <div style="color: var(--accent-cyan); font-weight: 600;">
                            💬 ${answersCount} ${answersCount === 1 ? 'Solution' : 'Solutions'}
                        </div>
                    </div>
                </div>
            </div>
        `;
    });

    doubtsFeedContainer.innerHTML = feedHtml;

    document.querySelectorAll(".doubt-card").forEach(card => {
        card.addEventListener("click", () => {
            const doubtId = card.getAttribute("data-doubt-id");
            const doubt = allDoubts.find(d => d.id === doubtId);
            if (doubt) {
                openDoubtThread(doubt);
            }
        });
    });
}

function openDoubtThread(doubt) {
    currentDoubtThread = doubt;
    renderThreadDetails(doubt);
    modalViewDoubt.classList.remove("hidden");
}

function renderThreadDetails(doubt) {
    modalDoubtTitle.textContent = doubt.title;
    modalDoubtAuthorName.textContent = doubt.author_name;
    modalDoubtAuthorAvatar.src = doubt.author_avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${doubt.author_name}`;
    modalDoubtTime.textContent = formatTimeAgo(doubt.created_at);
    modalDoubtDesc.textContent = doubt.description;
    modalDoubtUpvotesCount.textContent = doubt.upvotes_count || 0;

    if (doubt.is_resolved) {
        modalDoubtStatus.className = "status-badge-resolved";
        modalDoubtStatus.textContent = "✓ Resolved";
    } else {
        modalDoubtStatus.className = "status-badge-unresolved";
        modalDoubtStatus.textContent = "● Open";
    }

    modalDoubtTags.innerHTML = (doubt.tags || []).map(t => `<span class="tag-mini">#${t}</span>`).join(" ");

    if (doubt.code && doubt.code.trim()) {
        modalDoubtCodeWrapper.classList.remove("hidden");
        modalDoubtCodeLang.textContent = (doubt.code_lang || "code").toUpperCase();
        modalDoubtCode.className = `language-${doubt.code_lang || 'cpp'}`;
        modalDoubtCode.textContent = doubt.code;
        if (window.Prism) {
            Prism.highlightElement(modalDoubtCode);
        }
    } else {
        modalDoubtCodeWrapper.classList.add("hidden");
    }

    const answers = doubt.answers || [];
    modalAnswersCount.textContent = answers.length;

    let answersHtml = "";
    answers.forEach((ans) => {
        const isAccepted = ans.is_accepted;
        const acceptedBadge = isAccepted ? `<div class="accepted-badge-ribbon">✓ Accepted Solution</div>` : "";
        
        let codeSnippetHtml = "";
        if (ans.code && ans.code.trim()) {
            codeSnippetHtml = `
                <div class="code-block-wrapper" style="margin: 0.75rem 0;">
                    <div class="code-block-header">
                        <span class="code-lang-label">${(ans.code_lang || 'code').toUpperCase()}</span>
                    </div>
                    <pre><code class="language-${ans.code_lang || 'cpp'}">${escapeHtml(ans.code)}</code></pre>
                </div>
            `;
        }

        answersHtml += `
            <div class="answer-card ${isAccepted ? 'accepted-solution' : ''}">
                ${acceptedBadge}
                <div class="author-meta" style="margin-bottom: 0.75rem;">
                    <img src="${ans.author_avatar || 'https://api.dicebear.com/7.x/bottts/svg?seed=Peer'}" class="avatar-sm" alt="">
                    <strong>${escapeHtml(ans.author_name)}</strong>
                    <span class="meta-dot">&bull;</span>
                    <span class="meta-time">${formatTimeAgo(ans.created_at)}</span>
                </div>
                <p style="color: #e2e8f0; font-size: 0.95rem; line-height: 1.6;">${escapeHtml(ans.content)}</p>
                ${codeSnippetHtml}
                
                <div style="display: flex; align-items: center; justify-content: space-between; margin-top: 1rem;">
                    <button class="btn btn-upvote btn-answer-upvote" data-ans-id="${ans.id}">
                        ▲ Upvote (${ans.upvotes_count || 0})
                    </button>
                    ${!doubt.is_resolved ? `
                        <button class="btn btn-mark-accepted" data-ans-id="${ans.id}">
                            ✓ Mark as Accepted Solution
                        </button>
                    ` : ''}
                </div>
            </div>
        `;
    });

    if (answers.length === 0) {
        answersHtml = `<p style="color: var(--text-dim); text-align: center; padding: 1.5rem;">No solutions posted yet. Be the first to answer!</p>`;
    }

    modalAnswersList.innerHTML = answersHtml;

    if (window.Prism) {
        modalAnswersList.querySelectorAll("pre code").forEach(el => Prism.highlightElement(el));
    }

    modalAnswersList.querySelectorAll(".btn-answer-upvote").forEach(btn => {
        btn.addEventListener("click", () => {
            const ansId = btn.getAttribute("data-ans-id");
            const answer = answers.find(a => a.id === ansId);
            if (answer) {
                answer.upvotes_count = (answer.upvotes_count || 0) + 1;
                renderThreadDetails(doubt);
            }
        });
    });

    modalAnswersList.querySelectorAll(".btn-mark-accepted").forEach(btn => {
        btn.addEventListener("click", async () => {
            const ansId = btn.getAttribute("data-ans-id");
            answers.forEach(a => a.is_accepted = (a.id === ansId));
            doubt.is_resolved = true;
            renderThreadDetails(doubt);
            renderDoubtsFeed();

            if (!isMockMode && db) {
                try {
                    await updateDoc(doc(db, "doubts", doubt.id), { is_resolved: true });
                } catch (e) {
                    console.error("Accept solution error:", e);
                }
            }
        });
    });
}

function escapeHtml(text) {
    if (!text) return "";
    return text.replace(/&/g, "&amp;")
               .replace(/</g, "&lt;")
               .replace(/>/g, "&gt;")
               .replace(/"/g, "&quot;")
               .replace(/'/g, "&#039;");
}

function formatTimeAgo(timestamp) {
    if (!timestamp) return "just now";
    const diffSeconds = Math.floor((Date.now() - timestamp) / 1000);
    if (diffSeconds < 60) return `${diffSeconds}s ago`;
    const diffMinutes = Math.floor(diffSeconds / 60);
    if (diffMinutes < 60) return `${diffMinutes}m ago`;
    const diffHours = Math.floor(diffMinutes / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays}d ago`;
}

document.addEventListener("DOMContentLoaded", setupForum);
