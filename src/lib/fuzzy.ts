/**
 * Fuzzy patient search (FR-APPT-3): typing "priya nai" must return
 * "Priya Nair". Every query token has to match a word of the name by
 * prefix, small edit distance, or subsequence — or match the phone.
 */

function editDistanceAtMost1(a: string, b: string): boolean {
  if (Math.abs(a.length - b.length) > 1) return false;
  let i = 0;
  let j = 0;
  let edits = 0;
  while (i < a.length && j < b.length) {
    if (a[i] === b[j]) {
      i++;
      j++;
      continue;
    }
    if (++edits > 1) return false;
    if (a.length > b.length) i++;
    else if (b.length > a.length) j++;
    else {
      i++;
      j++;
    }
  }
  return edits + (a.length - i) + (b.length - j) <= 1;
}

function tokenMatches(token: string, word: string): number {
  if (word.startsWith(token)) return 3;
  if (token.length >= 4 && editDistanceAtMost1(token, word.slice(0, token.length))) return 2;
  // subsequence
  let i = 0;
  for (const ch of word) {
    if (ch === token[i]) i++;
    if (i === token.length) return 1;
  }
  return 0;
}

export function fuzzyScore(query: string, name: string, phone?: string): number {
  const q = query.trim().toLowerCase();
  if (!q) return 0;
  const digits = q.replace(/\D/g, "");
  if (digits.length >= 3 && phone && phone.replace(/\D/g, "").includes(digits)) {
    return 100;
  }
  const tokens = q.split(/\s+/).filter(Boolean);
  const words = name.toLowerCase().split(/\s+/).filter(Boolean);
  let total = 0;
  for (const t of tokens) {
    let best = 0;
    for (const w of words) best = Math.max(best, tokenMatches(t, w));
    if (best === 0) return 0; // every token must land somewhere
    total += best;
  }
  return total;
}
