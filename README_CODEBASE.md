# VSTEP Vocabulary Studio - Complete Codebase Documentation

Welcome! This document indexes all codebase exploration materials created for understanding the "viết thư" (letter writing) and "viết luận" (essay writing) features.

## 📚 Documentation Files

This repository now includes three comprehensive documentation files:

### 1. **CODEBASE_ANALYSIS.md** (Main Reference)
Complete analysis covering:
- Project architecture and structure
- "Viết Thư" (Letter Writing) - 9 letter types, 40+ templates
- "Viết Luận" (Essay Writing) - 6 essay types, 30+ structures
- "Học Theo Cụm" (Learning by Clusters) - current display mode implementation
- Template data structures
- File locations and routing logic
- State management and persistence
- CSS styling details
- Full code snippets with line numbers

**Start here for:**
- Complete understanding of writing features
- Data structure specifications
- Display logic implementation

### 2. **QUICK_REFERENCE.md** (Developer Cheat Sheet)
Fast lookup guide with:
- File location table
- Data structure examples
- Key code paths (3 critical functions)
- Navigation flow diagram
- HTML/CSS class reference
- Search & filter behavior
- UI differences between writing vs vocabulary
- Template categories

**Start here for:**
- Quick lookups during development
- Understanding file organization
- CSS class names and purposes
- State management overview

### 3. **ARCHITECTURE.md** (System Design)
Visual diagrams and flows showing:
- System overview diagram
- Data flow architecture
- Theme selection & view routing
- Writing templates data hierarchy
- Rendering pipeline for writing tasks
- Component interaction map
- Key decision points in code
- Mobile responsive flow
- Complete example flow walkthrough
- File dependencies
- Function map

**Start here for:**
- Understanding overall system design
- Following data flows
- Understanding how writing tasks differ from vocabulary
- Mobile responsive design
- Making architectural decisions

## 🎯 Quick Navigation

### Finding Writing Templates
- **Letter templates**: `vocab-data.js` lines 4578-4830 (40+ items)
- **Essay templates**: `vocab-data.js` lines 4833-5056 (30+ items)

### Finding Display Logic
- **List-only check**: `app.js` lines 182-185 (`isListOnlyTheme()`)
- **View switching**: `app.js` lines 236-258 (`switchView()`)
- **List rendering**: `app.js` lines 435-479 (`renderList()`)

### Finding Styling
- **List row grid**: `styles.css` lines 409-423
- **Example boxes**: `styles.css` lines 433-458
- **Study styling**: `styles.css` line 421 (`.study-list-row`)

## 📁 File Structure

```
/Users/namdo/vstep-vocab/
├── app.js                      # Core app logic (835 lines)
├── vocab-data.js               # All data (5057 lines)
├── styles.css                  # All styling (850+ lines)
├── index.html                  # HTML structure
│
├── CODEBASE_ANALYSIS.md        # 📄 Full analysis document
├── QUICK_REFERENCE.md          # 📄 Developer cheat sheet
├── ARCHITECTURE.md             # 📄 System design diagrams
├── README_CODEBASE.md          # 📄 This file
│
├── Writing/                    # Reference materials
│   ├── Task 1 – Letters.docx
│   ├── Task 2 – Essays.docx
│   └── Band Descriptors (PDF)
│
└── references/                 # Study materials
    ├── GIÁO TRÌNH VOCAB.pdf
    ├── Học từ vựng cấp tốc.xlsx
    └── từ vựng.pdf
```

## 🔑 Key Findings

### Writing Features
1. **"Viết Thư" (Task 1)** - Letter Writing
   - Icon: ✉️
   - 9 letter types (Information, Request, Apology, Complaint, Thank-you, Job Application, Advice, Invitation)
   - 40+ essential template sentences
   - Each includes Vietnamese explanation and example usage

2. **"Viết Luận" (Task 2)** - Essay Writing
   - Icon: 📝
   - 6 essay types (Adv-Dis, Causes & Effects, Causes & Solutions, Opinion, Argumentative, Discussion)
   - 30+ structures covering Introduction, Body, Conclusion
   - Examples for each structure type

### Display Mode ("Học Theo Cụm")
1. **Forced List View Only** - No cards or quiz options
2. **4-Column Layout**:
   - English template
   - Vietnamese explanation + Example box
   - Metadata (type, priority, skill tags)
   - Action buttons (favorite, mastered)
3. **Special Styling** - Gradient background to distinguish from vocabulary
4. **Examples Always Shown** - Every template includes practical usage example
5. **No Shuffle/Quiz** - Focus on sequential learning

### Key Code Identifier
```javascript
function isListOnlyTheme(themeOrId) {
  return ["grammar", "linking-words", "writing-task1", "writing-task2"].includes(id);
}
```

## 🚀 Common Tasks

### Task: Find where letters are displayed
1. Check `QUICK_REFERENCE.md` → File Location Table
2. Look in `vocab-data.js` lines 4578-4830
3. See `app.js` `renderList()` function for display logic

### Task: Understand the 4-column layout
1. Read `QUICK_REFERENCE.md` → CSS Classes Reference
2. Check `ARCHITECTURE.md` → Rendering Pipeline diagram
3. Review `styles.css` lines 409-423 for grid definition

### Task: Find essay structure templates
1. Check `CODEBASE_ANALYSIS.md` → Section 2 (Viết Luận)
2. Look in `vocab-data.js` lines 4833-5056
3. See categories: Adv-Dis, Opinion, Argumentative, Discussion

### Task: Add new letter type
1. Follow template format in `QUICK_REFERENCE.md` → Data Structure Examples
2. Add to `vocab-data.js` writing-task1.words array
3. Use existing structure: `{ en: "...", vi: "...", type: "study", example: "..." }`

### Task: Modify display styling
1. Reference `QUICK_REFERENCE.md` → CSS Classes Reference
2. Edit `.study-list-row` class in `styles.css` line 421
3. Or edit `.example-box` styling at line 433

### Task: Understand user flow
1. Read `ARCHITECTURE.md` → Theme Selection & View Routing
2. See complete example at end: Complete Flow for Letter Writing Templates
3. Trace through `app.js` render pipeline

## 📊 Statistics

| Metric | Count |
|--------|-------|
| Total Themes | 23 |
| Writing Task 1 Templates | 40+ |
| Writing Task 2 Templates | 30+ |
| Total Lines (app.js) | 835 |
| Total Lines (vocab-data.js) | 5057 |
| Total Lines (styles.css) | 850+ |
| Letter Types | 9 |
| Essay Types | 6 |
| Key Functions | 8 |

## 🔗 Cross-References

### By Topic:
- **Data Structure**: See CODEBASE_ANALYSIS.md §4 + QUICK_REFERENCE.md §Data Structure Examples
- **Display Logic**: See CODEBASE_ANALYSIS.md §3 + ARCHITECTURE.md §Rendering Pipeline
- **State Management**: See CODEBASE_ANALYSIS.md §6 + QUICK_REFERENCE.md §State Management
- **CSS Layout**: See CODEBASE_ANALYSIS.md §7 + QUICK_REFERENCE.md §CSS Classes
- **Navigation**: See QUICK_REFERENCE.md §Navigation Flow + ARCHITECTURE.md §Theme Selection

### By File:
- **app.js**: CODEBASE_ANALYSIS.md §3, §6 + QUICK_REFERENCE.md §Key Code Paths
- **vocab-data.js**: CODEBASE_ANALYSIS.md §1, §2, §4 + QUICK_REFERENCE.md §Data Structure
- **styles.css**: CODEBASE_ANALYSIS.md §7 + QUICK_REFERENCE.md §CSS Classes
- **index.html**: QUICK_REFERENCE.md §HTML Containers + ARCHITECTURE.md §Component Interaction

## 🎓 Learning Path

**For New Developers:**
1. Start with README_CODEBASE.md (this file)
2. Read QUICK_REFERENCE.md for overview
3. Skim ARCHITECTURE.md for system understanding
4. Deep dive into CODEBASE_ANALYSIS.md for details

**For Feature Development:**
1. Find relevant section in CODEBASE_ANALYSIS.md
2. Use QUICK_REFERENCE.md for code locations
3. Reference ARCHITECTURE.md for data flows
4. Check specific file line numbers

**For Bug Fixes:**
1. Use ARCHITECTURE.md to understand data flow
2. Check CODEBASE_ANALYSIS.md for specific logic
3. Reference QUICK_REFERENCE.md for code locations
4. Use CSS Classes Reference for styling issues

## 💡 Key Insights

1. **Writing templates are special**: They force list-only view, show examples, and have different styling
2. **Data-driven UI**: View mode is determined by theme type, not URL
3. **localStorage persistence**: User progress is saved across sessions
4. **Responsive first**: Design adapts from desktop sidebar to mobile drawer
5. **Modular code**: Separate data (vocab-data.js), logic (app.js), and style (styles.css)
6. **Smart filtering**: Multiple ways to filter templates (search, status, priority)

## 🔍 Quick Code Lookup

| What I Need | Where to Look |
|-------------|---------------|
| Template sentences | `vocab-data.js:4578-4830` (letters) or `4833-5056` (essays) |
| Display logic | `app.js:435-479` (`renderList()`) |
| Writing detection | `app.js:182-185` (`isListOnlyTheme()`) |
| View switching | `app.js:236-258` (`switchView()`) |
| Grid layout | `styles.css:409-423` (`.list-row`) |
| Example styling | `styles.css:433-458` (`.example-box`) |
| State object | `app.js:67-83` |
| Main render | `app.js:823-831` (`render()`) |
| Filter logic | `app.js:187-227` (`getVisibleWords()`) |

## 📖 Full Outline

### CODEBASE_ANALYSIS.md
1. Project Overview
2. "Viết Thư" (Letter Writing) Implementation
3. "Viết Luận" (Essay Writing) Implementation
4. "Học Theo Cụm" Display Mode
5. Template Structure in Data
6. File Structure and Routing
7. Key Implementation Details
8. CSS Styling for List View
9. How Templates Are Organized
10. Responsive Design
11. Summary & Integration Snippets

### QUICK_REFERENCE.md
1. File Locations Summary
2. Data Structure Examples
3. Key Code Paths
4. Navigation Flow
5. HTML Containers
6. CSS Classes Reference
7. Search & Filter Behavior
8. Persistence
9. Template Categories
10. UI Differences
11. State Management

### ARCHITECTURE.md
1. System Overview
2. Data Flow Architecture
3. Theme Selection & View Routing
4. Writing Templates Data Structure
5. Rendering Pipeline for Writing Tasks
6. Component Interaction Map
7. Key Decision Points
8. State Dependencies
9. Mobile Responsive Flow
10. Complete Example Flow
11. File Dependencies
12. Key Functions Map
13. Summary

## ❓ FAQ

**Q: Where are the letter writing templates?**
A: `vocab-data.js` lines 4578-4830, in the theme with `id: "writing-task1"`

**Q: How are templates displayed differently?**
A: Via `isListOnlyTheme()` check in `app.js:182-185`, forcing list-only view with `.study-list-row` styling

**Q: Can I add new templates?**
A: Yes, add to the `words` array following the format: `{ en, vi, type: "study", example }`

**Q: What determines the 4-column layout?**
A: `styles.css:410-411` defines the grid: `grid-template-columns: minmax(220px, 1.45fr) minmax(180px, 1fr) minmax(170px, 0.9fr) 120px`

**Q: How does search work?**
A: `app.js:191-195` filters words by matching against en, vi, type, and other fields

**Q: Is there routing?**
A: No, theme selection (not URL) drives view changes via `state.activeTheme`

## 🎬 Getting Started with Code

```javascript
// Key entry point - see ARCHITECTURE.md for full flow
render() {
  renderThemes();           // Show theme buttons
  const words = getVisibleWords();  // Filter & sort
  renderList(words);        // Generate 4-column layout for writing templates
  switchView(state.view);   // Show/hide views
}

// The "magic" function that identifies writing tasks
function isListOnlyTheme(themeOrId) {
  return ["grammar", "linking-words", "writing-task1", "writing-task2"].includes(id);
}

// Render writing templates
function renderList(words) {
  // Creates <div class="list-row study-list-row"> for each template
  // 4 columns: EN + theme | VI + example | metadata | actions
  // See QUICK_REFERENCE.md for full template
}
```

---

**Last Updated**: April 11, 2026  
**Documentation Version**: 1.0  
**Codebase**: VSTEP Vocabulary Studio

For questions or updates, refer to the three main documentation files:
- CODEBASE_ANALYSIS.md (detailed)
- QUICK_REFERENCE.md (fast lookup)
- ARCHITECTURE.md (system design)

