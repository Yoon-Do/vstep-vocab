const THEME_ORDER = [
  "grammar", "linking-words",
  "environment", "education", "technology", "health", "community",
  "work", "city", "transport", "people", "travel",
  "countryside", "food", "sports", "hobbies",
  "weather", "foreign-language", "accommodation", "art"
];

const allThemes = (window.VSTEP_VOCAB || []).slice().sort((a, b) => {
  const ai = THEME_ORDER.indexOf(a.id);
  const bi = THEME_ORDER.indexOf(b.id);
  return (ai === -1 ? 999 : ai) - (bi === -1 ? 999 : bi);
});

const HIGH_VALUE_TERMS = new Set([
  "infrastructure", "destination", "public transport", "reduce air pollution from vehicle emissions",
  "high cost of living", "economic hub", "career opportunity", "higher-paying job",
  "essential services", "constructive feedback", "specialized knowledge", "tuition fee",
  "gain access to more resources", "find information unavailable in vietnamese", "discover different cultures",
  "communicate with people from different countries", "global warming", "greenhouse gas emissions",
  "biodiversity", "climate change", "environmental degradation", "renewable energy",
  "carbon emissions", "deforestation", "wildlife habitat", "privacy concern", "personal data",
  "limit screen time", "protect personal information", "study abroad", "adapt to a new culture",
  "supportive coworkers", "promotion", "deadline", "problem-solving", "critical thinking",
  "community service", "discrimination", "raise awareness", "promote equality", "historical site",
  "landmark", "nightlife", "positive mindset", "resilient and persistent"
]);

const WRITING_TERMS = new Set([
  "infrastructure", "emission", "noise pollution", "water pollution", "high cost of living",
  "economic hub", "career opportunity", "obesity", "diabetes", "cholesterol", "nutrition",
  "privacy concern", "personal data", "unemployment rate", "tuition fee", "bachelor's degree",
  "master's degree", "specialized knowledge", "constructive feedback", "resource", "global",
  "biodiversity", "climate change", "global warming", "greenhouse gas emissions", "industrial waste",
  "environmental degradation", "fossil fuels", "carbon emissions", "renewable energy", "solar power",
  "wind power", "deforestation", "wildlife habitat", "community service", "discrimination",
  "inequality", "poverty", "homelessness", "awareness", "supportive coworkers", "promotion",
  "workload", "deadline", "critical thinking", "problem-solving"
]);

const SPEAKING_TERMS = new Set([
  "public transport", "rush hour", "parking", "offer convenience", "get you to your destination",
  "stay connected", "keep in touch", "communicate instantly", "make new friends", "travel abroad confidently",
  "ask for directions easily", "visit a doctor", "drink more water", "get enough sleep", "go on a diet",
  "try a local dish", "recommend a place to visit", "sunbathe", "go camping", "historical site",
  "check the forecast", "bring an umbrella", "join a team", "practice regularly", "stay in shape",
  "unwind after a long day", "share experiences with others", "work overtime", "be responsible for",
  "communicate with partners", "dress casually", "have a sunny smile", "entertain guests", "sleep peacefully",
  "watch a live concert", "support local artists", "raise awareness", "provide support", "set a good example"
]);

const storage = {
  get(key, fallback) {
    try {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : fallback;
    } catch {
      return fallback;
    }
  },
  set(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
  }
};

const state = {
  activeTheme: allThemes[0]?.id || null,
  search: "",
  filter: "all",
  view: "cards",
  mastered: new Set(storage.get("vstep-mastered", [])),
  favorites: new Set(storage.get("vstep-favorites", [])),
  shuffledOrders: {},
  quizMode: storage.get("vstep-quiz-mode", "en-vi"),
  wrongCounts: storage.get("vstep-wrong", {}),
  quiz: {
    index: 0,
    score: 0,
    items: [],
    wrongKeys: []
  }
};

let _quizKeyHandler = null;

const els = {
  themeList: document.getElementById("themeList"),
  themeCount: document.getElementById("themeCount"),
  wordCount: document.getElementById("wordCount"),
  masteredCount: document.getElementById("masteredCount"),
  heroTitle: document.getElementById("heroTitle"),
  heroDesc: document.getElementById("heroDesc"),
  cardsView: document.getElementById("cardsView"),
  listView: document.getElementById("listView"),
  quizView: document.getElementById("quizView"),
  summaryBar: document.getElementById("summaryBar"),
  searchInput: document.getElementById("searchInput"),
  shuffleBtn: document.getElementById("shuffleBtn"),
  toggleQuizBtn: document.getElementById("toggleQuizBtn"),
  filterChips: [...document.querySelectorAll("#filterChips .chip")],
  viewSwitch: [...document.querySelectorAll(".view-switch .seg")]
};

function keyFor(word) {
  return `${word.themeId}::${word.en.toLowerCase()}`;
}

function shuffle(arr) {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function isStudyBoosterTheme(word) {
  return ["grammar", "linking-words"].includes(word.themeId);
}

function scoreWord(word) {
  const text = word.en.toLowerCase();
  if (word.themeId === "grammar") return 10;
  if (word.themeId === "linking-words") return 9;

  let score = 0;
  if (HIGH_VALUE_TERMS.has(text)) score += 6;
  if (WRITING_TERMS.has(text)) score += 4;
  if (SPEAKING_TERMS.has(text)) score += 4;
  if (word.type === "phrase") score += 2;
  if (["noun", "adj"].includes(word.type) && /tion|ment|ity|ance|ence|ship|ism/.test(text)) score += 2;
  if (text.split(" ").length >= 3) score += 1;
  return score;
}

function getSkillTags(word, score) {
  const text = word.en.toLowerCase();
  if (word.themeId === "grammar") return ["Speaking", "Writing", "Khung câu"];
  if (word.themeId === "linking-words") return ["Speaking", "Writing", "Từ nối"];

  const tags = [];
  if (score >= 8) tags.push("Ăn điểm");
  else if (score >= 5) tags.push("Nên dùng");
  if (WRITING_TERMS.has(text) || /tion|ment|ity|ance|ence|ship|ism/.test(text)) tags.push("Writing");
  if (SPEAKING_TERMS.has(text) || word.type === "phrase") tags.push("Speaking");
  return [...new Set(tags)].slice(0, 3);
}

function getBandLabel(score, word) {
  if (word?.themeId === "grammar") return "80/20 Grammar";
  if (word?.themeId === "linking-words") return "80/20 Linker";
  if (score >= 8) return "Ưu tiên cao";
  if (score >= 5) return "Rất nên học";
  return "Cốt lõi";
}

function withThemeWords(theme) {
  return theme.words.map(word => {
    const enriched = {
      ...word,
      themeId: theme.id,
      themeTitle: theme.title,
      themeViTitle: theme.viTitle,
      icon: theme.icon
    };
    const score = scoreWord(enriched);
    return {
      ...enriched,
      score,
      bandLabel: getBandLabel(score, enriched),
      priority: score >= 8,
      skillTags: getSkillTags(enriched, score)
    };
  });
}

function getThemeById(id) {
  return allThemes.find(theme => theme.id === id) || allThemes[0];
}

function isListOnlyTheme(themeOrId) {
  const id = typeof themeOrId === "string" ? themeOrId : themeOrId?.id;
  return ["grammar", "linking-words"].includes(id);
}

function getVisibleWords() {
  const theme = getThemeById(state.activeTheme);
  let words = withThemeWords(theme);

  if (state.search.trim()) {
    const q = state.search.trim().toLowerCase();
    words = words.filter(word =>
      [word.en, word.vi, word.type, word.themeTitle, word.themeViTitle, word.bandLabel, word.skillTags.join(" ")].join(" ").toLowerCase().includes(q)
    );
  }

  if (state.filter === "priority") {
    words = words.filter(word => word.priority || word.score >= 5);
  }
  if (state.filter === "mastered") {
    words = words.filter(word => state.mastered.has(keyFor(word)));
  }
  if (state.filter === "unmastered") {
    words = words.filter(word => !state.mastered.has(keyFor(word)));
  }
  if (state.filter === "favorites") {
    words = words.filter(word => state.favorites.has(keyFor(word)));
  }

  const shuffled = state.shuffledOrders[state.activeTheme];
  if (shuffled) {
    const orderMap = new Map(shuffled.map((w, i) => [keyFor(w), i]));
    words.sort((a, b) => {
      const ai = orderMap.get(keyFor(a)) ?? 9999;
      const bi = orderMap.get(keyFor(b)) ?? 9999;
      return ai - bi;
    });
  } else {
    words.sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;
      return a.en.localeCompare(b.en, "vi");
    });
  }

  return words;
}

function persist() {
  storage.set("vstep-mastered", [...state.mastered]);
  storage.set("vstep-favorites", [...state.favorites]);
  storage.set("vstep-wrong", state.wrongCounts);
  storage.set("vstep-quiz-mode", state.quizMode);
}

function switchView(nextView) {
  const theme = getThemeById(state.activeTheme);
  const forcedView = isListOnlyTheme(theme) ? "list" : nextView;
  state.view = forcedView;

  els.viewSwitch.forEach(btn => {
    const isDisabled = isListOnlyTheme(theme) && btn.dataset.view !== "list";
    btn.classList.toggle("active", btn.dataset.view === forcedView);
    btn.classList.toggle("hidden", isDisabled);
  });

  els.toggleQuizBtn.classList.toggle("hidden", isListOnlyTheme(theme));
  els.shuffleBtn.classList.toggle("hidden", isListOnlyTheme(theme));

  // Sync mobile bottom nav with current view
  document.querySelectorAll(".bnav-btn[data-view]").forEach(btn => {
    btn.classList.toggle("active", btn.dataset.view === forcedView);
  });

  els.cardsView.classList.toggle("hidden", forcedView !== "cards");
  els.listView.classList.toggle("hidden", forcedView !== "list");
  els.quizView.classList.toggle("hidden", forcedView !== "quiz");
}

function renderThemes() {
  els.themeList.innerHTML = allThemes.map(theme => {
    const active = theme.id === state.activeTheme ? "active" : "";
    const enriched = withThemeWords(theme);
    const high = enriched.filter(item => item.priority || item.score >= 5).length;
    return `
      <button class="theme-btn ${active}" data-theme="${theme.id}">
        <div class="theme-title">${theme.icon} ${theme.viTitle}</div>
        <div class="theme-meta">${theme.title} · ${theme.words.length} từ · ${high} từ mạnh</div>
      </button>
    `;
  }).join("");

  els.themeList.querySelectorAll(".theme-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      state.activeTheme = btn.dataset.theme;
      if (isListOnlyTheme(state.activeTheme)) state.view = "list";
      state.quiz = { index: 0, score: 0, items: [], wrongKeys: [] };
      render();
    });
  });

  // Update mobile topbar label
  const activeTh = getThemeById(state.activeTheme);
  const mobileLabel = document.getElementById("mobileTopicLabel");
  if (mobileLabel && activeTh) {
    mobileLabel.textContent = `${activeTh.icon} ${activeTh.viTitle}`;
  }
}

function renderSummary(words) {
  const theme = getThemeById(state.activeTheme);
  const themeWords = withThemeWords(theme);
  const masteredInTheme = themeWords.filter(word => state.mastered.has(keyFor(word))).length;
  const favoritesInTheme = themeWords.filter(word => state.favorites.has(keyFor(word))).length;
  const priorityCount = themeWords.filter(word => word.priority || word.score >= 5).length;

  els.summaryBar.innerHTML = `
    <div class="summary-card">
      <span class="mini-label">Chủ đề hiện tại</span>
      <strong>${theme.viTitle}</strong>
      <div class="muted">${theme.description}</div>
    </div>
    <div class="summary-card">
      <span class="mini-label">Từ ưu tiên VSTEP</span>
      <strong>${priorityCount}/${theme.words.length}</strong>
      <div class="muted">Ưu tiên cho writing và speaking.</div>
    </div>
    <div class="summary-card">
      <span class="mini-label">Tiến độ</span>
      <strong>${masteredInTheme} thuộc · ${favoritesInTheme} lưu</strong>
      <div class="muted">Học từ mạnh trước, rồi mở rộng dần.</div>
    </div>
  `;

  els.themeCount.textContent = allThemes.length;
  els.wordCount.textContent = words.length;
  els.masteredCount.textContent = state.mastered.size;
  els.heroTitle.textContent = `${theme.icon} ${theme.viTitle} · ${theme.title}`;
  els.heroDesc.textContent = theme.description;
}

function toggleMastered(word) {
  const key = keyFor(word);
  if (state.mastered.has(key)) {
    state.mastered.delete(key);
  } else {
    state.mastered.add(key);
  }
  persist();
  render();
}

function toggleFavorite(word) {
  const key = keyFor(word);
  if (state.favorites.has(key)) {
    state.favorites.delete(key);
  } else {
    state.favorites.add(key);
  }
  persist();
  render();
}

function bindWordActionButtons(root, words) {
  root.querySelectorAll("[data-action='master']").forEach(btn => {
    btn.addEventListener("click", e => {
      e.stopPropagation();
      toggleMastered(words[Number(btn.dataset.index)]);
    });
  });

  root.querySelectorAll("[data-action='favorite']").forEach(btn => {
    btn.addEventListener("click", e => {
      e.stopPropagation();
      toggleFavorite(words[Number(btn.dataset.index)]);
    });
  });
}

function renderBadges(word) {
  return `
    <div class="badge-row">
      <span class="theme-pill">${word.icon} ${word.themeViTitle}</span>
    </div>
  `;
}

function renderTagRow(word) {
  return `
    <div class="badge-row tag-row">
      <span class="priority-badge">★ ${word.bandLabel}</span>
      ${word.skillTags.map(tag => `<span class="skill-chip">${tag}</span>`).join("")}
    </div>
  `;
}

function renderCards(words) {
  if (!words.length) {
    els.cardsView.innerHTML = `<div class="panel" style="padding:24px">Không có từ nào khớp bộ lọc hiện tại.</div>`;
    return;
  }

  els.cardsView.innerHTML = words.map((word, index) => {
    const mastered = state.mastered.has(keyFor(word));
    const favorite = state.favorites.has(keyFor(word));
    const booster = isStudyBoosterTheme(word);
    return `
      <article class="card ${booster ? "study-card" : ""}" data-index="${index}">
        <div class="card-inner">
          <div class="card-face card-front">
            <div>
              ${renderBadges(word)}
              ${booster ? `<span class="word-note">${word.themeId === "grammar" ? "Khung cần thuộc" : "Cụm nối cần nhớ"}</span>` : ""}
              <p class="word-front">${word.en}</p>
              ${renderTagRow(word)}
              <div class="word-meta">${booster ? `Mục tiêu: dùng để hoàn thành câu và nối ý tự nhiên.` : `Loại từ: ${word.type} · Điểm ưu tiên: ${word.score}`}</div>
            </div>
            <div>
              <div class="card-actions">
                <button class="tiny-btn ${favorite ? "active" : ""}" data-action="favorite" data-index="${index}">${favorite ? "★ Đã lưu" : "☆ Lưu"}</button>
                <button class="tiny-btn ${mastered ? "active" : ""}" data-action="master" data-index="${index}">${mastered ? "✓ Đã thuộc" : "○ Thuộc"}</button>
              </div>
            </div>
          </div>
          <div class="card-face card-back">
            <div>
              ${renderBadges(word)}
              <span class="word-note">${booster ? "Cách dùng nhanh" : "Nghĩa chính"}</span>
              <p class="word-vi">${word.vi}</p>
              ${renderTagRow(word)}
              <div class="word-meta">${booster ? `Ưu tiên dùng trong ${word.skillTags.join(" + ")} để câu mạch lạc hơn.` : `Từ/cụm này phù hợp cho ${word.skillTags.length ? word.skillTags.join(" + ") : "học nền tảng"}.`}</div>
            </div>
            <div>
              <div class="card-actions">
                <button class="tiny-btn ${favorite ? "active" : ""}" data-action="favorite" data-index="${index}">${favorite ? "★ Đã lưu" : "☆ Lưu"}</button>
                <button class="tiny-btn ${mastered ? "active" : ""}" data-action="master" data-index="${index}">${mastered ? "✓ Đã thuộc" : "○ Thuộc"}</button>
              </div>
            </div>
          </div>
        </div>
      </article>
    `;
  }).join("");

  els.cardsView.querySelectorAll(".card").forEach(card => {
    card.addEventListener("click", e => {
      if (e.target.closest("button")) return;
      card.classList.toggle("flipped");
    });
  });

  bindWordActionButtons(els.cardsView, words);
}

function renderList(words) {
  if (!words.length) {
    els.listView.innerHTML = `<div class="panel" style="padding:24px">Không có từ nào khớp bộ lọc hiện tại.</div>`;
    return;
  }

  els.listView.innerHTML = words.map((word, index) => {
    const mastered = state.mastered.has(keyFor(word));
    const favorite = state.favorites.has(keyFor(word));
    const booster = isStudyBoosterTheme(word);
    return `
      <div class="list-row ${booster ? "study-list-row" : ""}">
        <div>
          <div class="en">${word.en}</div>
          <div class="list-meta">
            <span class="theme-pill">${word.icon} ${word.themeViTitle}</span>
          </div>
        </div>
        <div>
          <div class="vi">${word.vi}</div>
          ${word.example ? `
            <div class="example-box">
              <span class="example-label">Ví dụ</span>
              <div class="example-text">${word.example}</div>
            </div>
          ` : ""}
        </div>
        <div>
          <span class="word-type">${booster ? "study" : word.type}</span>
          <div class="list-meta" style="margin-top:8px;">
            <span class="priority-badge">★ ${word.bandLabel}</span>
            ${word.skillTags.map(tag => `<span class="skill-chip">${tag}</span>`).join("")}
          </div>
          <div class="word-meta">${booster ? "Học để nói tròn câu, nối ý và bắt chước luôn câu mẫu." : `Điểm ${word.score}`}</div>
        </div>
        <div class="card-actions">
          <button class="tiny-btn ${favorite ? "active" : ""}" data-action="favorite" data-index="${index}">${favorite ? "★" : "☆"}</button>
          <button class="tiny-btn ${mastered ? "active" : ""}" data-action="master" data-index="${index}">${mastered ? "✓" : "○"}</button>
        </div>
      </div>
    `;
  }).join("");

  bindWordActionButtons(els.listView, words);
}

function createQuizItems(sourceWords) {
  const theme = getThemeById(state.activeTheme);
  const base = sourceWords || withThemeWords(theme).sort((a, b) => {
    const aWrong = state.wrongCounts[keyFor(a)] || 0;
    const bWrong = state.wrongCounts[keyFor(b)] || 0;
    if (bWrong !== aWrong) return bWrong - aWrong;
    return b.score - a.score;
  });

  const pool = shuffle(base.slice(0, Math.min(20, base.length)));
  const selected = pool.slice(0, Math.min(10, pool.length));

  return selected.map(word => {
    if (state.quizMode === "vi-en") {
      const distractors = shuffle(base.filter(w => w.en !== word.en).map(w => w.en)).slice(0, 3);
      const options = shuffle([word.en, ...distractors]);
      return { word, options, mode: "vi-en", answered: false, correct: null };
    } else if (state.quizMode === "fill") {
      return { word, options: null, mode: "fill", answered: false, correct: null };
    } else {
      const distractors = shuffle(base.filter(w => w.en !== word.en).map(w => w.vi)).slice(0, 3);
      const options = shuffle([word.vi, ...distractors]);
      return { word, options, mode: "en-vi", answered: false, correct: null };
    }
  });
}

function renderQuiz() {
  // Clean up any stale keyboard listener from previous render
  if (_quizKeyHandler) {
    document.removeEventListener("keydown", _quizKeyHandler);
    _quizKeyHandler = null;
  }

  if (!state.quiz.items.length) {
    state.quiz = { index: 0, score: 0, items: createQuizItems(), wrongKeys: [] };
  }

  const total = state.quiz.items.length;
  const current = state.quiz.items[state.quiz.index];

  // ── End screen ──────────────────────────────────────────────────────────────
  if (!current) {
    const allWords = withThemeWords(getThemeById(state.activeTheme));
    const wrongWords = state.quiz.wrongKeys
      .map(k => allWords.find(w => keyFor(w) === k))
      .filter(Boolean);

    els.quizView.innerHTML = `
      <div class="quiz-card">
        <div class="quiz-top">
          <h3>Hoàn thành! 🎉</h3>
          <span class="word-type">${state.quiz.score}/${total} đúng</span>
        </div>
        <div class="progress">
          <div class="progress-bar" style="width:${(state.quiz.score / total) * 100}%"></div>
        </div>
        ${wrongWords.length ? `
          <div class="wrong-review">
            <p class="eyebrow" style="margin:0 0 10px">Cần ôn lại (${wrongWords.length} từ)</p>
            <div class="wrong-list">
              ${wrongWords.map(w => `
                <div class="wrong-item">
                  <span class="wrong-en">${w.en}</span>
                  <span class="wrong-vi">${w.vi}</span>
                </div>
              `).join("")}
            </div>
          </div>
        ` : `<p class="muted" style="text-align:center;padding:16px 0">🏆 Tuyệt vời! Không có từ sai.</p>`}
        <div class="quiz-footer" style="margin-top:20px;flex-wrap:wrap;gap:10px">
          ${wrongWords.length ? `<button class="btn" id="reviewWrongBtn">Ôn lại từ sai (${wrongWords.length})</button>` : ""}
          <button class="btn ghost" id="retryQuizBtn">Làm lại</button>
          <button class="btn ghost" id="backToCardsBtn">Flashcards</button>
        </div>
      </div>
    `;

    if (wrongWords.length) {
      document.getElementById("reviewWrongBtn").addEventListener("click", () => {
        state.quiz = { index: 0, score: 0, items: createQuizItems(wrongWords), wrongKeys: [] };
        render();
      });
    }
    document.getElementById("retryQuizBtn").addEventListener("click", () => {
      state.quiz = { index: 0, score: 0, items: createQuizItems(), wrongKeys: [] };
      render();
    });
    document.getElementById("backToCardsBtn").addEventListener("click", () => {
      switchView("cards");
      render();
    });
    return;
  }

  // ── Active question ──────────────────────────────────────────────────────────
  const progress = (state.quiz.index / total) * 100;
  const isFill = current.mode === "fill";
  const isViEn = current.mode === "vi-en";
  const promptWord = (isFill || isViEn) ? current.word.vi : current.word.en;
  const modeHint = isFill ? "Gõ từ tiếng Anh" : isViEn ? "Chọn từ tiếng Anh đúng" : "Chọn nghĩa đúng";

  els.quizView.innerHTML = `
    <div class="quiz-card">
      <div class="quiz-top">
        <h3>Quiz</h3>
        <span class="word-type">Câu ${state.quiz.index + 1}/${total}</span>
      </div>

      <div class="quiz-mode-tabs">
        <button class="mode-tab ${state.quizMode === "en-vi" ? "active" : ""}" data-mode="en-vi">Anh → Việt</button>
        <button class="mode-tab ${state.quizMode === "vi-en" ? "active" : ""}" data-mode="vi-en">Việt → Anh</button>
        <button class="mode-tab ${state.quizMode === "fill" ? "active" : ""}" data-mode="fill">Điền từ</button>
      </div>

      <div class="progress"><div class="progress-bar" style="width:${progress}%"></div></div>

      <p class="eyebrow">${modeHint}</p>
      <div class="quiz-word">${promptWord}</div>
      <p class="quiz-hint">${current.word.bandLabel} · ${current.word.skillTags.join(" + ") || "Cốt lõi"}</p>

      ${isFill ? `
        <div class="fill-area">
          <input id="fillInput" class="fill-input" type="text"
            placeholder="Gõ từ tiếng Anh..."
            autocomplete="off" autocorrect="off" autocapitalize="off" spellcheck="false" />
          <button class="btn" id="fillSubmitBtn">Kiểm tra</button>
        </div>
      ` : `
        <div class="quiz-options">
          ${current.options.map((opt, i) => `
            <button class="option" data-option="${opt.replace(/"/g, "&quot;")}">
              <span class="option-key">${i + 1}</span>${opt}
            </button>
          `).join("")}
        </div>
      `}

      <div class="quiz-footer">
        <span class="muted">Điểm: ${state.quiz.score}/${state.quiz.index}</span>
        <button class="btn ghost" id="skipQuizBtn">Bỏ qua</button>
      </div>
    </div>
  `;

  // Mode tab switching — restart quiz with new mode
  els.quizView.querySelectorAll(".mode-tab").forEach(btn => {
    btn.addEventListener("click", () => {
      state.quizMode = btn.dataset.mode;
      persist();
      state.quiz = { index: 0, score: 0, items: createQuizItems(), wrongKeys: [] };
      render();
    });
  });

  function markAnswer(isCorrect) {
    if (current.answered) return;
    current.answered = true;
    current.correct = isCorrect;
    if (isCorrect) {
      state.quiz.score += 1;
    } else {
      const key = keyFor(current.word);
      state.wrongCounts[key] = (state.wrongCounts[key] || 0) + 1;
      if (!state.quiz.wrongKeys.includes(key)) state.quiz.wrongKeys.push(key);
      persist();
    }
    setTimeout(() => { state.quiz.index += 1; render(); }, 900);
  }

  // ── Fill mode ────────────────────────────────────────────────────────────────
  if (isFill) {
    const fillInput = document.getElementById("fillInput");
    const submitBtn = document.getElementById("fillSubmitBtn");
    fillInput.focus();

    function checkFill() {
      if (current.answered) return;
      const answer = fillInput.value.trim().toLowerCase();
      const correct = current.word.en.toLowerCase();
      const isCorrect = answer === correct;
      fillInput.disabled = true;
      submitBtn.disabled = true;
      fillInput.classList.add(isCorrect ? "fill-correct" : "fill-wrong");
      if (!isCorrect) {
        fillInput.insertAdjacentHTML("afterend",
          `<div class="fill-answer">Đáp án đúng: <strong>${current.word.en}</strong></div>`);
      }
      markAnswer(isCorrect);
    }

    submitBtn.addEventListener("click", checkFill);
    fillInput.addEventListener("keydown", e => { if (e.key === "Enter") checkFill(); });

  // ── Multiple choice ──────────────────────────────────────────────────────────
  } else {
    const correctAnswer = isViEn ? current.word.en : current.word.vi;

    els.quizView.querySelectorAll(".option").forEach(btn => {
      btn.addEventListener("click", () => {
        if (current.answered) return;
        const isCorrect = btn.dataset.option === correctAnswer;
        els.quizView.querySelectorAll(".option").forEach(o => {
          if (o.dataset.option === correctAnswer) o.classList.add("correct");
          if (o === btn && !isCorrect) o.classList.add("wrong");
          o.disabled = true;
        });
        markAnswer(isCorrect);
      });
    });

    // Keyboard shortcut: press 1–4 to pick option
    _quizKeyHandler = e => {
      if (current.answered) return;
      const n = parseInt(e.key);
      if (n >= 1 && n <= 4) {
        const opts = els.quizView.querySelectorAll(".option");
        if (opts[n - 1]) opts[n - 1].click();
      }
    };
    document.addEventListener("keydown", _quizKeyHandler);
  }

  document.getElementById("skipQuizBtn").addEventListener("click", () => {
    if (!current.answered) {
      current.answered = true;
      const key = keyFor(current.word);
      if (!state.quiz.wrongKeys.includes(key)) state.quiz.wrongKeys.push(key);
    }
    state.quiz.index += 1;
    render();
  });
}

function initMobileDrawer() {
  const sidebar = document.getElementById("sidebar");
  const backdrop = document.getElementById("drawerBackdrop");
  if (!sidebar || !backdrop) return;

  function openDrawer() {
    sidebar.classList.add("drawer-open");
    backdrop.style.display = "block";
    requestAnimationFrame(() => backdrop.classList.add("visible"));
    document.body.style.overflow = "hidden";
  }

  function closeDrawer() {
    sidebar.classList.remove("drawer-open");
    backdrop.classList.remove("visible");
    document.body.style.overflow = "";
    setTimeout(() => { backdrop.style.display = "none"; }, 340);
  }

  document.getElementById("openDrawerBtn")?.addEventListener("click", openDrawer);
  document.getElementById("openDrawerBtnNav")?.addEventListener("click", openDrawer);
  backdrop.addEventListener("click", closeDrawer);

  // Swipe down to close
  let touchStartY = 0;
  let dragging = false;
  sidebar.addEventListener("touchstart", e => {
    touchStartY = e.touches[0].clientY;
    dragging = false;
  }, { passive: true });
  sidebar.addEventListener("touchmove", e => {
    const dy = e.touches[0].clientY - touchStartY;
    if (dy > 0 && sidebar.scrollTop === 0) {
      dragging = true;
      sidebar.style.transform = `translateY(${dy}px)`;
      backdrop.style.opacity = String(Math.max(0, 1 - dy / 200));
    }
  }, { passive: true });
  sidebar.addEventListener("touchend", e => {
    if (!dragging) return;
    const dy = e.changedTouches[0].clientY - touchStartY;
    sidebar.style.transform = "";
    backdrop.style.opacity = "";
    if (dy > 80) closeDrawer();
  });

  // Close when theme is selected on mobile
  els.themeList.addEventListener("click", () => {
    if (window.innerWidth <= 980) setTimeout(closeDrawer, 200);
  });
}

function bindGlobalEvents() {
  els.searchInput.addEventListener("input", e => {
    state.search = e.target.value;
    render();
  });

  els.shuffleBtn.addEventListener("click", () => {
    const theme = getThemeById(state.activeTheme);
    if (isListOnlyTheme(theme)) return;
    state.shuffledOrders[state.activeTheme] = shuffle(withThemeWords(theme));
    render();
  });

  els.toggleQuizBtn.addEventListener("click", () => {
    const theme = getThemeById(state.activeTheme);
    if (isListOnlyTheme(theme)) return;
    state.quiz = { index: 0, score: 0, items: createQuizItems(), wrongKeys: [] };
    switchView("quiz");
    render();
  });

  els.filterChips.forEach(btn => {
    btn.addEventListener("click", () => {
      state.filter = btn.dataset.filter;
      els.filterChips.forEach(chip => chip.classList.toggle("active", chip === btn));
      render();
    });
  });

  els.viewSwitch.forEach(btn => {
    btn.addEventListener("click", () => {
      const theme = getThemeById(state.activeTheme);
      const nextView = isListOnlyTheme(theme) ? "list" : btn.dataset.view;
      if (nextView === "quiz" && !state.quiz.items.length) {
        state.quiz = { index: 0, score: 0, items: createQuizItems(), wrongKeys: [] };
      }
      switchView(nextView);
      render();
    });
  });
  // Bottom nav view switching
  document.querySelectorAll(".bnav-btn[data-view]").forEach(btn => {
    btn.addEventListener("click", () => {
      const theme = getThemeById(state.activeTheme);
      const nextView = isListOnlyTheme(theme) ? "list" : btn.dataset.view;
      if (nextView === "quiz" && !state.quiz.items.length) {
        state.quiz = { index: 0, score: 0, items: createQuizItems(), wrongKeys: [] };
      }
      switchView(nextView);
      render();
    });
  });

  initMobileDrawer();
}

function render() {
  renderThemes();
  const words = getVisibleWords();
  renderSummary(words);
  renderCards(words);
  renderList(words);
  renderQuiz();
  switchView(state.view);
}

bindGlobalEvents();
render();
