# 🦹 VILLAIN DOSSIER // Superhero Intelligence Hub

> Classified Superhero Threat Assessment & Surveillance Grid built with **pure Vanilla JavaScript, HTML5, and CSS3** (zero external frameworks or libraries).

---

## 👥 Syndicate Team Roles

| Member | Focus Area | Files Owned |
| :--- | :--- | :--- |
| **Chris** *(You / Lead)* | Data Pipeline, Normalization, State Architecture & Sorting Engine | `js/api.js`, `js/sort.js`, `js/state.js`, `js/app.js`, `tests/test-sorting.js` |
| **Lawrence** | Dynamic Table DOM Generation & Client-Side Pagination Controls | `index.html`, `js/table.js`, `js/pagination.js` |
| **Henry** | Live Search Engine, Villain Terminal Aesthetic, Dossier Modal & URL State | `js/filter.js`, `js/modal.js`, `js/router.js`, `css/style.css` |

---

## ⚡ Chris's Core Implementation Highlights

### 1. Data Pipeline & Sanitization (`js/api.js`)
* Fetches from `https://rawcdn.githack.com/akabab/superhero-api/0.2.0/api/all.json`.
* In-memory caching to avoid redundant network requests.
* **Height Extraction:** Converts strings such as `"203 cm"` or `"61.0 meters"` into integer centimeters (`cm`), handling unit conversions and fallbacks.
* **Weight Extraction:** Converts strings such as `"441 kg"`, `"18 tons"`, or `"90,000 tons"` into integer kilograms (`kg`), removing commas and formatting for numerical accuracy.
* **Missing Value Standardizer:** Unifies `"-"`, `""`, `"0 cm"`, `"0 kg"`, `"- lb"`, `"null"`, and `undefined` into clean `null` / `"-"` models.

### 2. Multi-Type Sorting Engine (`js/sort.js`)
* Supports alphabetical sorting (`String.localeCompare` with natural sorting) and numerical sorting across all columns.
* Default load order: **Name ascending**.
* Header click toggle: First click $\rightarrow$ `asc`, subsequent click $\rightarrow$ `desc`.
* **The Missing Value Invariant:** *Missing values are GUARANTEED to sort last in both ascending AND descending directions.*
* Handles mixed numerical representations: `"78 kg"` is correctly sorted before `"100 kg"`.

### 3. Central Reactive State Management (`js/state.js`)
* Centralized state with a single source of truth (`allHeroes`, `filteredHeroes`, `displayHeroes`, `sort`, `pagination`, `search`, `selectedHeroId`).
* Observer pattern (`subscribe(listener)`) providing reactive updates to table, pagination, search, and modal modules.
* Automatic page reset: Searching or changing page size safely resets the view to Page 1.

---

## 🚀 Running the Project Locally

Because ES6 modules (`type="module"`) are subject to CORS restrictions on local `file://` URLs, serve the folder with any static local server:

```bash
# Option 1: Python
python -m http.server 8000

# Option 2: Node.js (npx)
npx serve .

# Option 3: PHP
php -S localhost:8000
```
Open your browser at `http://localhost:8000`.

---

## 🧪 Automated Testing

A dedicated test suite verifies Chris's data engine, sorting invariant, and state management:

```bash
node tests/test-sorting.js
```

**Verification Checklist in Test Suite:**
* ✅ Standardizing and detecting missing values (`null`, `"-"`, `"0 cm"`, `"0 kg"`)
* ✅ Height parsing (meters $\rightarrow$ cm, imperial $\rightarrow$ cm)
* ✅ Weight parsing (tons $\rightarrow$ kg, lbs $\rightarrow$ kg, comma removal)
* ✅ Numerical comparison (`78 kg` before `100 kg`)
* ✅ Missing values invariant: sorted last in both ASC and DESC
* ✅ Direction toggle logic (`asc` $\leftrightarrow$ `desc`)
* ✅ Full dataset test against all 563 live superhero records
* ✅ State mutation, search filtering, and pagination slicing
