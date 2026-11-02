/**
 * api.js - Superhero Data Fetching and Normalization Engine
 * Author: Chris (Lead Data & Sorting Architect)
 * 
 * Fetches data from Akabab's Superhero API, normalizes nested fields,
 * extracts numerical units (height in cm, weight in kg) for clean sorting,
 * and standardizes missing/unknown values.
 */

export const SUPERHERO_API_URL = 'https://rawcdn.githack.com/akabab/superhero-api/0.2.0/api/all.json';

/**
 * Checks whether a given value represents a missing, unknown, or empty value.
 * Standardizes: null, undefined, '', '-', '0 cm', '0 kg', '- lb', 'null', 'undefined', 'unknown'
 * @param {any} value
 * @returns {boolean}
 */
export function isMissing(value) {
  if (value === null || value === undefined) return true;
  if (typeof value === 'number') return isNaN(value);
  if (typeof value === 'string') {
    const s = value.trim().toLowerCase();
    return (
      s === '' ||
      s === '-' ||
      s === 'null' ||
      s === 'undefined' ||
      s === 'unknown' ||
      s === '0 cm' ||
      s === '0 kg' ||
      s === '- lb' ||
      s === 'n/a' ||
      s === 'none'
    );
  }
  if (Array.isArray(value)) {
    return value.length === 0 || value.every(isMissing);
  }
  return false;
}

/**
 * Parses height array (e.g. ["6'8", "203 cm"] or ["-", "61.0 meters"])
 * Extracts numerical centimeters for sorting, and provides human-readable display.
 * @param {Array<string>} heightArray
 * @returns {{ cm: number|null, display: string }}
 */
export function parseHeight(heightArray) {
  if (!heightArray || !Array.isArray(heightArray)) {
    return { cm: null, display: '-' };
  }

  const imperial = heightArray[0] || '';
  const metric = heightArray[1] || '';

  if (isMissing(metric) && isMissing(imperial)) {
    return { cm: null, display: '-' };
  }

  let cm = null;
  const cleanMetric = String(metric).replace(/,/g, '').trim();

  // 1. Check for meters (e.g. "61.0 meters")
  if (/meters?/i.test(cleanMetric)) {
    const match = cleanMetric.match(/([\d.]+)/);
    if (match) {
      const meters = parseFloat(match[1]);
      if (!isNaN(meters) && meters > 0) {
        cm = Math.round(meters * 100);
      }
    }
  }
  // 2. Check for centimeters (e.g. "203 cm")
  else if (/cm/i.test(cleanMetric)) {
    const match = cleanMetric.match(/([\d.]+)/);
    if (match) {
      const val = parseFloat(match[1]);
      if (!isNaN(val) && val > 0) {
        cm = Math.round(val);
      }
    }
  }

  // 3. Fallback to imperial if metric was missing (e.g. "6'2" or "6'2\"")
  if (cm === null && imperial && !isMissing(imperial)) {
    const match = String(imperial).match(/(\d+)'(?:(\d+))?/);
    if (match) {
      const feet = parseInt(match[1], 10);
      const inches = match[2] ? parseInt(match[2], 10) : 0;
      const totalInches = feet * 12 + inches;
      if (totalInches > 0) {
        cm = Math.round(totalInches * 2.54);
      }
    }
  }

  const display = cm !== null
    ? (!isMissing(metric) ? metric : `${cm} cm`)
    : '-';

  return { cm, display };
}

/**
 * Parses weight array (e.g. ["980 lb", "441 kg"] or ["-", "18 tons"])
 * Extracts numerical kilograms for sorting, and provides human-readable display.
 * @param {Array<string>} weightArray
 * @returns {{ kg: number|null, display: string }}
 */
export function parseWeight(weightArray) {
  if (!weightArray || !Array.isArray(weightArray)) {
    return { kg: null, display: '-' };
  }

  const imperial = weightArray[0] || '';
  const metric = weightArray[1] || '';

  if (isMissing(metric) && isMissing(imperial)) {
    return { kg: null, display: '-' };
  }

  let kg = null;
  const cleanMetric = String(metric).replace(/,/g, '').trim();

  // 1. Check for metric tons (e.g. "18 tons", "90,000 tons")
  if (/tons?/i.test(cleanMetric)) {
    const match = cleanMetric.match(/([\d.]+)/);
    if (match) {
      const tons = parseFloat(match[1]);
      if (!isNaN(tons) && tons > 0) {
        kg = Math.round(tons * 1000);
      }
    }
  }
  // 2. Check for kilograms (e.g. "441 kg")
  else if (/kg/i.test(cleanMetric)) {
    const match = cleanMetric.match(/([\d.]+)/);
    if (match) {
      const val = parseFloat(match[1]);
      if (!isNaN(val) && val > 0) {
        kg = Math.round(val);
      }
    }
  }

  // 3. Fallback to imperial lbs if metric was missing (e.g. "980 lb")
  if (kg === null && imperial && !isMissing(imperial)) {
    const cleanImperial = String(imperial).replace(/,/g, '').trim();
    const match = cleanImperial.match(/([\d.]+)\s*lbs?/i);
    if (match) {
      const lbs = parseFloat(match[1]);
      if (!isNaN(lbs) && lbs > 0) {
        kg = Math.round(lbs * 0.453592);
      }
    }
  }

  const display = kg !== null
    ? (!isMissing(metric) ? metric : `${kg} kg`)
    : '-';

  return { kg, display };
}

/**
 * Normalizes an individual superhero object from the raw API into a clean,
 * standardized data model with precomputed sorting keys and display strings.
 * @param {Object} raw
 * @returns {Object} Normalized hero object
 */
export function normalizeHero(raw) {
  const heightData = parseHeight(raw.appearance?.height);
  const weightData = parseWeight(raw.appearance?.weight);

  // Powerstats normalized: ensure numbers, 0 is valid if explicit, null if missing
  const rawStats = raw.powerstats || {};
  const powerstats = {
    intelligence: typeof rawStats.intelligence === 'number' ? rawStats.intelligence : null,
    strength: typeof rawStats.strength === 'number' ? rawStats.strength : null,
    speed: typeof rawStats.speed === 'number' ? rawStats.speed : null,
    durability: typeof rawStats.durability === 'number' ? rawStats.durability : null,
    power: typeof rawStats.power === 'number' ? rawStats.power : null,
    combat: typeof rawStats.combat === 'number' ? rawStats.combat : null,
  };

  const fullNameRaw = raw.biography?.fullName;
  const fullName = isMissing(fullNameRaw) ? '-' : fullNameRaw.trim();

  const raceRaw = raw.appearance?.race;
  const race = isMissing(raceRaw) ? '-' : raceRaw.trim();

  const genderRaw = raw.appearance?.gender;
  const gender = isMissing(genderRaw) ? '-' : genderRaw.trim();

  const placeOfBirthRaw = raw.biography?.placeOfBirth;
  const placeOfBirth = isMissing(placeOfBirthRaw) ? '-' : placeOfBirthRaw.trim();

  const alignmentRaw = raw.biography?.alignment;
  const alignment = isMissing(alignmentRaw) ? '-' : alignmentRaw.trim().toLowerCase();

  return {
    id: raw.id,
    name: raw.name || 'Unknown',
    slug: raw.slug || '',
    images: {
      xs: raw.images?.xs || '',
      sm: raw.images?.sm || '',
      md: raw.images?.md || '',
      lg: raw.images?.lg || '',
    },
    powerstats,
    appearance: {
      gender,
      race,
      heightCm: heightData.cm,
      heightDisplay: heightData.display,
      weightKg: weightData.kg,
      weightDisplay: weightData.display,
      eyeColor: isMissing(raw.appearance?.eyeColor) ? '-' : raw.appearance.eyeColor,
      hairColor: isMissing(raw.appearance?.hairColor) ? '-' : raw.appearance.hairColor,
    },
    biography: {
      fullName,
      alterEgos: isMissing(raw.biography?.alterEgos) ? '-' : raw.biography.alterEgos,
      aliases: Array.isArray(raw.biography?.aliases)
        ? raw.biography.aliases.filter(a => !isMissing(a))
        : [],
      placeOfBirth,
      firstAppearance: isMissing(raw.biography?.firstAppearance) ? '-' : raw.biography.firstAppearance,
      publisher: isMissing(raw.biography?.publisher) ? '-' : raw.biography.publisher,
      alignment,
    },
    work: {
      occupation: isMissing(raw.work?.occupation) ? '-' : raw.work.occupation,
      base: isMissing(raw.work?.base) ? '-' : raw.work.base,
    },
    connections: {
      groupAffiliation: isMissing(raw.connections?.groupAffiliation) ? '-' : raw.connections.groupAffiliation,
      relatives: isMissing(raw.connections?.relatives) ? '-' : raw.connections.relatives,
    },
    // Store original raw data for complete detail view inspections
    raw,
  };
}

let cachedHeroes = null;

/**
 * Fetches all superhero data from the API and returns an array of normalized hero objects.
 * Caches in memory to prevent duplicate network calls.
 * @param {boolean} forceRefresh
 * @returns {Promise<Array<Object>>}
 */
export async function fetchHeroes(forceRefresh = false) {
  if (cachedHeroes && !forceRefresh) {
    return cachedHeroes;
  }

  const response = await fetch(SUPERHERO_API_URL);
  if (!response.ok) {
    throw new Error(`Failed to fetch heroes: HTTP ${response.status} (${response.statusText})`);
  }

  const data = await response.json();
  if (!Array.isArray(data)) {
    throw new Error('Invalid API response format: expected an array of heroes.');
  }

  cachedHeroes = data.map(normalizeHero);
  return cachedHeroes;
}
