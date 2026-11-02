# 🦹 VILLAIN DOSSIER // Superhero Intelligence Hub

> Classified Superhero Threat Assessment & Surveillance Grid built with **pure Vanilla JavaScript, HTML5, and CSS3** (zero external frameworks or libraries).

---

## 👥 Syndicate Team Roster & File Ownership

| Member | Focus Area | Files Owned |
| :--- | :--- | :--- |
| **Chris** *(Completed)* | Data Pipeline, Normalization, State Architecture & Sorting Engine | `js/api.js`, `js/sort.js`, `js/state.js`, `js/app.js`, `tests/test-sorting.js` |
| **Lawrence** | Dynamic Table DOM Generation & Client-Side Pagination Controls | `index.html`, `js/table.js`, `js/pagination.js` |
| **Henry** | Live Search Engine, Villain Terminal Aesthetic, Dossier Modal & URL State | `js/filter.js`, `js/modal.js`, `js/router.js`, `css/style.css` |

---

## 📌 Status of Chris's Foundational Work (Already Done & Tested)

Chris has implemented and pushed the core underlying engine to `main`:
1. **`js/api.js`**: Fetches all 563 heroes from Akabab's Superhero API, normalizes nested fields, extracts numerical units (`heightCm`, `weightKg`), converts tons and meters, and unifies missing/empty values (`null`, `"-"`, `"0 cm"`, `"0 kg"`).
2. **`js/sort.js`**: Universal sorting comparator handling natural alphabetical and numerical sorting (`"78 kg"` before `"100 kg"`). **Crucial Rule:** Missing values are guaranteed to sort to the very bottom in both `asc` and `desc` directions.
3. **`js/state.js`**: Central reactive state store with publish/subscribe listener pattern (`subscribe(onStateChange)`), coordinating search, sort, and pagination.
4. **`tests/test-sorting.js`**: 60 automated unit tests passing 100% (`node tests/test-sorting.js`).

---

## 🛠️ Instructions for Lawrence: Table Rendering & Pagination

**Assigned Files:** `index.html`, `js/table.js`, `js/pagination.js`

### 🎯 Lawrence's Objectives
Lawrence is responsible for rendering the confidential intelligence grid inside the semantic `<table>` element and implementing the client-side pagination system.

### 📋 Lawrence's Task Checklist

#### 1. Table DOM Generation (`js/table.js`)
* [ ] **Required Table Columns:** Ensure every row dynamically renders all 10 required fields from the subject:
  1. **Icon:** Render `.images.xs` inside an `<img>` tag (displayed as an image, not text). Include fallback handling for broken images.
  2. **Name:** `.name`
  3. **Full Name:** `.biography.fullName`
  4. **Powerstats:** Each entry from `.powerstats` (`intelligence`, `strength`, `speed`, `durability`, `power`, `combat`).
  5. **Race:** `.appearance.race`
  6. **Gender:** `.appearance.gender`
  7. **Height:** Metric/imperial display (`.appearance.heightDisplay`).
  8. **Weight:** Metric/imperial display (`.appearance.weightDisplay`).
  9. **Place of Birth:** `.biography.placeOfBirth`
  10. **Alignment:** `.biography.alignment` (good, bad, or neutral).
* [ ] **Performance & Batching:**
  * Use `document.createDocumentFragment()` to batch table row appends so the DOM is not updated inside a loop.
  * Render only the current slice of heroes (`state.displayHeroes`), never all 563 at once unless "all" is selected.
* [ ] **Column Header Sorting Triggers:**
  * Ensure every sortable `<th>` has a `data-sort="<columnName>"` attribute matching the fields in `js/sort.js`.
  * Add click and keyboard (`Enter`/`Space`) event listeners that invoke `setSort(column)` from `js/state.js`.
  * Update sort indicators (`▲` for ascending, `▼` for descending, `⇅` for inactive).
* [ ] **Row Click Event:**
  * Attach a click listener on each `<tr>` to call `setSelectedHeroId(hero.id)` to trigger Henry's Dossier Modal.

#### 2. Client-Side Pagination System (`js/pagination.js`)
* [ ] **Page Size Selector (`<select id="pageSizeSelect">`):**
  * Options: **10**, **20** *(default)*, **50**, **100**, and **all**.
  * On change, call `setPageSize(value)` from `js/state.js`.
* [ ] **Navigation Buttons:**
  * Implement `First` (`«`), `Prev` (`‹`), `Next` (`›`), and `Last` (`»`).
  * On click, call `setPage(targetPage)` from `js/state.js`.
  * Disable `First` and `Prev` when on Page 1.
  * Disable `Next` and `Last` when on the final page (`currentPage >= totalPages`).
* [ ] **Dynamic Numeric Page Buttons:**
  * Render a sliding window of page numbers (e.g. 5 buttons around the current page).
  * Mark the active page with `.active` and `aria-current="page"`.
* [ ] **Page Counter & Target Summary:**
  * Display current position: e.g. `"Page 1 of 29"`.
  * Display total filtered targets: e.g. `"563 targets identified"`.

---

## 🛠️ Instructions for Henry: Live Search, Villain UI/UX, Modal & URL State

**Assigned Files:** `js/filter.js`, `js/modal.js`, `js/router.js`, `css/style.css`

### 🎯 Henry's Objectives
Henry is responsible for the instant live search filtering, the Supervillain Command Center aesthetic, the high-resolution confidential dossier modal, and URL parameter persistence.

### 📋 Henry's Task Checklist

#### 1. Live Search Engine (`js/filter.js`)
* [ ] **Instant Keystroke Filtering:**
  * Listen to the `input` event on `#searchInput`. Filtering must happen immediately as the user types without requiring any submit button.
  * Case-insensitive substring matching: e.g. typing `"man"` matches `"Batman"`, `"Spider-Man"`, `"Mandarin"`, etc.
  * On every input change, call `setSearch(query, field, operator)` from `js/state.js`. (The state automatically resets `currentPage` to 1).
  * Add a clear button (`✕`) to quickly reset the search input.
* [ ] **Search Bonus Operators (`#searchField` & `#searchOperator`):**
  * Target field selection: `name` (default), `fullName`, `race`, `alignment`, `placeOfBirth`, `height`, `weight`, or `all`.
  * Match operators:
    * `include`: Substring match.
    * `exclude`: Inverted filter (matches records not containing the query).
    * Numerical operators for `height` and `weight`: Greater than (`>`), Less than (`<`), Equals (`=`), Not Equal (`!=`).

#### 2. Hero Dossier Detail Modal (`js/modal.js`)
* [ ] **Confidential Dossier Overlay:**
  * Triggered when `state.selectedHeroId` is set (on table row click or URL deep-link).
  * Render a modal or drawer displaying:
    * High-resolution portrait (`.images.lg` or `.images.md`).
    * Full identity header: Hero Name, Full Name, and "CONFIDENTIAL DOSSIER" stamp.
    * Powerstats threat assessment matrix with visual gauge bars (0-100%).
    * Full biographical archive: aliases, alter egos, place of birth, first appearance, publisher, alignment.
    * Biometric specs: race, gender, height, weight, eye color, hair color.
    * Operational profile: occupation, base of operations, group affiliations, relatives.
* [ ] **Accessible Closing:**
  * Close when clicking the `✕` close button.
  * Close when clicking the outside backdrop overlay.
  * Close on pressing the `Escape` key (`window.addEventListener('keydown', ...)`).
  * Closing invokes `setSelectedHeroId(null)`.

#### 3. Villain Command Terminal UI/UX (`css/style.css`)
* [ ] **Aesthetic Theme:**
  * Supervillain / Nemesis dark intelligence console: deep dark palette (`#070a12`, `#101728`), glowing cyber accents (toxic green `#10b981`, cyber cyan `#06b6d4`, alert crimson `#ef4444`, warning amber `#f59e0b`).
  * Monospace typography (`Fira Code`) for numerical data, coordinates, and metrics.
* [ ] **Visual Cues & Polish:**
  * Alignment badges: Red/Crimson for villains, Green for heroes, Slate/Gray for neutral.
  * Powerstat meter mini-tracks in table cells showing relative strength.
  * Sticky table headers (`position: sticky; top: 0`) that stay visible while scrolling vertically.
  * Smooth table row hover effects and clear empty-state messaging when no targets match.

#### 4. URL State Persistence (`js/router.js` - Bonus)
* [ ] **Bi-directional Query Parameter Sync:**
  * Reflect active search query, selected filter field, sort column, sort direction, page size, current page, and open hero modal in `window.location.search`.
  * Example: `?q=bat&field=name&sort=height&dir=desc&page=2&hero=70`.
  * Use `history.replaceState` so browser history isn't flooded during live typing.
* [ ] **State Restoration on Load:**
  * When a user opens or bookmarks a link with query parameters, `restoreStateFromURL()` reads them and initializes the state so the exact view is restored.

---

## 🔄 Interaction Contract (How Lawrence, Henry & Chris Connect)

```
[User Types in Search (Henry)]       [User Clicks Header (Lawrence)]     [User Clicks Page (Lawrence)]
                 \                                |                                /
                  \                               |                               /
                   v                              v                              v
            setSearch(...)                  setSort(...)                   setPage(...)
                                                  |
                                                  v
                                     [Central state.js (Chris)]
                                                  |
                               Recomputes Filter -> Sort -> Slice
                                                  |
                                                  v
                                    notifyListeners(newState)
                                        /                   \
                                       v                     v
                        renderTable(...) (Lawrence)   renderModal(...) (Henry)
                        renderPagination(...) (Lawrence) syncURLWithState() (Henry)
```

---

## 🚀 Getting Started & Local Development

### 1. Pull Latest Code
```bash
git checkout main
git pull origin main
```

### 2. Start a Local Server
Because ES6 modules use `type="module"`, serve with any static web server:
```bash
# Python
python -m http.server 8000

# Node.js
npx serve .
```
Navigate to `http://localhost:8000`.

### 3. Run Automated Tests
```bash
node tests/test-sorting.js
```

---

## 🌿 Git Branching Workflow for Lawrence & Henry

1. **Create your feature branch:**
   ```bash
   # Lawrence:
   git checkout -b feat/lawrence-table-pagination

   # Henry:
   git checkout -b feat/henry-search-ui-modal
   ```
2. **Work on your assigned files** and test in the browser.
3. **Commit your changes with clear messages:**
   ```bash
   git add .
   git commit -m "feat(ui): implement dynamic table rendering and page size selector"
   ```
4. **Push your branch to the remote repository:**
   ```bash
   git push -u origin <your-branch-name>
   ```
5. **Merge into `main`** after reviewing.
