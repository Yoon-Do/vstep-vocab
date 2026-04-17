# VSTEP Vocabulary Studio - Codebase Exploration Report

## Project Overview
This is a Vietnamese VSTEP (standardized English test) vocabulary learning web application. It's a single-page application built with vanilla JavaScript, HTML5, and CSS3. The app focuses on helping learners master vocabulary essential for VSTEP writing and speaking tasks.

---

## 1. **"Viết Thư" (Letter Writing) Implementation**

### Data File: `vocab-data.js` (Lines 4578-4830)
```javascript
{
  "id": "writing-task1",
  "icon": "✉️",
  "title": "Writing Task 1 – Letters",
  "viTitle": "Viết thư",
  "description": "Mẫu câu, cấu trúc và cụm từ cần thuộc lòng cho 6 loại thư trong VSTEP Writing Task 1.",
  "words": [
    // 40+ template sentences and phrases organized by letter type
  ]
}
```

### Letter Types Covered (6 types):
1. **Informal Information Letter** - "Mở đầu thư thân mật – hỏi thăm"
2. **Formal Information Letter** - "Mở đầu thư cung cấp thông tin (formal)"
3. **Request Letter** - "I am writing to ask for some information about…"
4. **Apology Letter** - "I am writing to apologize for…"
5. **Complaint Letter** - "I am writing to complain about…"
6. **Thank-you Letter** - "I am writing this letter to extend my sincere thanks"
7. **Job Application Letter** - "I have recently seen recruitment news on…"
8. **Advice Letter** - "I am writing to give you some advice about…"
9. **Invitation Letter** - "I am writing to invite you to…"

### Key Template Sentences:
- **Opening**: "How have you been recently?", "I am writing to provide you with some information about…"
- **Body**: "Firstly, I would like to tell you that…", "Secondly, it might be useful for you to know that…"
- **Closing**: "I am looking forward to hearing from you soon.", "Best regards,"
- **Formal Greetings**: "Dear Mr./Mrs. [Name] / Sir or Madam,"

---

## 2. **"Viết Luận" (Essay Writing) Implementation**

### Data File: `vocab-data.js` (Lines 4833-5056)
```javascript
{
  "id": "writing-task2",
  "icon": "📝",
  "title": "Writing Task 2 – Essays",
  "viTitle": "Viết luận",
  "description": "Mẫu câu, cấu trúc và cụm từ cần thuộc lòng cho 3 dạng bài luận VSTEP Writing Task 2.",
  "words": [
    // 30+ template sentences and structures organized by essay type
  ]
}
```

### Essay Types Covered (4 types):
1. **Advantages & Disadvantages (Adv-Dis)**
2. **Causes & Effects (Cause-Effect)**
3. **Causes & Solutions (Cause-Solution)**
4. **Opinion Essay**
5. **Argumentative Essay**
6. **Discussion Essay**

### Key Template Structures:

#### Adv-Dis Essay:
- **Introduction**: "This essay will discuss the advantages and disadvantages of such a situation and draw a conclusion."
- **Body Paragraph 1**: "On the one hand, the major advantage of… is… This means that…"
- **Body Paragraph 2**: "On the other hand, the important disadvantage is… In other words,…"
- **Conclusion**: "In conclusion, [VIẾT LẠI ĐỀ]. I think the main [advantage/cause] of… is…"

#### Opinion Essay:
- **Introduction**: "In today's society, [TOPIC] has become an essential part of the rising debate in the present world"
- **Thesis**: "Personally, I strongly agree that [QUAN ĐIỂM BẠN ĐỒNG Ý]"
- **Body**: "First and foremost, it should be recognized that [LÝ DO 1]"
- **Conclusion**: "To conclude, this essay argued that [VIẾT LẠI QUAN ĐIỂM CỦA BẠN]"

#### Discussion Essay:
- **Introduction**: "It is widely argued that [QUAN ĐIỂM 1], while others contend that [QUAN ĐIỂM 2]"
- **Perspective 1**: "Those who support [QUAN ĐIỂM 1] argue that…"
- **Perspective 2**: "On the other hand, those who believe [QUAN ĐIỂM 2] claim that…"
- **Conclusion**: "In conclusion, while both views have their merits, I personally believe that…"

---

## 3. **"Học Theo Cụm" (Learning by Clusters) Display Mode**

### Current Implementation Location

#### In `app.js`:

**Identification Function** (Line 182-185):
```javascript
function isListOnlyTheme(themeOrId) {
  const id = typeof themeOrId === "string" ? themeOrId : themeOrId?.id;
  return ["grammar", "linking-words", "writing-task1", "writing-task2"].includes(id);
}
```

**View Switching Logic** (Line 236-258):
```javascript
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
  // ... rest of view switching
}
```

### Rendering Logic for List View (Lines 435-479)

```javascript
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
```

### Features of Current "Học Theo Cụm" Display:
1. **Forced List View**: Writing tasks ONLY show list view, not cards or quiz
2. **Four-Column Layout** (Lines 411-412 in styles.css):
   - Column 1: English word/phrase + theme pill
   - Column 2: Vietnamese translation + example box (if available)
   - Column 3: Word type, priority badge, skill tags, meta info
   - Column 4: Action buttons (favorite, mastered)
3. **Special Styling** (.study-list-row):
   - Gradient background: `linear-gradient(135deg, rgba(255, 247, 232, 0.92), rgba(244, 251, 248, 0.92))`
4. **Example Box Display** (for writing templates):
   - Shows practical example of how to use the template sentence
   - Clear label "Ví dụ" (Example)
   - Visual distinction with border and background
5. **Learning Context**: 
   - Shows purpose/type of each template
   - Displays skill tags (Speaking, Writing, etc.)
   - Includes actionable guidance in meta information

---

## 4. **Template Structure in Data**

### Word Object Format:
```javascript
{
  "en": "I am writing to provide you with some information about…",
  "vi": "Mở đầu thư cung cấp thông tin (formal).",
  "type": "study",  // Always "study" for writing tasks
  "example": "I am writing to provide you with some information about the upcoming event."
}
```

### Enriched Word Object (After Processing):
```javascript
{
  // ... original fields ...
  "themeId": "writing-task1",
  "themeTitle": "Writing Task 1 – Letters",
  "themeViTitle": "Viết thư",
  "icon": "✉️",
  "score": 10,  // Computed based on theme
  "bandLabel": "80/20 Grammar",  // Theme-specific label
  "priority": true,
  "skillTags": ["Speaking", "Writing", "Khung câu"]  // From function getSkillTags()
}
```

---

## 5. **File Structure and Routing**

### Key Files:
```
/Users/namdo/vstep-vocab/
├── index.html              # Main HTML structure
├── app.js                  # Core app logic (835 lines)
├── vocab-data.js           # All vocabulary data (5057 lines)
├── styles.css              # All styling (850+ lines)
├── Writing/                # Reference documents
│   ├── Task 1 – Letters.docx
│   ├── Task 2 – Essays.docx
│   ├── VSTEP Speaking Band Descriptors.pdf
│   └── VSTEP Writing Band Descriptors.pdf
└── references/             # Additional resources
    ├── GIÁO TRÌNH VOCAB.pdf
    ├── Học từ vựng cấp tốc.xlsx
    └── từ vựng.pdf
```

### Routing/Theme Selection (Lines 273-280):
```javascript
els.themeList.querySelectorAll(".theme-btn").forEach(btn => {
  btn.addEventListener("click", () => {
    state.activeTheme = btn.dataset.theme;
    if (isListOnlyTheme(state.activeTheme)) state.view = "list";
    state.quiz = { index: 0, score: 0, items: [], wrongKeys: [] };
    render();
  });
});
```

### Main Render Flow (Lines 823-831):
```javascript
function render() {
  renderThemes();           // Render sidebar theme buttons
  const words = getVisibleWords();
  renderSummary(words);     // Update statistics
  renderCards(words);       // Render flashcard view
  renderList(words);        // Render list view ("học theo cụm")
  renderQuiz();            // Render quiz view
  switchView(state.view);  // Show active view only
}
```

---

## 6. **Key Implementation Details**

### State Management (Lines 67-83):
```javascript
const state = {
  activeTheme: allThemes[0]?.id || null,
  search: "",
  filter: "all",
  view: "cards",  // or "list" or "quiz"
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
```

### Special Handling for Writing Tasks:
1. **Always uses list view** (no card flipping option)
2. **Quiz disabled** (hides quiz button)
3. **Shuffle disabled** (hides shuffle button)
4. **View switch limited** to list view only
5. **Special styling** with gradient backgrounds

### Word Filtering (Lines 187-227):
```javascript
function getVisibleWords() {
  const theme = getThemeById(state.activeTheme);
  let words = withThemeWords(theme);

  // Apply search filter
  if (state.search.trim()) { ... }
  
  // Apply filter chips
  if (state.filter === "priority") { ... }
  if (state.filter === "mastered") { ... }
  if (state.filter === "unmastered") { ... }
  if (state.filter === "favorites") { ... }

  // Apply sorting or shuffle
  const shuffled = state.shuffledOrders[state.activeTheme];
  if (shuffled) { ... }
  else {
    words.sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;
      return a.en.localeCompare(b.en, "vi");
    });
  }

  return words;
}
```

---

## 7. **CSS Styling for List View**

### List Row Structure (styles.css, Lines 409-423):
```css
.list-row {
  display: grid;
  grid-template-columns: minmax(220px, 1.45fr) minmax(180px, 1fr) minmax(170px, 0.9fr) 120px;
  gap: 14px;
  align-items: start;
  padding: 18px 20px;
  background: rgba(255,250,244,0.88);
  border: 1px solid var(--line);
  border-radius: 18px;
  box-shadow: var(--shadow);
}

.study-list-row {
  background: linear-gradient(135deg, rgba(255, 247, 232, 0.92), rgba(244, 251, 248, 0.92));
}
```

### Example Box Styling (styles.css, Lines 433-458):
```css
.example-box {
  margin-top: 10px;
  padding: 12px 14px;
  border-radius: 14px;
  background: rgba(255,255,255,0.68);
  border: 1px solid rgba(53, 37, 28, 0.08);
}

.example-label {
  display: inline-flex;
  margin-bottom: 6px;
  padding: 4px 8px;
  border-radius: 999px;
  font-size: 11px;
  font-weight: 800;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  background: rgba(29, 107, 98, 0.1);
  color: var(--accent-2);
}

.example-text {
  font-size: 14px;
  line-height: 1.6;
  color: var(--ink);
}
```

---

## 8. **How Templates Are Organized**

### Template Organization Strategy:
1. **By Letter Type** (Writing Task 1):
   - Each type gets dedicated template sentences
   - Vietnamese descriptions explain when/how to use
   - Examples show practical usage

2. **By Essay Structure** (Writing Task 2):
   - **Introduction**: Topic introduction and thesis
   - **Body**: How to structure paragraphs for each essay type
   - **Conclusion**: How to wrap up arguments
   - **Transitions**: Linking phrases between ideas

3. **Color-Coded in UI**:
   - Writing Task 1: ✉️ icon (letters)
   - Writing Task 2: 📝 icon (essays)
   - Both use special "study-list-row" gradient styling

### Priority System for Templates:
- All writing templates have `type: "study"` (not scored like vocabulary)
- Score determined by theme: Grammar=10, Linking-words=9, Writing tasks use fixed scoring
- `bandLabel` shows "80/20 Grammar" or "80/20 Linker" indicating essential templates
- `skillTags` indicate context: Speaking, Writing, Khung câu, Từ nối, etc.

---

## 9. **Responsive Design**

### Mobile Adjustments (styles.css, ~750-850):
- **Desktop**: 320px sidebar + main content
- **Tablet (≤980px)**: Sidebar becomes mobile drawer, theme list in drawer
- **Mobile (<768px)**: 
  - Single column layout
  - Bottom navigation bar for view switching
  - List rows stack to single column
  - Drawer for theme selection

---

## Summary: Key Code Snippets for Integration

### To Identify Writing Tasks:
```javascript
isListOnlyTheme(themeOrId)  // Returns true for "writing-task1", "writing-task2"
```

### To Access Writing Templates:
```javascript
// vocab-data.js contains all 40+ letter templates in VSTEP_VOCAB[index with id="writing-task1"]
// and all 30+ essay templates in VSTEP_VOCAB[index with id="writing-task2"]
```

### To Render Writing Task Templates (Current):
```javascript
renderList(words)  // Automatically called and shows in special list-only view
```

### Theme Data Structure:
```javascript
{
  "id": "writing-task1" or "writing-task2",
  "icon": "✉️" or "📝",
  "title": English title,
  "viTitle": Vietnamese title,
  "description": "Mẫu câu, cấu trúc và cụm từ...",
  "words": [/* template objects */]
}
```

---

## Conclusion

The codebase implements a focused vocabulary learning system with special handling for writing templates:

1. **Writing templates** are stored in `vocab-data.js` under "writing-task1" and "writing-task2" themes
2. **Display mode** ("học theo cụm") is enforced through `isListOnlyTheme()` check
3. **List view rendering** (`renderList()`) displays templates with examples in a 4-column layout
4. **Special styling** distinguishes templates with gradient backgrounds and example boxes
5. **No routing system** - theme selection drives view changes and data filtering
6. **Component files** are minimal: index.html (structure), app.js (logic), styles.css (styling)

