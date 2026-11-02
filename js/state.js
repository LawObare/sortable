/**
 * state.js - Centralized Reactive State Management
 * Author: Chris (Lead Data & Sorting Architect)
 * 
 * Provides a single source of truth for the entire application.
 * Manages search, sort, pagination, and selected hero states with a
 * publish-subscribe listener mechanism to update the DOM reactively.
 */

import { sortHeroes, getNextSortDirection } from './sort.js';

const initialState = {
  allHeroes: [],          // Full list of normalized heroes
  filteredHeroes: [],     // Heroes after applying search query/filter
  displayHeroes: [],      // Heroes on the current page slice
  loading: false,
  error: null,
  search: {
    query: '',
    field: 'name',        // 'name' | 'fullName' | 'race' | 'alignment' | 'all'
    operator: 'include',  // 'include' | 'exclude' | 'fuzzy' | 'gt' | 'lt' | 'eq'
  },
  sort: {
    column: 'name',       // Default column
    direction: 'asc',     // Default direction
  },
  pagination: {
    currentPage: 1,
    pageSize: 20,         // Options: 10, 20, 50, 100, or 'all'
    totalPages: 1,
    totalResults: 0,
  },
  selectedHeroId: null,   // Hero ID currently open in the detail modal
};

let state = { ...initialState };
const listeners = new Set();

/**
 * Returns a read-only snapshot of current application state.
 * @returns {Object}
 */
export function getState() {
  return state;
}

/**
 * Registers a subscriber function that will be invoked whenever state changes.
 * @param {Function} listener - Callback taking (newState)
 * @returns {Function} Unsubscribe function
 */
export function subscribe(listener) {
  if (typeof listener === 'function') {
    listeners.add(listener);
    // Immediately invoke listener with current state
    try {
      listener(state);
    } catch (err) {
      console.error('Error in initial state listener:', err);
    }
  }
  return () => {
    listeners.delete(listener);
  };
}

/**
 * Notifies all subscribed listeners of the state update.
 */
function notifyListeners() {
  for (const listener of listeners) {
    try {
      listener(state);
    } catch (err) {
      console.error('Error invoking state listener:', err);
    }
  }
  // Also dispatch a DOM custom event for loose coupling
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('dossier:statechange', { detail: state }));
  }
}

/**
 * Internal computation engine: runs filter -> sort -> pagination slice
 * Ensures consistency across all UI components.
 */
function recomputeDisplay() {
  // 1. Filter heroes based on state.search
  const { query, field, operator } = state.search;
  let filtered = [...state.allHeroes];

  if (query && query.trim() !== '') {
    const q = query.trim().toLowerCase();

    filtered = filtered.filter(hero => {
      // Numerical comparisons for height or weight if operator is numerical
      if (['gt', 'lt', 'eq', 'neq'].includes(operator) && (field === 'height' || field === 'weight')) {
        const targetVal = parseFloat(q);
        if (isNaN(targetVal)) return true;
        const heroVal = field === 'height' ? hero.appearance?.heightCm : hero.appearance?.weightKg;
        if (heroVal === null || heroVal === undefined) return false;

        if (operator === 'gt') return heroVal > targetVal;
        if (operator === 'lt') return heroVal < targetVal;
        if (operator === 'eq') return heroVal === targetVal;
        if (operator === 'neq') return heroVal !== targetVal;
      }

      // String-based comparisons
      let valueToTest = '';
      if (field === 'all') {
        valueToTest = `${hero.name} ${hero.biography?.fullName || ''} ${hero.appearance?.race || ''} ${hero.biography?.alignment || ''} ${hero.biography?.placeOfBirth || ''}`.toLowerCase();
      } else if (field === 'fullName') {
        valueToTest = (hero.biography?.fullName || '').toLowerCase();
      } else if (field === 'race') {
        valueToTest = (hero.appearance?.race || '').toLowerCase();
      } else if (field === 'alignment') {
        valueToTest = (hero.biography?.alignment || '').toLowerCase();
      } else if (field === 'placeOfBirth') {
        valueToTest = (hero.biography?.placeOfBirth || '').toLowerCase();
      } else {
        // Default: match by name
        valueToTest = (hero.name || '').toLowerCase();
      }

      if (operator === 'exclude') {
        return !valueToTest.includes(q);
      }
      // Default: 'include' or 'fuzzy'
      return valueToTest.includes(q);
    });
  }

  // 2. Sort filtered heroes
  const sorted = sortHeroes(filtered, state.sort.column, state.sort.direction);

  // 3. Compute pagination
  const totalResults = sorted.length;
  let pageSize = state.pagination.pageSize;
  let effectivePageSize = pageSize === 'all' ? (totalResults || 1) : parseInt(pageSize, 10);
  if (isNaN(effectivePageSize) || effectivePageSize < 1) effectivePageSize = 20;

  const totalPages = Math.max(1, Math.ceil(totalResults / effectivePageSize));
  let currentPage = state.pagination.currentPage;
  if (currentPage > totalPages) currentPage = totalPages;
  if (currentPage < 1) currentPage = 1;

  // 4. Slice for display
  let displayHeroes = [];
  if (pageSize === 'all') {
    displayHeroes = sorted;
  } else {
    const startIndex = (currentPage - 1) * effectivePageSize;
    displayHeroes = sorted.slice(startIndex, startIndex + effectivePageSize);
  }

  state = {
    ...state,
    filteredHeroes: sorted,
    displayHeroes,
    pagination: {
      ...state.pagination,
      currentPage,
      totalPages,
      totalResults,
    },
  };
}

/**
 * Initializes the full dataset from fetched heroes.
 * Sets default sort by 'name' ascending and resets page to 1.
 * @param {Array<Object>} heroes
 */
export function setHeroes(heroes) {
  state = {
    ...state,
    allHeroes: Array.isArray(heroes) ? heroes : [],
    loading: false,
    error: null,
    pagination: {
      ...state.pagination,
      currentPage: 1,
    },
  };
  recomputeDisplay();
  notifyListeners();
}

/**
 * Updates search query and triggers instant live filtering.
 * Automatically resets current page to 1.
 * @param {string} query
 * @param {string} [field]
 * @param {string} [operator]
 */
export function setSearch(query, field, operator) {
  state = {
    ...state,
    search: {
      query: typeof query === 'string' ? query : state.search.query,
      field: field || state.search.field,
      operator: operator || state.search.operator,
    },
    pagination: {
      ...state.pagination,
      currentPage: 1,
    },
  };
  recomputeDisplay();
  notifyListeners();
}

/**
 * Toggles or updates sort column and direction.
 * If column matches active column, direction is toggled; otherwise resets to 'asc'.
 * @param {string} column
 * @param {'asc'|'desc'} [explicitDirection]
 */
export function setSort(column, explicitDirection) {
  const direction = explicitDirection || getNextSortDirection(state.sort.column, state.sort.direction, column);

  state = {
    ...state,
    sort: {
      column,
      direction,
    },
  };
  recomputeDisplay();
  notifyListeners();
}

/**
 * Updates the current pagination page.
 * @param {number} page
 */
export function setPage(page) {
  const targetPage = Math.max(1, Math.min(page, state.pagination.totalPages));
  if (targetPage !== state.pagination.currentPage) {
    state = {
      ...state,
      pagination: {
        ...state.pagination,
        currentPage: targetPage,
      },
    };
    recomputeDisplay();
    notifyListeners();
  }
}

/**
 * Updates page size (10, 20, 50, 100, or 'all').
 * Automatically resets current page to 1.
 * @param {number|'all'} pageSize
 */
export function setPageSize(pageSize) {
  state = {
    ...state,
    pagination: {
      ...state.pagination,
      pageSize,
      currentPage: 1,
    },
  };
  recomputeDisplay();
  notifyListeners();
}

/**
 * Sets the selected hero ID for the detail view modal.
 * @param {number|null} id
 */
export function setSelectedHeroId(id) {
  state = {
    ...state,
    selectedHeroId: id,
  };
  notifyListeners();
}

/**
 * Sets loading state indicator.
 * @param {boolean} loading
 */
export function setLoading(loading) {
  state = { ...state, loading: Boolean(loading) };
  notifyListeners();
}

/**
 * Sets error state message.
 * @param {string|null} error
 */
export function setError(error) {
  state = { ...state, error, loading: false };
  notifyListeners();
}
