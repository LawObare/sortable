/**
 * app.js - Main Application Entry Point & Orchestrator
 * Author: Chris (Lead Data & Sorting Architect)
 * 
 * Boots the application, fetches confidential intelligence data,
 * registers reactive subscribers, and connects Lawrence's UI modules
 * with Henry's live search, theme, modal, and URL routing.
 */

import { fetchHeroes } from './api.js';
import { getState, subscribe, setHeroes, setLoading, setError } from './state.js';
import { renderTable, initTableHeaders } from './table.js';
import { renderPagination, initPagination } from './pagination.js';
import { initSearch } from './filter.js';
import { renderModal, initModal } from './modal.js';
import { restoreStateFromURL, syncURLWithState } from './router.js';

/**
 * Main reactive subscriber. Runs whenever state updates.
 * @param {Object} state - Latest application state
 */
function onStateChange(state) {
  const tbody = document.getElementById('heroesTableBody');
  const loadingIndicator = document.getElementById('loadingIndicator');
  const errorMessage = document.getElementById('errorMessage');

  // 1. Handle loading state
  if (loadingIndicator) {
    loadingIndicator.style.display = state.loading ? 'flex' : 'none';
  }

  // 2. Handle error state
  if (errorMessage) {
    if (state.error) {
      errorMessage.textContent = state.error;
      errorMessage.style.display = 'block';
    } else {
      errorMessage.style.display = 'none';
    }
  }

  // 3. Render Table
  renderTable(state.displayHeroes, tbody);

  // 4. Render Pagination
  renderPagination();

  // 5. Render Detail Modal if a hero is selected
  if (state.selectedHeroId) {
    const hero = state.allHeroes.find(h => h.id === state.selectedHeroId);
    renderModal(hero);
  } else {
    renderModal(null);
  }

  // 6. Synchronize URL query parameters
  syncURLWithState();
}

/**
 * Boots the application.
 */
async function boot() {
  console.log('⚡ Initializing Villain Dossier Intelligence Hub...');

  // Initialize UI event handlers
  initTableHeaders();
  initPagination();
  initSearch();
  initModal();

  // Register central reactive listener
  subscribe(onStateChange);

  // Restore any persistent state from URL query parameters
  restoreStateFromURL();

  // Fetch superhero data
  try {
    setLoading(true);
    const heroes = await fetchHeroes();
    console.log(`✅ Loaded and sanitized ${heroes.length} confidential hero files.`);
    setHeroes(heroes);
  } catch (err) {
    console.error('❌ Failed to load confidential records:', err);
    setError(`Failed to retrieve confidential records: ${err.message}`);
  } finally {
    setLoading(false);
  }
}

// Start once DOM content is loaded
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', boot);
} else {
  boot();
}
