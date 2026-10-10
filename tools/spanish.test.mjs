#!/usr/bin/env node
/*
 * spanish.test.mjs — tests shared/spanish.js: syllable breaks, the stressed
 * syllable, and ids. Run by tools/check.mjs; exits 1 on failure.
 */
import { loadShared } from './site.mjs';
import { tester } from './testing.mjs';

const { ok, finish } = tester('spanish');
const { Spanish } = loadShared('shared/spanish.js');

// word → its syllables, the stressed one in capitals
const EXPECTED = {
  casa: 'CA sa', perro: 'PE rro', llave: 'LLA ve', niño: 'NI ño', coche: 'CO che',
  papa: 'PA pa', papá: 'pa PÁ', hablo: 'HA blo', habló: 'ha BLÓ', sábana: 'SÁ ba na', sabana: 'sa BA na',
  ciudad: 'ciu DAD', huevo: 'HUE vo', ruido: 'RUI do', día: 'DÍ a', país: 'pa ÍS', leer: 'le ER', caer: 'ca ER',
  aeropuerto: 'a e ro PUER to', ahora: 'a HO ra',
  instante: 'ins TAN te', abstracto: 'abs TRAC to', atlas: 'A tlas', hombre: 'HOM bre',
  queso: 'QUE so', guitarra: 'gui TA rra', pingüino: 'pin GÜI no', aguacate: 'a gua CA te',
  hoy: 'HOY', muy: 'MUY', estoy: 'es TOY', reyes: 'RE yes', yo: 'YO', sol: 'SOL',
  árbol: 'ÁR bol', reloj: 're LOJ', examen: 'e XA men', feliz: 'fe LIZ', lápiz: 'LÁ piz',
  teléfono: 'te LÉ fo no', plátano: 'PLÁ ta no', completo: 'com PLE to', computadora: 'com pu ta DO ra', '¡Excelente!': 'Ex ce LEN te',
};

for (const [word, expected] of Object.entries(EXPECTED)) {
  const parts = Spanish.syllables(word);
  const stressed = Spanish.stressedSyllable(word);
  const got = parts.map((part, index) => index === stressed ? part.toUpperCase() : part).join(' ');
  ok(`${word}: ${expected}`, got === expected, got);
}

ok('syllables keep the word\'s own capitals and accents', Spanish.syllables('Árbol').join('·') === 'Ár·bol');
ok('plainId: lower case, no accents, ñ as ny', Spanish.plainId('Niño') === 'ninyo' && Spanish.plainId('papá') === 'papa');
ok('plainId: punctuation dropped, words joined by -', Spanish.plainId('¡Buenos días!') === 'buenos-dias');
ok('isOneWord', Spanish.isOneWord('casa') && !Spanish.isOneWord('buenos días'));

finish();
