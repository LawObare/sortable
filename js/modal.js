/**
 * modal.js - Hero Dossier Detail Modal
 * Module for Henry (Search, Villain UI & Modal Specialist)
 * Integrated with Chris's state management.
 */

import { getState, setSelectedHeroId } from './state.js';

/**
 * Renders the confidential dossier modal for the selected hero.
 * @param {Object} hero - Normalized hero object
 */
export function renderModal(hero) {
  const modalContainer = document.getElementById('dossierModal');
  if (!modalContainer) return;

  if (!hero) {
    modalContainer.classList.remove('open');
    document.body.classList.remove('modal-open');
    return;
  }

  const largeImg = hero.images?.lg || hero.images?.md || hero.images?.sm || '';
  const aliasesList = hero.biography?.aliases?.length > 0 
    ? hero.biography.aliases.join(', ') 
    : 'None recorded';

  modalContainer.innerHTML = `
    <div class="modal-backdrop" id="modalBackdrop"></div>
    <div class="modal-dialog" role="dialog" aria-modal="true" aria-labelledby="modalHeroName">
      <button class="modal-close" id="modalCloseBtn" aria-label="Close dossier">✕</button>
      
      <div class="modal-header">
        <div class="dossier-stamp">CONFIDENTIAL DOSSIER</div>
        <h2 id="modalHeroName" class="modal-title">${hero.name}</h2>
        <p class="modal-subtitle">${hero.biography?.fullName !== '-' ? hero.biography.fullName : 'Identity Unknown'}</p>
      </div>

      <div class="modal-body">
        <div class="dossier-grid">
          <!-- Left: Hero Portrait -->
          <div class="dossier-portrait-col">
            <div class="portrait-frame">
              <img 
                src="${largeImg}" 
                alt="${hero.name}" 
                class="portrait-img"
                loading="lazy"
                onerror="this.onerror=null;this.src='data:image/svg+xml;utf8,<svg xmlns=\\'http://www.w3.org/2000/svg\\' width=\\'200\\' height=\\'280\\' viewBox=\\'0 0 24 24\\' fill=\\'none\\' stroke=\\'%2364748b\\' stroke-width=\\'1\\'><circle cx=\\'12\\' cy=\\'8\\' r=\\'5\\'/><path d=\\'M20 21a8 8 0 1 0-16 0\\'/></svg>';"
              />
              <div class="portrait-badge badge-${(hero.biography?.alignment || 'neutral').toLowerCase()}">
                ALIGNMENT: ${(hero.biography?.alignment || 'UNKNOWN').toUpperCase()}
              </div>
            </div>
          </div>

          <!-- Right: Detailed Intelligence -->
          <div class="dossier-intel-col">
            <!-- Powerstats Matrix -->
            <div class="dossier-section">
              <h3 class="section-heading">THREAT ASSESSMENT (POWERSTATS)</h3>
              <div class="powerstats-matrix">
                ${Object.entries(hero.powerstats || {}).map(([stat, val]) => {
                  const num = val !== null && !isNaN(val) ? val : 0;
                  return `
                    <div class="stat-gauge-row">
                      <div class="stat-gauge-header">
                        <span class="stat-gauge-label">${stat.toUpperCase()}</span>
                        <span class="stat-gauge-num font-mono">${val !== null ? val : 'UNKNOWN'}</span>
                      </div>
                      <div class="stat-gauge-bar">
                        <div class="stat-gauge-fill" style="width: ${num}%"></div>
                      </div>
                    </div>
                  `;
                }).join('')}
              </div>
            </div>

            <!-- Biographical Record -->
            <div class="dossier-section">
              <h3 class="section-heading">BIOGRAPHICAL ARCHIVE</h3>
              <dl class="intel-dl">
                <dt>Full Name:</dt><dd>${hero.biography?.fullName || '-'}</dd>
                <dt>Alter Egos:</dt><dd>${hero.biography?.alterEgos || '-'}</dd>
                <dt>Known Aliases:</dt><dd>${aliasesList}</dd>
                <dt>Place of Birth:</dt><dd>${hero.biography?.placeOfBirth || '-'}</dd>
                <dt>First Sighting:</dt><dd>${hero.biography?.firstAppearance || '-'}</dd>
                <dt>Publisher:</dt><dd>${hero.biography?.publisher || '-'}</dd>
              </dl>
            </div>

            <!-- Physical Attributes -->
            <div class="dossier-section">
              <h3 class="section-heading">BIOMETRIC SPECIFICATIONS</h3>
              <dl class="intel-dl">
                <dt>Race:</dt><dd>${hero.appearance?.race || '-'}</dd>
                <dt>Gender:</dt><dd>${hero.appearance?.gender || '-'}</dd>
                <dt>Height:</dt><dd class="font-mono">${hero.appearance?.heightDisplay || '-'}</dd>
                <dt>Weight:</dt><dd class="font-mono">${hero.appearance?.weightDisplay || '-'}</dd>
                <dt>Eye Color:</dt><dd>${hero.appearance?.eyeColor || '-'}</dd>
                <dt>Hair Color:</dt><dd>${hero.appearance?.hairColor || '-'}</dd>
              </dl>
            </div>

            <!-- Operations & Affiliations -->
            <div class="dossier-section">
              <h3 class="section-heading">OPERATIONAL PROFILE</h3>
              <dl class="intel-dl">
                <dt>Occupation:</dt><dd>${hero.work?.occupation || '-'}</dd>
                <dt>Base of Ops:</dt><dd>${hero.work?.base || '-'}</dd>
                <dt>Affiliations:</dt><dd>${hero.connections?.groupAffiliation || '-'}</dd>
                <dt>Known Relatives:</dt><dd>${hero.connections?.relatives || '-'}</dd>
              </dl>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;

  modalContainer.classList.add('open');
  document.body.classList.add('modal-open');

  // Event Listeners for Closing
  const closeBtn = document.getElementById('modalCloseBtn');
  const backdrop = document.getElementById('modalBackdrop');

  if (closeBtn) closeBtn.addEventListener('click', () => setSelectedHeroId(null));
  if (backdrop) backdrop.addEventListener('click', () => setSelectedHeroId(null));
}

/**
 * Initializes global modal event listeners (e.g. Escape key).
 */
export function initModal() {
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      const { selectedHeroId } = getState();
      if (selectedHeroId !== null) {
        setSelectedHeroId(null);
      }
    }
  });
}
