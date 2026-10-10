/*
 * spanish.js — Spanish spelling rules, derived rather than typed: where a
 * word's syllables break and which one is stressed. No dependencies; runs
 * in the browser (window.Spanish) and in Node (tools/ load it with vm).
 *
 *   Spanish.syllables(word)       ["ca", "sa"]: the word's syllables, in its
 *                                 own spelling (accents and capitals kept;
 *                                 surrounding punctuation dropped)
 *   Spanish.stressedSyllable(word)
 *                                 index into syllables(word) of the stressed
 *                                 syllable: the one with an accent mark if
 *                                 there is one; else the second to last if
 *                                 the word ends in a vowel, n or s; else the
 *                                 last
 *   Spanish.plainId(text)         the id a word or phrase's files are named
 *                                 by: lower case, accents dropped, ñ as ny,
 *                                 words joined by "-" ("¡Buenos días!" →
 *                                 "buenos-dias")
 *   Spanish.isOneWord(text)       true for a single word (no spaces)
 *
 * Syllables follow the Real Academia's rules, as taught in Mexico:
 *   - ch, ll and rr are one consonant; the u of que, qui, gue, gui is silent
 *     and goes with its consonant (que·so, gui·ta·rra), but ü is a vowel
 *     (pin·güi·no)
 *   - y is a vowel at the end of a word or before a consonant (hoy, muy) and
 *     a consonant before a vowel (yo, re·yes)
 *   - a weak vowel (i, u) beside another vowel makes a diphthong (ciu·dad,
 *     hue·vo); two strong vowels (a, e, o) or an accented í or ú split
 *     (le·er, dí·a, pa·ís)
 *   - one consonant between vowels starts the next syllable (ca·sa); two
 *     split (per·ro is spelled pe·rro, rr being one) unless they are a
 *     cluster that starts syllables (pl pr bl br cl cr dr fl fr gl gr tr kr,
 *     and tl, as Mexico says a·tlas); of three or more, the last two go on
 *     if they are such a cluster, else the last one does (ins·tan·te,
 *     abs·trac·to)
 */
(function (root) {
  const STRONG_VOWELS = new Set([...'aeoáéóíú']);   // í and ú break a diphthong
  const WEAK_VOWELS = new Set([...'iuü']);
  const ACCENTED_VOWELS = new Set([...'áéíóú']);
  const ONE_CONSONANT_PAIRS = new Set(['ch', 'll', 'rr']);
  const ONSET_CLUSTERS = new Set(['pl', 'pr', 'bl', 'br', 'cl', 'cr', 'dr', 'fl', 'fr', 'gl', 'gr', 'tr', 'kr', 'kl', 'tl']);
  const ENDINGS_STRESSED_SECOND_TO_LAST = new Set([...'aeiouns']);

  const isVowelLetter = letter => STRONG_VOWELS.has(letter) || WEAK_VOWELS.has(letter);
  const lettersOnly = text => text.replace(/[^\p{L}]/gu, '');

  // The word as sound units, each { text, isVowel }, `text` in the word's
  // own spelling.
  function soundUnits(word) {
    const spelling = lettersOnly(word);
    const lower = spelling.toLowerCase();
    const units = [];
    for (let i = 0; i < lower.length;) {
      const pair = lower.slice(i, i + 2);
      const afterPair = lower[i + 2] ?? '';
      const silentU = (pair === 'qu' || pair === 'gu') && /[eiéí]/.test(afterPair);
      if (ONE_CONSONANT_PAIRS.has(pair) || silentU) {
        units.push({ text: spelling.slice(i, i + 2), isVowel: false });
        i += 2;
        continue;
      }
      const letter = lower[i];
      const yIsVowel = letter === 'y' && !isVowelLetter(lower[i + 1] ?? '');
      units.push({ text: spelling[i], isVowel: isVowelLetter(letter) || yIsVowel, letter: yIsVowel ? 'i' : letter });
      i += 1;
    }
    return units;
  }

  // Two vowels side by side are said apart (a hiatus) when neither is weak.
  const isHiatus = (first, second) => STRONG_VOWELS.has(first.letter) && STRONG_VOWELS.has(second.letter);

  // How many of the consonants between two vowel groups start the next
  // syllable.
  function consonantsStartingNext(consonants) {
    const lastTwo = consonants.slice(-2).map(unit => unit.text.toLowerCase()).join('');
    if (consonants.length <= 1) return consonants.length;
    return ONSET_CLUSTERS.has(lastTwo) ? 2 : 1;
  }

  function syllables(word) {
    const units = soundUnits(word);
    // Group the units into vowel nuclei and the consonants around them.
    const nuclei = [];
    let consonantsBefore = [];
    for (const unit of units) {
      if (!unit.isVowel) { consonantsBefore.push(unit); continue; }
      const previousNucleus = nuclei.at(-1);
      const joinsPrevious = previousNucleus && !consonantsBefore.length && !isHiatus(previousNucleus.vowels.at(-1), unit);
      if (joinsPrevious) previousNucleus.vowels.push(unit);
      else nuclei.push({ consonantsBefore, vowels: [unit] });
      consonantsBefore = [];
    }
    if (!nuclei.length) return [lettersOnly(word)];
    const trailingConsonants = consonantsBefore;

    const result = nuclei.map(() => '');
    nuclei.forEach((nucleus, index) => {
      const between = nucleus.consonantsBefore;
      const startingHere = index === 0 ? between.length : consonantsStartingNext(between);
      const endingPrevious = between.slice(0, between.length - startingHere);
      if (index > 0) result[index - 1] += endingPrevious.map(unit => unit.text).join('');
      result[index] += between.slice(between.length - startingHere).map(unit => unit.text).join('') + nucleus.vowels.map(unit => unit.text).join('');
    });
    result[result.length - 1] += trailingConsonants.map(unit => unit.text).join('');
    return result;
  }

  function stressedSyllable(word) {
    const parts = syllables(word);
    const marked = parts.findIndex(part => [...part.toLowerCase()].some(letter => ACCENTED_VOWELS.has(letter)));
    if (marked >= 0) return marked;
    const lastLetter = lettersOnly(word).toLowerCase().at(-1);
    return ENDINGS_STRESSED_SECOND_TO_LAST.has(lastLetter) ? Math.max(0, parts.length - 2) : parts.length - 1;
  }

  const plainId = text => text.toLowerCase()
    .replace(/ñ/g, 'ny')
    .normalize('NFD').replace(/\p{Mn}/gu, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');

  const isOneWord = text => !/\s/.test(text.trim());

  root.Spanish = { syllables, stressedSyllable, plainId, isOneWord };
})(typeof window !== 'undefined' ? window : globalThis);
