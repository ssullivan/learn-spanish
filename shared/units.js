/*
 * units.js — the registries of words and unit vocabularies, so every word
 * is defined once and any unit can use it. Load it before words/words.js
 * and any vocab.js. No other dependencies; tools/site.mjs loads it in Node
 * too.
 *
 * The dictionary (words/words.js) holds every word once, each with the
 * unit that teaches it; its audio and picture are in words/. A unit's
 * vocab.js lists the words it uses and builds its own phrases, whose audio
 * is in the unit.
 *
 *   Words.add(n, entries) register the words unit n teaches (called by
 *                         words/words.js): each gets taught: n
 *   Words.voice           the dictionary's voice (set by words/words.js)
 *   Words.get(id)         a copy of the word `id`; throws if there is none
 *   Words.list(ids)       copies of the words with those space-separated ids
 *   window.WORDS          { unit<n>: [entries] } for every unit with words
 *
 *   Units.add(n, vocab)   register unit n's vocab (called by unit<n>/vocab.js);
 *                         also sets window.VOCAB, so the page's own unit,
 *                         loaded last, is VOCAB. Returns vocab.
 *   Units.word(n, id)     a copy of unit n's entry `id` with unit: n, so its
 *                         audio and picture load from ../unit<n>/ (see
 *                         Core.audioSrc). A word that unit n borrowed keeps
 *                         its own unit, and a dictionary word its home in
 *                         words/, with what unit n added. Unit n's vocab.js
 *                         must be loaded first: tools/check.mjs --fix writes
 *                         it into the page.
 *   Units.teaches(vocab, entry)
 *                         whether that unit's vocab teaches the entry: its
 *                         own phrase, or a dictionary word taught there
 *                         (not one borrowed or taught earlier)
 *   Units.byId(vocabOrList)
 *                         { id: entry } for every entry in every list of a
 *                         vocab object, or of one list of entries
 *   Units.sentences(vocab)
 *                         say(ids, english, extra?): a sentence entry made of
 *                         the entries with those space-separated ids (looked
 *                         up in vocab as it is when say is made); an id ending
 *                         in "," puts a comma after its word. The Spanish is
 *                         the words joined, capitalised, and closed (going by
 *                         the English before any "(note)") by
 *                         "¿…?" if english ends in "?", "¡…!" if in "!", else
 *                         "."; words: [ids] (for Tiles.round); id: its plain
 *                         spelling (Spanish.plainId), plus "-question" for a
 *                         question, so a question and its statement (Ella es
 *                         maestra.) can both exist; img: false; plus extra
 *   window.UNITS          { n: vocab } for every loaded unit
 */
(function (root) {
  const units = root.UNITS = root.UNITS || {};
  const dictionaryByUnit = root.WORDS = root.WORDS || {};
  const wordsById = {};

  const entriesOf = vocab => Object.values(vocab).filter(Array.isArray).flat();
  const byId = vocabOrList => Object.fromEntries((Array.isArray(vocabOrList) ? vocabOrList : entriesOf(vocabOrList)).map(entry => [entry.id, entry]));

  function add(unitNumber, vocab) {
    units[unitNumber] = vocab;
    root.VOCAB = vocab;
    return vocab;
  }

  function word(unitNumber, id) {
    if (!units[unitNumber]) throw new Error(`unit ${unitNumber}'s vocab.js is not loaded`);
    const entry = entriesOf(units[unitNumber]).find(candidate => candidate.id === id);
    if (!entry) throw new Error(`unit ${unitNumber} has no word ${id}`);
    return entry.taught ? { ...entry } : { ...entry, unit: entry.unit ?? unitNumber };
  }

  const teaches = (vocab, entry) => entry.taught ? units[entry.taught] === vocab : !entry.unit;

  function addWords(unitNumber, entries) {
    dictionaryByUnit[`unit${unitNumber}`] = entries.map(entry => {
      if (wordsById[entry.id]) throw new Error(`the dictionary has two words ${entry.id}`);
      return wordsById[entry.id] = { ...entry, taught: unitNumber };
    });
  }

  function get(id) {
    if (!wordsById[id]) throw new Error(`the dictionary has no word ${id}`);
    return { ...wordsById[id] };
  }

  const list = ids => ids.trim().split(/\s+/).map(get);

  const capitalised = text => text.charAt(0).toUpperCase() + text.slice(1);
  // The English's own punctuation, before any note in brackets: "What is your name? (usted)".
  const closingMark = english => english.replace(/\s*\([^)]*\)$/, '').slice(-1);
  const punctuated = (text, english) => ({ '?': `¿${capitalised(text)}?`, '!': `¡${capitalised(text)}!` }[closingMark(english)] ?? `${capitalised(text)}.`);

  function sentences(vocab) {
    const entryById = byId(vocab);
    return (ids, english, extra) => {
      const parts = ids.trim().split(/\s+/).map(token => {
        const id = token.replace(/,$/, '');
        if (!entryById[id]) throw new Error(`no word ${id} for "${english}"`);
        return { entry: entryById[id], comma: token.endsWith(',') };
      });
      const spanish = punctuated(parts.map(({ entry, comma }) => entry.spanish + (comma ? ',' : '')).join(' '), english);
      const id = root.Spanish.plainId(spanish) + (closingMark(english) === '?' ? '-question' : '');
      return { id, words: parts.map(({ entry }) => entry.id), spanish, english, img: false, ...extra };
    };
  }

  root.Units = { add, word, teaches, byId, sentences };
  root.Words = { add: addWords, get, list, voice: undefined };
})(typeof window !== 'undefined' ? window : globalThis);
