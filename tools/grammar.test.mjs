#!/usr/bin/env node
/*
 * grammar.test.mjs — checks every derived sentence on the site (entries
 * with `words`, from Units.sentences) for agreement, from the fields its
 * words carry (tools/vocab-fields.mjs):
 *   - person: every word with a grammatical person (a subject pronoun, a
 *     verb form) has the same one, so "yo es" fails. Sentences are one
 *     clause for now; a sentence with two subjects needs this rule refined
 *   - gender: every word with a gender (él, ella, maestro, doctora...) has
 *     the same one, and a first-person sentence's gendered words match the
 *     speaker's voice (a woman says "soy maestra")
 * Also tests these rules on made-up sentences, so they can fail. Run by
 * tools/check.mjs; exits 1 on failure.
 */
import { unitDirs, loadVocab, entries } from './site.mjs';
import { tester } from './testing.mjs';

const { ok, finish } = tester('grammar');

const VOICE_GENDER = { 'es-MX-DaliaNeural': 'feminine', 'es-MX-JorgeNeural': 'masculine' };

// [problems] with one sentence, its words looked up in entryById.
function agreementProblems(sentence, entryById, unitVoice) {
  const words = sentence.words.map(id => entryById[id]);
  const problems = [];
  const persons = new Set(words.map(word => word.person).filter(Boolean));
  if (persons.size > 1) problems.push(`mixes ${[...persons].join(' and ')}`);
  const genders = new Set(words.map(word => word.gender).filter(Boolean));
  if (genders.size > 1) problems.push(`mixes ${[...genders].join(' and ')}`);
  const speakerGender = VOICE_GENDER[sentence.voice ?? unitVoice];
  if (persons.has('first-singular') && genders.size === 1 && !genders.has(speakerGender)) {
    problems.push(`a ${speakerGender} voice says ${[...genders][0]} words about themself`);
  }
  return problems;
}

// The rules on made-up sentences.
const MADE_UP = Object.fromEntries([
  { id: 'yo', person: 'first-singular' }, { id: 'soy', person: 'first-singular' }, { id: 'es', person: 'third-singular' },
  { id: 'el', person: 'third-singular', gender: 'masculine' }, { id: 'maestra', gender: 'feminine' }, { id: 'maestro', gender: 'masculine' },
].map(word => [word.id, word]));
const problemsWith = (ids, voice = 'es-MX-DaliaNeural') => agreementProblems({ words: ids.split(' ') }, MADE_UP, voice);
ok('agreeing sentences pass', !problemsWith('yo soy maestra').length && !problemsWith('el es maestro').length, problemsWith('yo soy maestra').join('; '));
ok('a verb in another person fails', problemsWith('yo es maestra').some(problem => problem.includes('mixes')), problemsWith('yo es maestra').join('; '));
ok('a noun of another gender fails', problemsWith('el es maestra').some(problem => problem.includes('mixes')), problemsWith('el es maestra').join('; '));
ok('a woman calling herself maestro fails', problemsWith('yo soy maestro').some(problem => problem.includes('voice')), problemsWith('yo soy maestro').join('; '));
ok('a man calling himself maestro passes', !problemsWith('yo soy maestro', 'es-MX-JorgeNeural').length);

// Every sentence on the site.
for (const unit of unitDirs()) {
  const vocab = loadVocab(unit);
  if (!vocab) continue;
  const all = entries(vocab);
  const entryById = Object.fromEntries(all.map(entry => [entry.id, entry]));
  const wrong = all.filter(entry => entry.words)
    .map(sentence => [sentence, agreementProblems(sentence, entryById, vocab.voice)])
    .filter(([, problems]) => problems.length)
    .map(([sentence, problems]) => `"${sentence.spanish}" ${problems.join('; ')}`);
  ok(`${unit}: every sentence agrees`, !wrong.length, wrong.join(' | '));
}

finish();
