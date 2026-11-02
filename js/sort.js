/**
 * sort.js - Advanced Sorting Engine
 * Author: Chris (Lead Data & Sorting Architect)
 * 
 * Implements alphabetical and numerical sorting across all table columns.
 * CRITICAL RULE: Missing/null/unknown values are ALWAYS placed at the very end
 * of the dataset, regardless of whether sorting in 'asc' or 'desc' direction.
 */

import { isMissing } from './api.js';

/**
 * Extracts the appropriate sortable value from a normalized hero object.
 * Maps column identifiers to their corresponding data types.
 * @param {Object} hero - Normalized hero object
 * @param {string} column - Column key identifier
 * @returns {string|number|null}
 */
export function getSortValue(hero, column) {
  if (!hero) return null;

  switch (column) {
    case 'name':
      return hero.name || null;

    case 'fullName':
      return hero.biography?.fullName === '-' ? null : (hero.biography?.fullName || null);

    // Powerstats (numerical)
    case 'intelligence':
    case 'strength':
    case 'speed':
    case 'durability':
    case 'power':
    case 'combat':
      return hero.powerstats?.[column] ?? null;

    case 'race':
      return hero.appearance?.race === '-' ? null : (hero.appearance?.race || null);

    case 'gender':
      return hero.appearance?.gender === '-' ? null : (hero.appearance?.gender || null);

    // Height & Weight (numerical in cm and kg)
    case 'height':
      return hero.appearance?.heightCm ?? null;

    case 'weight':
      return hero.appearance?.weightKg ?? null;

    case 'placeOfBirth':
      return hero.biography?.placeOfBirth === '-' ? null : (hero.biography?.placeOfBirth || null);

    case 'alignment':
      return hero.biography?.alignment === '-' ? null : (hero.biography?.alignment || null);

    default:
      return hero[column] ?? null;
  }
}

/**
 * Compares two values with strict handling for missing/empty values.
 * 
 * INVARIANT: Missing values ALWAYS sort last in BOTH 'asc' and 'desc' modes.
 * 
 * @param {any} valA - First value
 * @param {any} valB - Second value
 * @param {'asc'|'desc'} [direction='asc'] - Sort direction
 * @returns {number} Standard comparator result (-1, 0, 1)
 */
export function compareValues(valA, valB, direction = 'asc') {
  const aMissing = isMissing(valA);
  const bMissing = isMissing(valB);

  // If both values are missing, preserve their relative order
  if (aMissing && bMissing) return 0;

  // If A is missing, it must ALWAYS go after B (to the bottom)
  if (aMissing) return 1;

  // If B is missing, it must ALWAYS go after A (to the bottom)
  if (bMissing) return -1;

  let comparison = 0;

  if (typeof valA === 'number' && typeof valB === 'number') {
    // Numerical sorting (e.g., 78 kg < 100 kg, height in cm, powerstats)
    comparison = valA - valB;
  } else {
    // Natural alphabetical sorting (case-insensitive, numeric-aware)
    const strA = String(valA);
    const strB = String(valB);
    comparison = strA.localeCompare(strB, undefined, {
      numeric: true,
      sensitivity: 'base',
    });
  }

  // Reverse valid comparison if descending; missing values were already handled above
  return direction === 'desc' ? -comparison : comparison;
}

/**
 * Sorts an array of hero objects by a specified column and direction.
 * Does not mutate the original array; returns a newly sorted array.
 * 
 * @param {Array<Object>} heroes - Array of normalized hero objects
 * @param {string} [column='name'] - Column identifier
 * @param {'asc'|'desc'} [direction='asc'] - Sort direction
 * @returns {Array<Object>}
 */
export function sortHeroes(heroes, column = 'name', direction = 'asc') {
  if (!Array.isArray(heroes) || heroes.length <= 1) {
    return Array.isArray(heroes) ? [...heroes] : [];
  }

  return [...heroes].sort((heroA, heroB) => {
    const valA = getSortValue(heroA, column);
    const valB = getSortValue(heroB, column);
    return compareValues(valA, valB, direction);
  });
}

/**
 * Calculates the next sort direction when a column header is clicked.
 * - Clicking a new column resets to 'asc'.
 * - Clicking the current column toggles between 'asc' and 'desc'.
 * 
 * @param {string} currentColumn
 * @param {'asc'|'desc'} currentDirection
 * @param {string} newColumn
 * @returns {'asc'|'desc'}
 */
export function getNextSortDirection(currentColumn, currentDirection, newColumn) {
  if (currentColumn !== newColumn) {
    return 'asc';
  }
  return currentDirection === 'asc' ? 'desc' : 'asc';
}
