/**
 * filter.js - Live Search & Filter Operator Engine
 * Module for Henry (Search, Villain UI & Modal Specialist)
 * Integrated with Chris's state management.
 */

import { getState, setSearch } from './state.js';

/**
 * Initializes the live search input, field selector, and operator controls.
 */
export function initSearch() {
  const searchInput = document.getElementById('searchInput');
  const searchField = document.getElementById('searchField');
  const searchOperator = document.getElementById('searchOperator');
  const btnClearSearch = document.getElementById('btnClearSearch');

  function triggerSearch() {
    const query = searchInput ? searchInput.value : '';
    const field = searchField ? searchField.value : 'name';
    const operator = searchOperator ? searchOperator.value : 'include';
    setSearch(query, field, operator);
  }

  if (searchInput) {
    // Instant live search on every keystroke
    searchInput.addEventListener('input', () => {
      triggerSearch();
    });

    // Clear search shortcut with Escape key
    searchInput.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        searchInput.value = '';
        triggerSearch();
      }
    });
  }

  if (searchField) {
    searchField.addEventListener('change', () => {
      triggerSearch();
    });
  }

  if (searchOperator) {
    searchOperator.addEventListener('change', () => {
      triggerSearch();
    });
  }

  if (btnClearSearch) {
    btnClearSearch.addEventListener('click', () => {
      if (searchInput) searchInput.value = '';
      triggerSearch();
      if (searchInput) searchInput.focus();
    });
  }
}
