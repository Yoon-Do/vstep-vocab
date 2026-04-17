# Quick Reference: Writing Templates Implementation

## File Locations Summary

| Feature | File | Lines | Purpose |
|---------|------|-------|---------|
| Letter templates (viết thư) | `vocab-data.js` | 4578-4830 | 40+ template sentences for 9 letter types |
| Essay templates (viết luận) | `vocab-data.js` | 4833-5056 | 30+ structures for 6 essay types |
| List-only theme check | `app.js` | 182-185 | Identify which themes use "học theo cụm" mode |
| View switching logic | `app.js` | 236-258 | Force list view for writing tasks |
| List rendering | `app.js` | 435-479 | Render templates in 4-column layout |
| CSS list styling | `styles.css` | 409-423 | Grid layout and gradient styling |
| Example box styling | `styles.css` | 433-458 | Example presentation |
| HTML structure | `index.html` | 89-91 | Containers for cards/list/quiz views |

---

## Data Structure Examples

### Letter Template Example (Task 1)
```javascript
{
  "en": "I am writing to provide you with some information about…",
  "vi": "Mở đầu thư cung cấp thông tin (formal).",
  "type": "study",
  "example": "I am writing to provide you with some information about the upcoming event."
}
```

**Rendered as:**
```
┌─────────────────────────────────────────────────────────┐
│ EN: "I am writing to provide you with..."               │
│ ✉️ Viết thư                                             │
├─────────────────────────────────────────────────────────┤
│ VI: "Mở đầu thư cung cấp thông tin (formal)."          │
│                                                         │
│ Ví dụ                                                   │
│ "I am writing to provide you with some information..."  │
├─────────────────────────────────────────────────────────┤
│ TYPE: study                                             │
│ ★ 80/20 Grammar                                         │
│ Writing Khung câu                                       │
├─────────────────────────────────────────────────────────┤
│ [ ☆ ] [ ○ ]                                             │
└─────────────────────────────────────────────────────────┘
```

### Essay Template Example (Task 2)
```javascript
{
  "en": "On the one hand, the major advantage of… is… This means that…",
  "vi": "Mở đoạn thân bài 1 – dạng Advantages & Disadvantages.",
  "type": "study",
  "example": "On the one hand, the major advantage of online learning is flexibility. This means that students can study at their own pace."
}
```

---

## Key Code Paths

### 1. Detecting Writing Tasks
```javascript
// app.js, Line 182-185
function isListOnlyTheme(themeOrId) {
  const id = typeof themeOrId === "string" ? themeOrId : themeOrId?.id;
  return ["grammar", "linking-words", "writing-task1", "writing-task2"].includes(id);
}
```

### 2. Forcing List View
```javascript
// app.js, Line 236-240
function switchView(nextView) {
  const theme = getThemeById(state.activeTheme);
  const forcedView = isListOnlyTheme(theme) ? "list" : nextView;
  state.view = forcedView;
```

### 3. Rendering Templates
```javascript
// app.js, Line 435-479
function renderList(words) {
  els.listView.innerHTML = words.map((word, index) => {
    const booster = isStudyBoosterTheme(word);
    return `
      <div class="list-row ${booster ? "study-list-row" : ""}">
        <div>
          <div class="en">${word.en}</div>
          <span class="theme-pill">${word.icon} ${word.themeViTitle}</span>
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
          <span class="word-type">study</span>
          <span class="priority-badge">★ ${word.bandLabel}</span>
          ${word.skillTags.map(tag => `<span class="skill-chip">${tag}</span>`).join("")}
        </div>
        <div class="card-actions">
          <button data-action="favorite" data-index="${index}">☆</button>
          <button data-action="master" data-index="${index}">○</button>
        </div>
      </div>
    `;
  }).join("");
}
```

---

## Navigation Flow

```
User selects theme from sidebar
          ↓
[Click theme button] → state.activeTheme = "writing-task1"
          ↓
[render() called] → renderThemes(), getVisibleWords(), renderList()
          ↓
[switchView()] → isListOnlyTheme() = true
          ↓
[Force view to "list"] → Hide cards view, hide quiz, hide shuffle button
          ↓
[Display templates in list format with examples]
```

---

## HTML Containers

```html
<!-- index.html, Lines 89-91 -->
<section id="cardsView" class="cards-grid"></section>
<section id="listView" class="list-view hidden"></section>
<section id="quizView" class="quiz-view hidden"></section>

<!-- All rendered content goes into these sections -->
<!-- For writing tasks, only listView is shown (not hidden) -->
```

---

## CSS Classes Reference

| Class | Purpose | Location |
|-------|---------|----------|
| `.list-row` | Container for one template row | styles.css:409 |
| `.study-list-row` | Gradient styling for "study" templates | styles.css:421 |
| `.example-box` | Container for example sentences | styles.css:433 |
| `.example-label` | "Ví dụ" label styling | styles.css:441 |
| `.example-text` | Example sentence text | styles.css:454 |
| `.theme-pill` | Topic badge (e.g., "✉️ Viết thư") | styles.css |
| `.priority-badge` | "★ 80/20 Grammar" label | styles.css |
| `.skill-chip` | "Writing", "Speaking" tags | styles.css |
| `.word-meta` | Metadata description text | styles.css |

---

## Search & Filter Behavior

Templates can be filtered by:
1. **Search text** (matches English, Vietnamese, or metadata)
2. **Filter chips**:
   - All (default)
   - Priority VSTEP (score >= 5)
   - Unmastered (not in mastered set)
   - Mastered (in mastered set)
   - Favorites (in favorites set)

Sorting: By score descending, then alphabetically

---

## Persistence

User progress is stored in localStorage:
- `vstep-mastered`: Set of mastered template keys
- `vstep-favorites`: Set of favorite template keys
- `vstep-quiz-mode`: Quiz direction (en-vi, vi-en, fill)
- `vstep-wrong`: Wrong answer counts per template

Key format: `"writing-task1::I am writing to..."`

---

## Template Categories

### Writing Task 1 (Viết thư) - 9 Letter Types
1. Informal Information - greeting/casual opening
2. Formal Information - "I am writing to provide..."
3. Request Letter - "Could you let me know...?"
4. Apology Letter - "I am writing to apologize..."
5. Complaint Letter - "I am writing to complain..."
6. Thank-you Letter - "I am writing this letter to extend..."
7. Job Application - "I have recently seen recruitment..."
8. Advice Letter - "I am writing to give you some advice..."
9. Invitation Letter - "I am writing to invite you to..."

### Writing Task 2 (Viết luận) - 6 Essay Types
1. Advantages & Disadvantages (Adv-Dis)
2. Causes & Effects
3. Causes & Solutions
4. Opinion Essay
5. Argumentative Essay
6. Discussion Essay

Each essay type includes:
- Opening sentences
- Body paragraph structures
- Example transitions
- Conclusion templates

---

## UI Differences: Writing vs Regular Vocab

| Feature | Regular Vocab | Writing Templates |
|---------|---------------|-------------------|
| View modes | Cards, List, Quiz | **List only** |
| Flipping | ✅ Card flip | ❌ Disabled |
| Quiz button | ✅ Visible | ❌ Hidden |
| Shuffle button | ✅ Visible | ❌ Hidden |
| Row styling | Plain | **Gradient background** |
| Examples | Optional | **Always shown** |
| Type display | noun, verb, phrase | **"study"** |
| Metadata | Frequency score | Context guidance |

---

## State Management for Writing Tasks

```javascript
state = {
  activeTheme: "writing-task1",      // or "writing-task2"
  view: "list",                      // Always "list" for writing
  search: "",                        // Filter templates
  filter: "all",                     // all|priority|mastered|unmastered|favorites
  mastered: Set([...]),              // Memorized templates
  favorites: Set([...]),             // Bookmarked templates
  // quizMode, shuffledOrders, quiz object are NOT used for writing tasks
}
```

