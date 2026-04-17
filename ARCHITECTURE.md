# VSTEP Vocabulary Studio - Architecture Diagram

## System Overview

```
┌─────────────────────────────────────────────────────────────────────┐
│                      VSTEP Vocabulary Studio                        │
│                   (Single Page Application)                          │
└─────────────────────────────────────────────────────────────────────┘
         ▲                          ▲                         ▲
         │                          │                         │
    HTML Structure            JavaScript Logic           CSS Styling
    ├─ index.html              ├─ app.js              ├─ styles.css
    │  • Sidebar                │  • State management  │  • Layout
    │  • Main content           │  • Event listeners   │  • Colors
    │  • View containers        │  • Rendering        │  • Animations
    │  • Mobile nav             │  • Search/filter    │  • Responsive
    │                           │  • Quiz logic       │
    │                           │                    │
    │                           ├─ vocab-data.js      │
    │                           │  • 23 themes        │
    │                           │  • 70+ writing temps │
    │                           │  • Vocabulary data  │
    │                           │                    │
    │                           └─ localStorage API
    │                              • Mastered/Fav
    │                              • Quiz stats
    │                              • Settings
    │
    └─────────────────────────────────────────────────────────────────
```

## Data Flow Architecture

```
User Interaction
      │
      ▼
┌─────────────────────────────────────────┐
│   Event Listener (Click, Input)         │
│   • Theme selection                     │
│   • View switching                      │
│   • Search/filter                       │
│   • Mark mastered/favorite              │
└─────────────────────────────────────────┘
      │
      ▼
┌─────────────────────────────────────────┐
│   State Update                          │
│   • activeTheme                         │
│   • search text                         │
│   • filter value                        │
│   • view mode                           │
└─────────────────────────────────────────┘
      │
      ▼
┌─────────────────────────────────────────┐
│   Business Logic                        │
│   • getVisibleWords()                   │
│   • Filtering                           │
│   • Sorting                             │
│   • isListOnlyTheme() check             │
└─────────────────────────────────────────┘
      │
      ▼
┌─────────────────────────────────────────┐
│   Rendering                             │
│   • renderThemes()                      │
│   • renderList()   ← For writing        │
│   • renderCards()  ← For vocab          │
│   • renderQuiz()                        │
│   • switchView()                        │
└─────────────────────────────────────────┘
      │
      ▼
┌─────────────────────────────────────────┐
│   Persistence                           │
│   • persist() → localStorage            │
└─────────────────────────────────────────┘
      │
      ▼
   DOM Update
   (Visual output to user)
```

## Theme Selection & View Routing

```
SIDEBAR: Theme List
│
├─ Grammar
├─ Linking Words
├─ Phrasal Verbs
│
├─ Writing Task 1 (✉️ Viết thư) ──────┐
│  • 9 letter types                   │
│  • 40+ template sentences           │
│  • Forced LIST view                 │
│  • Example boxes shown              │
│  • No quiz/shuffle                  │
│                                     │
├─ Writing Task 2 (📝 Viết luận) ─────┤ ► isListOnlyTheme() = true
│  • 6 essay types                    │
│  • 30+ structures                   │
│  • Forced LIST view                 │
│  • Example boxes shown              │
│  • No quiz/shuffle                  │
│                                     │
└─ Vocabulary Themes                  ◄─ For all other themes
   (Environment, Education, etc.)       isListOnlyTheme() = false
   • 3 view modes (Cards/List/Quiz)
   • Shuffle available
   • Quiz enabled
```

## Writing Templates Data Structure

```
VOCABULARY DATA (vocab-data.js)
│
└─ VSTEP_VOCAB = [...]  // 23 theme objects
   │
   ├─ { id: "writing-task1", icon: "✉️", viTitle: "Viết thư", ... }
   │  └─ words: [
   │     {
   │       en: "I am writing to provide you with some information about…",
   │       vi: "Mở đầu thư cung cấp thông tin (formal).",
   │       type: "study",
   │       example: "I am writing to provide you with some information about the upcoming event."
   │     },
   │     { ... } ─→ 40+ items organized by letter type
   │  ]
   │
   ├─ { id: "writing-task2", icon: "📝", viTitle: "Viết luận", ... }
   │  └─ words: [
   │     {
   │       en: "On the one hand, the major advantage of… is…",
   │       vi: "Mở đoạn thân bài 1 – dạng Advantages & Disadvantages.",
   │       type: "study",
   │       example: "On the one hand, the major advantage of online learning is flexibility."
   │     },
   │     { ... } ─→ 30+ items organized by essay type
   │  ]
   │
   └─ All other themes (Grammar, Linking Words, Vocabulary topics)
```

## Rendering Pipeline for Writing Tasks

```
1. User clicks "✉️ Viết thư" theme
   ▼
2. Click Handler (app.js line 274)
   state.activeTheme = "writing-task1"
   ▼
3. render() called (app.js line 831)
   ├─ renderThemes()
   │  └─ Highlight active theme button
   │
   ├─ getVisibleWords()
   │  └─ Fetch & filter writing templates from vocab-data.js
   │
   ├─ renderSummary()
   │  └─ Update statistics
   │
   ├─ renderCards()
   │  └─ (Creates HTML, but will be hidden)
   │
   ├─ renderList()
   │  └─ Generate 4-column layout with examples
   │     ┌────────────────────────────────────────┐
   │     │ 1. Template (EN)   │ 2. Translation (VI)    │ 3. Metadata │ 4. Actions │
   │     │                    │    + Example Box       │             │            │
   │     │ ✉️ Viết thư        │ "Ví dụ" "Example text" │ ★ Priority  │ ☆ ○        │
   │     │                    │                        │ Writing     │            │
   │     │                    │                        │ Khung câu   │            │
   │     └────────────────────────────────────────┘
   │     └─ 4-column grid with study-list-row gradient
   │
   ├─ renderQuiz()
   │  └─ (Creates HTML, but will be hidden)
   │
   └─ switchView()
      ├─ isListOnlyTheme("writing-task1") = true
      ├─ Set state.view = "list"
      ├─ Hide: cardsView, quizView, shuffleBtn, toggleQuizBtn
      ├─ Show: listView
      └─ Update view switch buttons (only "Danh sách" visible)
      
4. DOM renders only listView visible
   ▼
5. User sees writing templates with examples
   ▼
6. User can:
   • Search templates by keyword
   • Filter by status (Mastered/Unmastered/Favorites)
   • Click ☆ to save favorite
   • Click ○ to mark mastered
   • All updates stored in localStorage
```

## Component Interaction Map

```
┌─────────────────────────────────────────────────────────┐
│                    HTML Structure                        │
│  ├─ #sidebar (themes list)                              │
│  ├─ #searchInput                                        │
│  ├─ #filterChips                                        │
│  ├─ #viewSwitch (Cards/List/Quiz buttons)               │
│  ├─ #cardsView (flashcards)                             │
│  ├─ #listView  ←← Writing templates render here         │
│  └─ #quizView                                           │
└─────────────────────────────────────────────────────────┘
            ▲                              ▲
            │                              │
    Populated by                   Styled by
            │                              │
┌─────────────────────┐       ┌──────────────────────┐
│   app.js            │       │   styles.css         │
│                     │       │                      │
│ • render()          │       │ .list-row            │
│ • renderList()      │       │ .study-list-row      │
│ • renderThemes()    │       │ .example-box         │
│ • Event listeners   │       │ .example-label       │
│ • State management  │       │ .theme-pill          │
│ • Filtering/sort    │       │ Responsive breakpts  │
└─────────────────────┘       └──────────────────────┘
            ▲
            │
    Uses data from
            │
┌─────────────────────────────────────┐
│   vocab-data.js                     │
│                                     │
│   VSTEP_VOCAB = [                   │
│     { id: "writing-task1", ... },   │
│     { id: "writing-task2", ... },   │
│     { id: "grammar", ... },         │
│     { id: "environment", ... },     │
│     ... 19 more themes              │
│   ]                                 │
└─────────────────────────────────────┘
```

## Key Decision Points in Code

```javascript
User Action → isListOnlyTheme(themeId) decision
                    │
                    ├─ TRUE (for: grammar, linking-words, writing-task1, writing-task2)
                    │  └─ switchView("list")
                    │     ├─ Hide cards, quiz, shuffle buttons
                    │     ├─ Disable view switching to other modes
                    │     └─ Render with study-list-row styling
                    │
                    └─ FALSE (for: all vocabulary themes)
                       └─ switchView(nextView) where nextView can be:
                          ├─ "cards" (flashcard view with flipping)
                          ├─ "list" (plain list view)
                          └─ "quiz" (quiz mode)
```

## State Dependencies

```
Global State (app.js)
│
├─ activeTheme ──────→ Determines which words are shown
│                     └─→ Determines available views
│
├─ view ─────────────→ Which container is visible
│                     └─→ Hidden/shown by switchView()
│
├─ search ───────────→ Filters words by keyword
│
├─ filter ───────────→ Status filter (priority, mastered, etc.)
│
├─ mastered (Set) ───→ localStorage persistence
│
├─ favorites (Set) ──→ localStorage persistence
│
└─ wrongCounts ──────→ localStorage persistence
                       (Not used for writing tasks)
```

## Mobile Responsive Flow

```
Desktop (>980px)
├─ Sidebar fixed left (320px)
├─ Main content right
└─ List rows: 4 columns

Tablet (980px - 768px)
├─ Sidebar becomes drawer
├─ Drawer toggle button visible
└─ List rows: 3 columns

Mobile (<768px)
├─ Sidebar: full-screen drawer with swipe-down close
├─ Bottom navigation: Cards, List, Quiz, Themes
└─ List rows: 1 column (stacked)
   ├─ Template (EN)
   ├─ Translation (VI) + Example
   ├─ Metadata
   └─ Actions
```

## Example: Complete Flow for Letter Writing Templates

```
Initial Load
    ▼
Display theme list with "✉️ Viết thư" button
    │
    │ [User clicks "✉️ Viết thư"]
    │
    ▼
state.activeTheme = "writing-task1"
    │
    ▼
getVisibleWords()
├─ Find theme with id="writing-task1"
├─ Fetch 40+ template words
├─ Apply search filter (if any)
└─ Sort by priority
    │
    ▼
renderList(words) generates:
    │
    ├─ For each template:
    │  ├─ <div class="list-row study-list-row">
    │  ├─ Left column: EN template + theme pill
    │  ├─ Middle column: VI description + example box
    │  ├─ Right-middle: Type/badge/tags/meta
    │  └─ Right column: Action buttons
    │
    └─ Append to #listView
    │
    ▼
switchView() checks isListOnlyTheme("writing-task1")
├─ Result: TRUE
├─ Hide #cardsView
├─ Hide #quizView
├─ Hide shuffle button
├─ Hide quiz button
├─ Show #listView
└─ Update view switch buttons
    │
    ▼
DOM renders
    │
    ▼
User sees:
┌──────────────────────────────────────────────────┐
│ How have you been recently?                      │
│ ✉️ Viết thư                                      │
├──────────────────────────────────────────────────┤
│ Mở đầu thư thân mật – hỏi thăm.                 │
│                                                  │
│ Ví dụ                                            │
│ "How have you been recently? I am fine and..."   │
├──────────────────────────────────────────────────┤
│ study                                            │
│ ★ 80/20 Grammar                                  │
│ Speaking Writing Khung câu                       │
├──────────────────────────────────────────────────┤
│ [ ☆ ] [ ○ ]                                      │
└──────────────────────────────────────────────────┘
```

## File Dependencies

```
index.html
    ├─ loads app.js
    ├─ loads vocab-data.js
    └─ loads styles.css

app.js (835 lines) depends on:
    ├─ vocab-data.js (for VSTEP_VOCAB array)
    ├─ localStorage API
    └─ DOM elements from index.html

vocab-data.js (5057 lines) is:
    └─ Standalone data file
       (sets window.VSTEP_VOCAB)

styles.css (850+ lines) applies to:
    └─ All elements in index.html
```

## Key Functions Map

| Function | Location | Purpose | Used For |
|----------|----------|---------|----------|
| `isListOnlyTheme()` | app.js:182 | Identify writing-only themes | Decide if list view should be forced |
| `switchView()` | app.js:236 | Change active view | Toggle between cards/list/quiz and hide UI elements |
| `getVisibleWords()` | app.js:187 | Filter & sort words | Get words for current theme with search/filters applied |
| `renderList()` | app.js:435 | Render list view | Generate 4-column template layout with examples |
| `renderThemes()` | app.js:260 | Render sidebar | Display theme buttons with active state |
| `render()` | app.js:823 | Full re-render | Main orchestration function |
| `withThemeWords()` | app.js:158 | Enrich words | Add theme info and computed scores to each word |
| `persist()` | app.js:229 | Save state | Write mastered/favorites to localStorage |

---

## Summary

This architecture demonstrates:
1. **Separation of Concerns**: Data (vocab-data.js), Logic (app.js), Style (styles.css)
2. **Progressive Enhancement**: Works without JavaScript for HTML structure
3. **Smart Routing**: Theme selection determines view, not URL routing
4. **Conditional UI**: Writing tasks get special treatment via `isListOnlyTheme()` check
5. **Responsive Design**: Mobile drawer, bottom nav, responsive grid
6. **Persistence**: localStorage keeps user progress across sessions
7. **Real-time Filtering**: Search and filters update instantly

