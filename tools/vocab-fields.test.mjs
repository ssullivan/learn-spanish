#!/usr/bin/env node
/*
 * vocab-fields.test.mjs — tests tools/vocab-fields.mjs, which checks each
 * vocab entry's fields. Run by tools/check.mjs; exits 1 on failure.
 */
import { entryProblems } from './vocab-fields.mjs';
import { tester } from './testing.mjs';

const { ok, finish } = tester('vocab-fields');

const KNOWN_IDS = new Set(['mesa', 'pero', 'perro']);
const isId = id => KNOWN_IDS.has(id);
const word = extra => ({ id: 'perro', spanish: 'perro', english: 'dog', ...extra });
const problems = extra => entryProblems(word(extra), isId);
const reports = (extra, text) => problems(extra).some(problem => problem.includes(text));

ok('a plain word has no problems', problems({}).length === 0, problems({}).join('; '));
ok('every field with a good value has no problems', problems({
  note: 'A note.', img: false, say: 'perro', voice: 'es-MX-JorgeNeural', unit: 1, letter: 'rr', contrast: 'r-rr', family: 'pero', reply: ['mesa'], when: ['At home.'],
}).length === 0, problems({ img: false }).join('; '));

// Misspelt and missing fields.
ok('unknown field is named', reports({ contrats: 'vowel' }, 'unknown field contrats'), problems({ contrats: 'vowel' }).join('; '));
const missing = entryProblems({ id: 'x', spanish: 'gato' }, isId);
ok('missing required field', missing.some(problem => problem === 'x is missing english'), missing.join('; '));
ok('undefined clears an optional field', problems({ note: undefined, family: undefined }).length === 0);
const blank = entryProblems({ id: 'x', spanish: '', english: 'cat' }, isId);
ok('an empty required field is missing, once', blank.length === 1 && blank[0] === 'x is missing spanish', blank.join('; '));

// Kinds.
ok('text: not a number', reports({ note: 3 }, 'note should be text'));
ok('text: not empty', reports({ note: '' }, 'note should be text'));
ok('number: not a string', reports({ unit: '2' }, 'unit should be a number'));
ok('oneOf: false only for img', reports({ img: true }, 'img should be false'));
ok('oneOf: fixed values', reports({ contrast: 'tone' }, 'contrast should be "vowel" or "r-rr" or "n-ny" or "stress"'), problems({ contrast: 'tone' }).join('; '));

ok('lists: not a lone value', reports({ when: 'At home.' }, 'when should be a list of texts'));
ok('lists: not empty', reports({ reply: [] }, 'reply should be a list of entry ids'));

// Ids must name entries.
ok('id: names an entry', reports({ family: 'pera' }, 'family names pera, which is not an entry'), problems({ family: 'pera' }).join('; '));
ok('ids: each must name an entry', reports({ reply: ['mesa', 'meza'] }, 'reply[1] names meza'), problems({ reply: ['mesa', 'meza'] }).join('; '));

finish();
