/**
 * router.js - URL State Synchronization Engine
 * Module for Henry (Search, Villain UI & Modal Specialist)
 * Integrates with Chris's state architecture.
 * 
 * Synchronizes search query, filters, sorting, pagination, and active hero dossier
 * with browser URL search parameters (?q=...&field=...&sort=...&dir=...&page=...&hero=...)
 */

import { getState, setSearch, setSort, setPage, setPageSize, setSelectedHeroId } from './state.js';

let isRestoringFromURL = false;

/**
 * Reads initial URL query parameters and populates the application state.
 */
export function restoreStateFromURL() {
  if (typeof window === 'undefined') return;

  const params = new URLSearchParams(window.location.search);
  isRestoringFromURL = true;

  const q = params.get('q') || '';
  const field = params.get('field') || 'name';
  const op = params.get('op') || 'include';
  const sortCol = params.get('sort');
  const sortDir = params.get('dir');
  const page = parseInt(params.get('page'), 10);
  const pageSizeParam = params.get('size');
  const heroId = parseInt(params.get('hero'), 10);

  if (q || field !== 'name' || op !== 'include') {
    setSearch(q, field, op);
    // Sync UI elements if DOM is ready
    const searchInput = document.getElementById('searchInput');
    const searchField = document.getElementById('searchField');
    const searchOperator = document.getElementById('searchOperator');
    if (searchInput) searchInput.value = q;
    if (searchField) searchField.value = field;
    if (searchOperator) searchOperator.value = op;
  }

  if (sortCol) {
    setSort(sortCol, sortDir === 'desc' ? 'desc' : 'asc');
  }

  if (pageSizeParam) {
    setPageSize(pageSizeParam === 'all' ? 'all' : parseInt(pageSizeParam, 10));
  }

  if (!isNaN(page) && page > 1) {
    setPage(page);
  }

  if (!isNaN(heroId) && heroId > 0) {
    setSelectedHeroId(heroId);
  }

  isRestoringFromURL = false;
}

/**
 * Updates browser URL search parameters whenever state changes.
 * Uses history.replaceState to avoid polluting browser history during live typing.
 */
export function syncURLWithState() {
  if (isRestoringFromURL || typeof window === 'undefined') return;

  const { search, sort, pagination, selectedHeroId } = getState();
  const params = new URLSearchParams();

  if (search.query) params.set('q', search.query);
  if (search.field && search.field !== 'name') params.set('field', search.field);
  if (search.operator && search.operator !== 'include') params.set('op', search.operator);

  if (sort.column && (sort.column !== 'name' || sort.direction !== 'asc')) {
    params.set('sort', sort.column);
    params.set('dir', sort.direction);
  }

  if (pagination.pageSize !== 20) {
    params.set('size', String(pagination.pageSize));
  }

  if (pagination.currentPage > 1) {
    params.set('page', String(pagination.currentPage));
  }

  if (selectedHeroId) {
    params.set('hero', String(selectedHeroId));
  }

  const newSearch = params.toString();
  const newURL = newSearch ? `${window.location.pathname}?${newSearch}` : window.location.pathname;

  window.history.replaceState(null, '', newURL);
}
