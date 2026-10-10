#!/usr/bin/env node
/*
 * units.test.mjs — tests the dictionary and borrowing words between
 * units: shared/units.js, tools/site.mjs's loadVocab, homeOf and isOwn,
 * Core.audioSrc / imgSrc paths, and that game.js's CHEER is the word it
 * names. Run by tools/check.mjs; exits 1 on failure.
 */
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import vm from 'node:vm';
import { ROOT, loadShared, loadVocab, entries, isOwn, homeOf } from './site.mjs';
import { tester } from './testing.mjs';

const { ok, finish } = tester('units');
const sandbox = loadShared('shared/spanish.js', 'shared/units.js', 'shared/core.js');
const { Units, Words, Core } = sandbox;
const throws = action => { try { action(); return false; } catch { return true; } };

// Borrowing a unit's own entry
Units.add(3, { phrases: [{ id: 'gato', spanish: 'gato', english: 'cat' }] });
const cat = Units.word(3, 'gato');
ok('a borrowed entry keeps its fields', cat.spanish === 'gato' && cat.unit === 3, JSON.stringify(cat));
ok('borrowing copies, not shares', !('unit' in sandbox.UNITS[3].phrases[0]));
ok('a borrowed entry\'s audio is in its unit', Core.audioSrc(cat) === '../unit3/audio/gato.mp3', Core.audioSrc(cat));
ok('a borrowed entry\'s picture is in its unit', Core.imgSrc(cat) === '../unit3/img/gato.svg', Core.imgSrc(cat));
ok('a unit\'s own entry has relative paths', Core.audioSrc({ id: 'perro' }) === 'audio/perro.mp3');
ok('an unknown entry throws', throws(() => Units.word(3, 'perro')));
ok('an unloaded unit throws', throws(() => Units.word(9, 'gato')));

// The dictionary
Words.add(2, [{ id: 'perro', spanish: 'perro', english: 'dog' }]);
Words.add(4, [{ id: 'pajaro', spanish: 'pájaro', english: 'bird' }]);
const dog = Words.get('perro');
ok('a word knows the unit that teaches it', dog.taught === 2 && dog.spanish === 'perro', JSON.stringify(dog));
ok('Words.get copies', (dog.legs = 4) && !('legs' in Words.get('perro')));
ok('a word\'s files are in words/', Core.audioSrc(dog) === '../words/audio/perro.mp3' && Core.imgSrc(dog) === '../words/img/perro.svg', Core.audioSrc(dog));
ok('Words.list takes space-separated ids', Words.list(' perro  pajaro ').map(word => word.id).join() === 'perro,pajaro');
ok('an unknown word throws', throws(() => Words.get('vaca')) && throws(() => Words.list('perro vaca')));
ok('a word added twice throws', throws(() => Words.add(5, [{ id: 'perro' }])));
ok('WORDS has each unit\'s words', sandbox.WORDS.unit2.length === 1 && sandbox.WORDS.unit4[0].id === 'pajaro');
const unit4 = Units.add(4, { voice: 'x', animals: [{ ...Words.get('perro'), legs: 4 }, Words.get('pajaro')] });
const dogFromUnit4 = Units.word(4, 'perro');
ok('borrowing a unit\'s dictionary word keeps words/ and what the unit added', !('unit' in dogFromUnit4) && dogFromUnit4.legs === 4
  && Core.audioSrc(dogFromUnit4) === '../words/audio/perro.mp3', JSON.stringify(dogFromUnit4));
ok('a unit teaches its own words, not earlier ones', Units.teaches(unit4, unit4.animals[1]) && !Units.teaches(unit4, unit4.animals[0]));
ok('a unit teaches its own phrases, not borrowed ones', Units.teaches(sandbox.UNITS[3], sandbox.UNITS[3].phrases[0]) && !Units.teaches(unit4, cat));
ok('homeOf: words for a dictionary word, the unit for a borrowed one, else here',
  homeOf(dogFromUnit4, 'unit9') === 'words' && homeOf(cat, 'unit9') === 'unit3' && homeOf({ id: 'x' }, 'unit9') === 'unit9');
ok('isOwn: a dictionary word only in words', isOwn(dogFromUnit4, 'words') && !isOwn(dogFromUnit4, 'unit4') && isOwn({ id: 'x' }, 'unit4'));
const twiceBorrowed = (Units.add(5, { phrases: [{ ...cat, legs: 4 }] }), Units.word(5, 'gato'));
ok('borrowing a borrowed entry keeps its home unit', twiceBorrowed.unit === 3 && twiceBorrowed.legs === 4 && Core.imgSrc(twiceBorrowed) === '../unit3/img/gato.svg', JSON.stringify(twiceBorrowed));

const entryById = Units.byId({ voice: 'x', words: [{ id: 'a' }, { id: 'b' }], more: [{ id: 'c' }] });
ok('byId has every entry of every list', Object.keys(entryById).join() === 'a,b,c', Object.keys(entryById).join());
ok('byId of one list', Object.keys(Units.byId([{ id: 'x' }, { id: 'y' }])).join() === 'x,y');
ok('byId gives the entries themselves', Units.byId(sandbox.UNITS[3]).gato === sandbox.UNITS[3].phrases[0]);

// Sentences from word ids
const say = Units.sentences({ words: [
  { id: 'yo', spanish: 'yo' }, { id: 'soy', spanish: 'soy' }, { id: 'eres', spanish: 'eres' }, { id: 'de', spanish: 'de' },
  { id: 'mexico', spanish: 'México' }, { id: 'si-tilde', spanish: 'sí' }, { id: 'como-tilde', spanish: 'cómo' }, { id: 'te-llamas', spanish: 'te llamas' },
] });
const statement = say('yo soy de mexico', 'I am from Mexico.', { note: 'n' });
ok('a statement is capitalised and ends in "."', statement.spanish === 'Yo soy de México.' && statement.id === 'yo-soy-de-mexico', JSON.stringify(statement));
ok('a sentence keeps its word ids, has no picture, and takes extra fields', statement.words.join() === 'yo,soy,de,mexico' && statement.img === false && statement.note === 'n');
const question = say('eres de mexico', 'Are you from Mexico?');
ok('a question gets ¿ ? and an id ending in -question', question.spanish === '¿Eres de México?' && question.id === 'eres-de-mexico-question', JSON.stringify(question));
ok('a question is told by the English before a (note)', say('como-tilde te-llamas', 'What is your name? (tú)').spanish === '¿Cómo te llamas?', say('como-tilde te-llamas', 'What is your name? (tú)').spanish);
ok('an id ending in "," puts a comma after its word', say('si-tilde, soy de mexico', 'Yes, I am from Mexico.').spanish === 'Sí, soy de México.', say('si-tilde, soy de mexico', 'Yes, I am from Mexico.').spanish);
ok('an exclamation gets ¡ !', say('si-tilde', 'Yes!').spanish === '¡Sí!');
ok('a sentence with an unknown word throws', throws(() => say('yo soy ana', 'I am Ana.')));

// The real site
ok('loadVocab("words") is the dictionary, with its voice', typeof loadVocab('words')?.voice === 'string');
const unit1 = loadVocab('unit1');
const families = new Map();
for (const entry of entries(unit1).filter(entry => entry.contrast)) families.set(entry.family, [...(families.get(entry.family) ?? []), entry]);
const loneFamilies = [...families].filter(([, members]) => members.length < 2).map(([family]) => family);
ok('unit 1: every sound-alike family has two or more words to choose from', !loneFamilies.length, loneFamilies.join(' '));
const mixedFamilies = [...families].filter(([, members]) => new Set(members.map(member => member.contrast)).size > 1).map(([family]) => family);
ok('unit 1: a family\'s words differ in one way only', !mixedFamilies.length, mixedFamilies.join(' '));

// Every game says unit 1's ¡Excelente! after a perfect level (CHEER in
// game.js): written out there, so its clip's path must be the word's.
const cheerSource = /const CHEER = (\{[^}]*\});/.exec(readFileSync(join(ROOT, 'shared/game.js'), 'utf8'))?.[1];
const CHEER = cheerSource && vm.runInContext(`(${cheerSource})`, sandbox);
const cheered = CHEER && entries(loadVocab(`unit${CHEER.taught}`)).find(entry => entry.id === CHEER.id);
ok('game.js\'s CHEER is its word, with the same spelling and clip', cheered?.spanish === CHEER?.spanish && Core.audioSrc(CHEER) === Core.audioSrc(cheered ?? {}),
  `${Core.audioSrc(CHEER ?? {})} vs ${Core.audioSrc(cheered ?? {})}`);

finish();
