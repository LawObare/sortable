/**
 * pagination.js - Client-Side Pagination Controller
 * Module for Lawrence (DOM, Table & Pagination Specialist)
 * Integrated with Chris's state management.
 */

import { getState, setPage, setPageSize } from './state.js';

/**
 * Updates the pagination controls in the DOM based on current state.
 */
export function renderPagination() {
  const { pagination } = getState();
  const { currentPage, totalPages, pageSize, totalResults } = pagination;

  // Elements
  const pageSizeSelect = document.getElementById('pageSizeSelect');
  const pageInfo = document.getElementById('pageInfo');
  const resultsCounter = document.getElementById('resultsCounter');
  const btnFirst = document.getElementById('btnFirst');
  const btnPrev = document.getElementById('btnPrev');
  const btnNext = document.getElementById('btnNext');
  const btnLast = document.getElementById('btnLast');
  const pageNumbersContainer = document.getElementById('pageNumbers');

  // 1. Sync Page Size Select
  if (pageSizeSelect && pageSizeSelect.value !== String(pageSize)) {
    pageSizeSelect.value = String(pageSize);
  }

  // 2. Update Page Counter Text
  if (pageInfo) {
    pageInfo.textContent = `Page ${currentPage} of ${totalPages || 1}`;
  }

  if (resultsCounter) {
    resultsCounter.textContent = `${totalResults} target${totalResults === 1 ? '' : 's'} identified`;
  }

  // 3. Disable/Enable Navigation Buttons
  const isFirstPage = currentPage <= 1;
  const isLastPage = currentPage >= totalPages;

  if (btnFirst) btnFirst.disabled = isFirstPage;
  if (btnPrev) btnPrev.disabled = isFirstPage;
  if (btnNext) btnNext.disabled = isLastPage;
  if (btnLast) btnLast.disabled = isLastPage;

  // 4. Render Dynamic Numeric Page Buttons (sliding window of max 5 buttons)
  if (pageNumbersContainer) {
    pageNumbersContainer.innerHTML = '';
    const maxButtons = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxButtons / 2));
    let endPage = Math.min(totalPages, startPage + maxButtons - 1);

    if (endPage - startPage + 1 < maxButtons) {
      startPage = Math.max(1, endPage - maxButtons + 1);
    }

    for (let p = startPage; p <= endPage; p++) {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = `btn-page ${p === currentPage ? 'active' : ''}`;
      btn.textContent = String(p);
      btn.setAttribute('aria-label', `Go to page ${p}`);
      if (p === currentPage) {
        btn.setAttribute('aria-current', 'page');
      }

      btn.addEventListener('click', () => {
        setPage(p);
      });

      pageNumbersContainer.appendChild(btn);
    }
  }
}

/**
 * Initializes pagination listeners on navigation buttons and page size dropdown.
 */
export function initPagination() {
  const pageSizeSelect = document.getElementById('pageSizeSelect');
  const btnFirst = document.getElementById('btnFirst');
  const btnPrev = document.getElementById('btnPrev');
  const btnNext = document.getElementById('btnNext');
  const btnLast = document.getElementById('btnLast');

  if (pageSizeSelect) {
    pageSizeSelect.addEventListener('change', (e) => {
      const val = e.target.value;
      setPageSize(val === 'all' ? 'all' : parseInt(val, 10));
    });
  }

  if (btnFirst) {
    btnFirst.addEventListener('click', () => {
      setPage(1);
    });
  }

  if (btnPrev) {
    btnPrev.addEventListener('click', () => {
      const { pagination } = getState();
      setPage(pagination.currentPage - 1);
    });
  }

  if (btnNext) {
    btnNext.addEventListener('click', () => {
      const { pagination } = getState();
      setPage(pagination.currentPage + 1);
    });
  }

  if (btnLast) {
    btnLast.addEventListener('click', () => {
      const { pagination } = getState();
      setPage(pagination.totalPages);
    });
  }
}
