/*
 * vocab-fields.mjs — every field a vocab entry may have and what it holds:
 * the one list tools/check.mjs checks every entry of every unit against,
 * so a misspelt field (contrats: 'vowel') or a wrong value fails the check
 * instead of being silently ignored. Each unit's vocab.js header says what
 * its fields mean there. A new field is added here first.
 *
 *   REQUIRED                  fields every entry has
 *   FIELDS                    { field: kind }
 *   entryProblems(entry, isId) → [messages]: unknown fields, missing
 *                             required ones, and values not of their kind;
 *                             isId(id) says whether an id names an entry
 *
 * Kinds: 'text' (a non-empty string), 'number', 'boolean', 'id' (an entry
 * id); 'texts', 'numbers', 'ids' (non-empty lists of them); oneOf(...values)
 * for one of a few fixed values (compared by value); either(...kinds) for
 * any of them; and { key: kind } for an object with exactly those keys.
 * Every field but the REQUIRED ones may also be undefined: a borrowed entry
 * clears one with note: undefined.
 */

export const oneOf = (...values) => ({ oneOf: values });
export const either = (...kinds) => ({ either: kinds });

export const REQUIRED = ['id', 'spanish', 'english'];

export const FIELDS = {
  // Every entry
  id: 'text', spanish: 'text', english: 'text',
  note: 'text',
  img: oneOf(false),                  // no picture
  // Audio (tools/tts.mjs)
  say: 'text',                        // text to speak instead of `spanish`
  ssml: 'text',                       // SSML inside <voice>
  voice: 'text',                      // another Azure voice
  // Borrowing (shared/units.js sets these)
  unit: 'number',                     // home unit
  taught: 'number',                   // a dictionary word's unit (Words.add sets it)
  // Unit 1: sounds and spelling
  letter: 'text',                     // the letter or pair a word shows off (ll, ñ...)
  contrast: oneOf('vowel', 'r-rr', 'n-ny', 'stress'),  // what tells it apart from its family
  family: 'id',                       // the word its sound-alike family is named after
};

const KIND_NAMES = {
  text: 'text', texts: 'a list of texts', number: 'a number', numbers: 'a list of numbers',
  boolean: 'true or false', id: 'an entry id', ids: 'a list of entry ids',
};

const describe = kind =>
  typeof kind === 'string' ? KIND_NAMES[kind]
  : kind.oneOf ? kind.oneOf.map(value => JSON.stringify(value)).join(' or ')
  : kind.either ? kind.either.map(describe).join(', or ')
  : `{ ${Object.keys(kind).join(', ')} }`;

// The problems with one value: [] when it is of its kind.
function valueProblems(value, kind, isId, where) {
  const wrong = [`${where} should be ${describe(kind)}, not ${JSON.stringify(value)}`];
  const everyItem = itemKind => Array.isArray(value) && value.length > 0
    ? value.flatMap((item, index) => valueProblems(item, itemKind, isId, `${where}[${index}]`))
    : wrong;
  if (kind === 'text') return typeof value === 'string' && value !== '' ? [] : wrong;
  if (kind === 'number') return typeof value === 'number' && Number.isFinite(value) ? [] : wrong;
  if (kind === 'boolean') return typeof value === 'boolean' ? [] : wrong;
  if (kind === 'id') {
    if (typeof value !== 'string') return wrong;
    return isId(value) ? [] : [`${where} names ${value}, which is not an entry`];
  }
  if (kind === 'texts') return everyItem('text');
  if (kind === 'numbers') return everyItem('number');
  if (kind === 'ids') return everyItem('id');
  if (kind.oneOf) return kind.oneOf.some(allowed => JSON.stringify(allowed) === JSON.stringify(value)) ? [] : wrong;
  if (kind.either) {
    const attempts = kind.either.map(alternative => valueProblems(value, alternative, isId, where));
    return attempts.some(problems => problems.length === 0) ? [] : attempts.find(problems => !problems[0].includes(' should be ')) ?? wrong;
  }
  if (!value || typeof value !== 'object' || Array.isArray(value)) return wrong;
  const keys = Object.keys(value);
  if (keys.length !== Object.keys(kind).length || keys.some(key => !(key in kind))) return wrong;
  return keys.flatMap(key => valueProblems(value[key], kind[key], isId, `${where}.${key}`));
}

export function entryProblems(entry, isId) {
  const name = entry.id ?? '?';
  const problems = REQUIRED.filter(field => !entry[field]).map(field => `${name} is missing ${field}`);
  for (const [field, value] of Object.entries(entry)) {
    if (!(field in FIELDS)) { problems.push(`${name}: unknown field ${field} (fields are listed in tools/vocab-fields.mjs)`); continue; }
    if (value === undefined && !REQUIRED.includes(field)) continue;
    if (REQUIRED.includes(field) && !value) continue;
    problems.push(...valueProblems(value, FIELDS[field], isId, `${name}: ${field}`));
  }
  return problems;
}
