/**
 * test-sorting.js - Automated Test Suite for Chris's Data & Sorting Engine
 * Run with: node tests/test-sorting.js
 */

import { isMissing, parseHeight, parseWeight, fetchHeroes } from '../js/api.js';
import { compareValues, sortHeroes, getSortValue, getNextSortDirection } from '../js/sort.js';
import { getState, setHeroes, setSearch, setSort, setPage, setPageSize } from '../js/state.js';

let passed = 0;
let failed = 0;

function assert(condition, message) {
  if (condition) {
    console.log(`  ✓ PASS: ${message}`);
    passed++;
  } else {
    console.error(`  ✗ FAIL: ${message}`);
    failed++;
  }
}

console.log('====================================================');
console.log('🧪 RUNNING CHRIS\'S DATA & SORTING ENGINE TEST SUITE');
console.log('====================================================\n');

// 1. isMissing test
console.log('--- 1. Testing isMissing() ---');
assert(isMissing(null) === true, 'null is missing');
assert(isMissing(undefined) === true, 'undefined is missing');
assert(isMissing('') === true, 'empty string is missing');
assert(isMissing('-') === true, '"-" is missing');
assert(isMissing('0 cm') === true, '"0 cm" is missing');
assert(isMissing('0 kg') === true, '"0 kg" is missing');
assert(isMissing('- lb') === true, '"- lb" is missing');
assert(isMissing('null') === true, '"null" string is missing');
assert(isMissing('Batman') === false, '"Batman" is not missing');
assert(isMissing(78) === false, '78 is not missing');
assert(isMissing(0) === false, '0 is not missing (valid number)');

// 2. parseHeight & parseWeight
console.log('\n--- 2. Testing parseHeight & parseWeight ---');
const h1 = parseHeight(["6'8", "203 cm"]);
assert(h1.cm === 203 && h1.display === '203 cm', '203 cm parsed correctly');

const h2 = parseHeight(["-", "61.0 meters"]);
assert(h2.cm === 6100 && h2.display === '61.0 meters', '61.0 meters parsed as 6100 cm');

const h3 = parseHeight(["-", "0 cm"]);
assert(h3.cm === null && h3.display === '-', '"0 cm" parsed as null/missing');

const w1 = parseWeight(["980 lb", "441 kg"]);
assert(w1.kg === 441 && w1.display === '441 kg', '441 kg parsed correctly');

const w2 = parseWeight(["-", "18 tons"]);
assert(w2.kg === 18000 && w2.display === '18 tons', '18 tons parsed as 18000 kg');

const w3 = parseWeight(["-", "90,000 tons"]);
assert(w3.kg === 90000000 && w3.display === '90,000 tons', '90,000 tons parsed with comma removed');

const w4 = parseWeight(["- lb", "0 kg"]);
assert(w4.kg === null && w4.display === '-', '"0 kg" parsed as null/missing');

// 3. Numerical Sorting & Missing Values Invariant
console.log('\n--- 3. Testing compareValues & Missing Values Invariant ---');
// Requirement: 78 kg before 100 kg in asc
assert(compareValues(78, 100, 'asc') < 0, '78 appears before 100 in ascending');
assert(compareValues(78, 100, 'desc') > 0, '100 appears before 78 in descending');

// Requirement: Missing values MUST ALWAYS BE LAST in BOTH ASC and DESC
assert(compareValues(50, null, 'asc') < 0, '50 appears before null in ASC (null last)');
assert(compareValues(null, 50, 'asc') > 0, 'null appears after 50 in ASC (null last)');
assert(compareValues(50, null, 'desc') < 0, '50 appears before null in DESC (null STILL last)');
assert(compareValues(null, 50, 'desc') > 0, 'null appears after 50 in DESC (null STILL last)');

assert(compareValues(50, '-', 'asc') < 0, '50 appears before "-" in ASC ("-" last)');
assert(compareValues(50, '-', 'desc') < 0, '50 appears before "-" in DESC ("-" STILL last)');

// 4. Direction Toggle Logic
console.log('\n--- 4. Testing getNextSortDirection ---');
assert(getNextSortDirection('name', 'asc', 'name') === 'desc', 'Same column toggles asc -> desc');
assert(getNextSortDirection('name', 'desc', 'name') === 'asc', 'Same column toggles desc -> asc');
assert(getNextSortDirection('name', 'desc', 'height') === 'asc', 'Switching column resets to asc');

// 5. Array Sorting with Dummy Data
console.log('\n--- 5. Testing sortHeroes with Mock Data ---');
const mockHeroes = [
  { name: 'Zatanna', appearance: { weightKg: 52, heightCm: 170 }, powerstats: { intelligence: 81 } },
  { name: 'Unknown Beast', appearance: { weightKg: null, heightCm: null }, powerstats: { intelligence: null } },
  { name: 'A-Bomb', appearance: { weightKg: 441, heightCm: 203 }, powerstats: { intelligence: 38 } },
  { name: 'Batman', appearance: { weightKg: 95, heightCm: 188 }, powerstats: { intelligence: 100 } },
  { name: 'Shadow Ghost', appearance: { weightKg: null, heightCm: null }, powerstats: { intelligence: null } },
];

const sortedByNameAsc = sortHeroes(mockHeroes, 'name', 'asc');
assert(sortedByNameAsc[0].name === 'A-Bomb', 'Name ASC: A-Bomb first');
assert(sortedByNameAsc[1].name === 'Batman', 'Name ASC: Batman second');

const sortedByWeightAsc = sortHeroes(mockHeroes, 'weight', 'asc');
assert(sortedByWeightAsc[0].name === 'Zatanna', 'Weight ASC: Zatanna (52kg) first');
assert(sortedByWeightAsc[1].name === 'Batman', 'Weight ASC: Batman (95kg) second');
assert(sortedByWeightAsc[2].name === 'A-Bomb', 'Weight ASC: A-Bomb (441kg) third');
assert(sortedByWeightAsc[3].appearance.weightKg === null, 'Weight ASC: 4th is missing (sorted last)');
assert(sortedByWeightAsc[4].appearance.weightKg === null, 'Weight ASC: 5th is missing (sorted last)');

const sortedByWeightDesc = sortHeroes(mockHeroes, 'weight', 'desc');
assert(sortedByWeightDesc[0].name === 'A-Bomb', 'Weight DESC: A-Bomb (441kg) first');
assert(sortedByWeightDesc[1].name === 'Batman', 'Weight DESC: Batman (95kg) second');
assert(sortedByWeightDesc[2].name === 'Zatanna', 'Weight DESC: Zatanna (52kg) third');
assert(sortedByWeightDesc[3].appearance.weightKg === null, 'Weight DESC: 4th is STILL missing (sorted last)');
assert(sortedByWeightDesc[4].appearance.weightKg === null, 'Weight DESC: 5th is STILL missing (sorted last)');

// 6. Live API Test
console.log('\n--- 6. Testing fetchHeroes() against Live API ---');
try {
  const heroes = await fetchHeroes();
  assert(Array.isArray(heroes) && heroes.length === 563, `Successfully fetched and normalized all ${heroes.length} heroes`);

  // Verify first hero normalization
  const first = heroes[0];
  assert(first.name === 'A-Bomb', 'First hero is A-Bomb');
  assert(first.appearance.heightCm === 203, 'A-Bomb heightCm is 203');
  assert(first.appearance.weightKg === 441, 'A-Bomb weightKg is 441');
  assert(first.images.xs.length > 0, 'A-Bomb xs image is present');

  // Verify sort across all 563 heroes
  const allSortedHeightAsc = sortHeroes(heroes, 'height', 'asc');
  // First valid item should be positive height
  assert(allSortedHeightAsc[0].appearance.heightCm > 0, `Shortest valid hero: ${allSortedHeightAsc[0].name} (${allSortedHeightAsc[0].appearance.heightCm} cm)`);
  // Last items must be null/missing
  const lastHero = allSortedHeightAsc[allSortedHeightAsc.length - 1];
  assert(lastHero.appearance.heightCm === null, `Last hero in height ASC has null heightCm: ${lastHero.name}`);

  const allSortedHeightDesc = sortHeroes(heroes, 'height', 'desc');
  // First item should be the tallest hero (Fin Fang Foom or similar)
  assert(allSortedHeightDesc[0].appearance.heightCm >= 6100, `Tallest hero: ${allSortedHeightDesc[0].name} (${allSortedHeightDesc[0].appearance.heightCm} cm)`);
  // In DESC, last items MUST STILL BE NULL!
  const lastHeroDesc = allSortedHeightDesc[allSortedHeightDesc.length - 1];
  assert(lastHeroDesc.appearance.heightCm === null, `Last hero in height DESC STILL has null heightCm: ${lastHeroDesc.name}`);

  // 7. State Management
  console.log('\n--- 7. Testing State Management Pipeline ---');
  setHeroes(heroes);
  const s1 = getState();
  assert(s1.allHeroes.length === 563, 'State has 563 heroes');
  assert(s1.displayHeroes.length === 20, 'Default page size displays 20 heroes');
  assert(s1.displayHeroes[0].name === 'A-Bomb', 'First display hero sorted by name ASC');

  // Search filter
  setSearch('man');
  const s2 = getState();
  assert(s2.filteredHeroes.every(h => h.name.toLowerCase().includes('man')), 'All filtered heroes contain "man"');
  assert(s2.pagination.currentPage === 1, 'Current page reset to 1 after search');

  // Sort change in state
  setSort('weight');
  const s3 = getState();
  assert(s3.sort.column === 'weight', 'Sort column updated to weight');
  assert(s3.sort.direction === 'asc', 'Sort direction set to asc');

  // Pagination change
  setPage(2);
  const s4 = getState();
  assert(s4.pagination.currentPage === 2, 'Page updated to 2');

  setPageSize(50);
  const s5 = getState();
  assert(s5.pagination.pageSize === 50, 'Page size updated to 50');
  assert(s5.displayHeroes.length <= 50, 'Display heroes count is <= 50');

} catch (err) {
  console.error('API Test Error:', err);
  failed++;
}

console.log('\n====================================================');
console.log(`RESULTS: ${passed} PASSED, ${failed} FAILED`);
console.log('====================================================');

if (failed > 0) {
  process.exit(1);
}
