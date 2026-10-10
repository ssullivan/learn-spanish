#!/usr/bin/env node
/*
 * stress.test.mjs — tests shared/stress.js's Stress.questionsIn (which
 * words of an entry Stress Detective asks about) and Stress.marked. Run by
 * tools/check.mjs; exits 1 on failure.
 */
import { loadShared } from './site.mjs';
import { tester } from './testing.mjs';

const { ok, finish } = tester('stress');
const { Stress } = loadShared('shared/core.js', 'shared/spanish.js', 'shared/stress.js');

const asked = (...texts) => Stress.questionsIn(texts.map((spanish, index) => ({ id: `e${index}`, spanish }))).map(question => question.id).join(' ');

ok('a word of two or more syllables is asked about', asked('casa') === 'e0:casa', asked('casa'));
ok('a one-syllable word is not', asked('sol') === '', asked('sol'));
ok('each long enough word of a phrase is asked about, punctuation dropped', asked('¿Cómo está usted?') === 'e0:Cómo e0:está e0:usted', asked('¿Cómo está usted?'));
ok('short words in a phrase are skipped', asked('Bien, gracias.') === 'e0:gracias', asked('Bien, gracias.'));
ok('a word twice in one phrase is asked once, in order', asked('Hola gracias hola') === 'e0:Hola e0:gracias', asked('Hola gracias hola'));
ok('questions count syllables', Stress.questionsIn([{ id: 'x', spanish: 'teléfono' }])[0].syllables === 4);
ok('marked: the stressed syllable in bold', Stress.marked('papá') === '<span class="es" lang="es-MX">pa·<strong>pá</strong></span>', Stress.marked('papá'));

finish();
