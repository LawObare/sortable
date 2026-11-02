/**
 * table.js - DOM Table Rendering & Interaction Engine
 * Module for Lawrence (DOM, Table & Pagination Specialist)
 * Integrated with Chris's state and sorting architecture.
 */

import { getState, setSort, setSelectedHeroId } from './state.js';

/**
 * Maps alignment values to villain-themed badge styles.
 * @param {string} alignment
 * @returns {string} HTML badge string
 */
function renderAlignmentBadge(alignment) {
  const norm = (alignment || '').toLowerCase();
  let badgeClass = 'badge-neutral';
  let label = alignment || '-';

  if (norm === 'good') {
    badgeClass = 'badge-good';
    label = 'Hero';
  } else if (norm === 'bad') {
    badgeClass = 'badge-bad';
    label = 'Villain';
  } else if (norm === 'neutral') {
    badgeClass = 'badge-neutral';
    label = 'Neutral';
  }

  return `<span class="badge ${badgeClass}">${label}</span>`;
}

/**
 * Formats a powerstat value into a mini visual stat bar.
 * @param {number|null} value
 * @returns {string} HTML string
 */
function renderStatCell(value) {
  if (value === null || value === undefined || isNaN(value)) {
    return `<span class="stat-missing">-</span>`;
  }
  const pct = Math.min(100, Math.max(0, value));
  return `
    <div class="stat-cell" title="${value}/100">
      <span class="stat-value">${value}</span>
      <div class="stat-meter-track">
        <div class="stat-meter-fill" style="width: ${pct}%"></div>
      </div>
    </div>
  `;
}

/**
 * Renders the heroes table rows inside the <tbody> element.
 * Uses DocumentFragment for fast batch rendering.
 * @param {Array<Object>} heroes - Display slice of normalized hero objects
 * @param {HTMLElement} tbodyElement - Target <tbody>
 */
export function renderTable(heroes, tbodyElement) {
  if (!tbodyElement) return;

  tbodyElement.innerHTML = '';

  if (!heroes || heroes.length === 0) {
    const tr = document.createElement('tr');
    tr.className = 'empty-row';
    tr.innerHTML = `
      <td colspan="15" class="empty-state">
        <div class="empty-message">
          <span class="empty-icon">⚠️</span>
          <p>No confidential records found matching current query or filters.</p>
        </div>
      </td>
    `;
    tbodyElement.appendChild(tr);
    return;
  }

  const fragment = document.createDocumentFragment();

  heroes.forEach(hero => {
    const tr = document.createElement('tr');
    tr.className = 'hero-row';
    tr.dataset.heroId = hero.id;

    // Fallback image if image fails to load
    const iconUrl = hero.images?.xs || '';
    const safeName = hero.name || 'Hero';

    tr.innerHTML = `
      <td class="col-icon">
        <div class="avatar-wrapper">
          <img 
            src="${iconUrl}" 
            alt="${safeName}" 
            class="hero-avatar"
            loading="lazy"
            onerror="this.onerror=null;this.src='data:image/svg+xml;utf8,<svg xmlns=\\'http://www.w3.org/2000/svg\\' width=\\'32\\' height=\\'32\\' viewBox=\\'0 0 24 24\\' fill=\\'none\\' stroke=\\'%2364748b\\' stroke-width=\\'2\\'><circle cx=\\'12\\' cy=\\'8\\' r=\\'5\\'/><path d=\\'M20 21a8 8 0 1 0-16 0\\'/></svg>';"
          />
        </div>
      </td>
      <td class="col-name font-semibold">${hero.name}</td>
      <td class="col-fullname text-muted">${hero.biography?.fullName || '-'}</td>
      <td class="col-stat text-center">${renderStatCell(hero.powerstats?.intelligence)}</td>
      <td class="col-stat text-center">${renderStatCell(hero.powerstats?.strength)}</td>
      <td class="col-stat text-center">${renderStatCell(hero.powerstats?.speed)}</td>
      <td class="col-stat text-center">${renderStatCell(hero.powerstats?.durability)}</td>
      <td class="col-stat text-center">${renderStatCell(hero.powerstats?.power)}</td>
      <td class="col-stat text-center">${renderStatCell(hero.powerstats?.combat)}</td>
      <td class="col-race">${hero.appearance?.race || '-'}</td>
      <td class="col-gender">${hero.appearance?.gender || '-'}</td>
      <td class="col-height font-mono">${hero.appearance?.heightDisplay || '-'}</td>
      <td class="col-weight font-mono">${hero.appearance?.weightDisplay || '-'}</td>
      <td class="col-birth text-muted">${hero.biography?.placeOfBirth || '-'}</td>
      <td class="col-alignment text-center">${renderAlignmentBadge(hero.biography?.alignment)}</td>
    `;

    // Row click opens hero detail dossier modal
    tr.addEventListener('click', () => {
      setSelectedHeroId(hero.id);
    });

    fragment.appendChild(tr);
  });

  tbodyElement.appendChild(fragment);
  updateSortIndicators();
}

/**
 * Updates visual indicator arrows (▲ / ▼) on active sortable table headers.
 */
export function updateSortIndicators() {
  const { sort } = getState();
  const headers = document.querySelectorAll('th[data-sort]');

  headers.forEach(th => {
    const col = th.dataset.sort;
    const indicator = th.querySelector('.sort-indicator');

    if (col === sort.column) {
      th.classList.add('active-sort');
      th.setAttribute('aria-sort', sort.direction === 'asc' ? 'ascending' : 'descending');
      if (indicator) {
        indicator.textContent = sort.direction === 'asc' ? '▲' : '▼';
        indicator.className = 'sort-indicator active';
      }
    } else {
      th.classList.remove('active-sort');
      th.removeAttribute('aria-sort');
      if (indicator) {
        indicator.textContent = '⇅';
        indicator.className = 'sort-indicator';
      }
    }
  });
}

/**
 * Initializes click event listeners on all sortable table headers.
 */
export function initTableHeaders() {
  const headers = document.querySelectorAll('th[data-sort]');

  headers.forEach(th => {
    th.addEventListener('click', () => {
      const column = th.dataset.sort;
      if (column) {
        setSort(column);
      }
    });

    // Keyboard accessibility for headers
    th.setAttribute('tabindex', '0');
    th.setAttribute('role', 'button');
    th.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        const column = th.dataset.sort;
        if (column) setSort(column);
      }
    });
  });
}
