const allThemes = window.VSTEP_VOCAB || [];

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
  quiz: {
    index: 0,
    score: 0,
    items: []
  }
};

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

  words.sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    return a.en.localeCompare(b.en, "vi");
  });

  return words;
}

function persist() {
  storage.set("vstep-mastered", [...state.mastered]);
  storage.set("vstep-favorites", [...state.favorites]);
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
      state.quiz = { index: 0, score: 0, items: [] };
      render();
    });
  });
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
          ${booster && word.example ? `
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

function createQuizItems() {
  const theme = getThemeById(state.activeTheme);
  const base = withThemeWords(theme).sort((a, b) => b.score - a.score);
  return shuffle(base.slice(0, Math.min(16, base.length))).slice(0, Math.min(10, base.length)).map(word => {
    const distractors = shuffle(base.filter(item => item.en !== word.en).map(item => item.vi)).slice(0, 3);
    const options = shuffle([word.vi, ...distractors]);
    return { word, options, answered: false };
  });
}

function renderQuiz() {
  if (!state.quiz.items.length) {
    state.quiz = { index: 0, score: 0, items: createQuizItems() };
  }

  const total = state.quiz.items.length;
  const current = state.quiz.items[state.quiz.index];

  if (!current) {
    els.quizView.innerHTML = `
      <div class="quiz-card">
        <div class="quiz-top">
          <h3>Hoàn thành quiz</h3>
          <span class="word-type">${state.quiz.score}/${total} đúng</span>
        </div>
        <p class="muted">Quiz hiện ưu tiên các từ/cụm mạnh cho speaking và writing.</p>
        <div class="quiz-footer">
          <button class="btn" id="retryQuizBtn">Làm lại quiz</button>
          <button class="btn ghost" id="backToCardsBtn">Về flashcards</button>
        </div>
      </div>
    `;

    document.getElementById("retryQuizBtn").addEventListener("click", () => {
      state.quiz = { index: 0, score: 0, items: createQuizItems() };
      render();
    });

    document.getElementById("backToCardsBtn").addEventListener("click", () => {
      switchView("cards");
      render();
    });

    return;
  }

  const progress = (state.quiz.index / total) * 100;
  els.quizView.innerHTML = `
    <div class="quiz-card">
      <div class="quiz-top">
        <h3>Quiz nhanh</h3>
        <span class="word-type">Câu ${state.quiz.index + 1}/${total}</span>
      </div>
      <div class="progress"><div class="progress-bar" style="width:${progress}%"></div></div>
      <p class="eyebrow">Chọn nghĩa đúng</p>
      <div class="quiz-word">${current.word.en}</div>
      <p class="quiz-hint">${current.word.bandLabel} · ${current.word.skillTags.join(" + ") || "Cốt lõi"}</p>
      <div class="quiz-options">
        ${current.options.map(option => `<button class="option" data-option="${option.replace(/"/g, '&quot;')}">${option}</button>`).join("")}
      </div>
      <div class="quiz-footer">
        <span class="muted">Điểm hiện tại: ${state.quiz.score}</span>
        <button class="btn ghost" id="skipQuizBtn">Bỏ qua</button>
      </div>
    </div>
  `;

  els.quizView.querySelectorAll(".option").forEach(btn => {
    btn.addEventListener("click", () => {
      if (current.answered) return;
      current.answered = true;
      const isCorrect = btn.dataset.option === current.word.vi;
      els.quizView.querySelectorAll(".option").forEach(optionBtn => {
        if (optionBtn.dataset.option === current.word.vi) optionBtn.classList.add("correct");
        if (optionBtn === btn && !isCorrect) optionBtn.classList.add("wrong");
        optionBtn.disabled = true;
      });
      if (isCorrect) state.quiz.score += 1;
      setTimeout(() => {
        state.quiz.index += 1;
        render();
      }, 700);
    });
  });

  document.getElementById("skipQuizBtn").addEventListener("click", () => {
    state.quiz.index += 1;
    render();
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
    theme.words = shuffle(theme.words);
    render();
  });

  els.toggleQuizBtn.addEventListener("click", () => {
    const theme = getThemeById(state.activeTheme);
    if (isListOnlyTheme(theme)) return;
    state.quiz = { index: 0, score: 0, items: createQuizItems() };
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
        state.quiz = { index: 0, score: 0, items: createQuizItems() };
      }
      switchView(nextView);
      render();
    });
  });
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
