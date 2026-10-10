/*
 * The dictionary: every word on the site, once, grouped by the unit that
 * teaches it. Its audio is words/audio/<id>.mp3 (tools/tts.mjs) and its
 * picture words/img/<id>.svg (from words/art.mjs, tools/draw.mjs).
 *
 *   Words.add(n, [entries])   the words unit n teaches (each gets taught: n)
 *
 * A unit's vocab.js takes the words it uses with Words.get(id) or
 * Words.list('a b c'), adding its own fields, and builds its phrases from
 * them. Entry fields are in tools/vocab-fields.mjs. An id is the word's
 * plain spelling (Spanish.plainId: no accents, ñ as ny, words joined by -)
 * and unique on the site: when two words would share one, the one with the
 * accent mark gets -tilde (papa, papa-tilde), or another gets a suffix
 * naming its sense.
 *
 * Spanish here is Mexico's: carro, computadora, jugo, ustedes.
 */
Words.voice = 'es-MX-DaliaNeural';

// Unit 1 · Sounds & Spelling · Sonidos
Words.add(1, [
  // One word for each vowel
  { id: 'casa', spanish: 'casa', english: 'house' },
  { id: 'mesa', spanish: 'mesa', english: 'table' },
  { id: 'libro', spanish: 'libro', english: 'book' },
  { id: 'sol', spanish: 'sol', english: 'sun' },
  { id: 'luna', spanish: 'luna', english: 'moon' },

  // Letters that don't sound the way English spells
  { id: 'hola', spanish: 'hola', english: 'hello', img: false },
  { id: 'huevo', spanish: 'huevo', english: 'egg' },
  { id: 'jugo', spanish: 'jugo', english: 'juice' },
  { id: 'gente', spanish: 'gente', english: 'people', img: false },
  { id: 'gato', spanish: 'gato', english: 'cat' },
  { id: 'guitarra', spanish: 'guitarra', english: 'guitar' },
  { id: 'queso', spanish: 'queso', english: 'cheese' },
  { id: 'llave', spanish: 'llave', english: 'key' },
  { id: 'yo', spanish: 'yo', english: 'I', img: false },
  { id: 'pinya', spanish: 'piña', english: 'pineapple' },
  { id: 'perro', spanish: 'perro', english: 'dog' },
  { id: 'zapato', spanish: 'zapato', english: 'shoe' },
  { id: 'cielo', spanish: 'cielo', english: 'sky', img: false },
  { id: 'vaso', spanish: 'vaso', english: 'glass' },
  { id: 'barco', spanish: 'barco', english: 'boat' },

  // Sound-alikes: words told apart by one vowel, r or rr, n or ñ, or stress
  { id: 'masa', spanish: 'masa', english: 'dough', note: 'Corn dough, for tortillas and tamales.', img: false },
  { id: 'misa', spanish: 'misa', english: 'Mass (church)', img: false },
  { id: 'paso', spanish: 'paso', english: 'step', img: false },
  { id: 'peso', spanish: 'peso', english: 'weight; peso', note: 'Also Mexico\'s money.', img: false },
  { id: 'piso', spanish: 'piso', english: 'floor', img: false },
  { id: 'palo', spanish: 'palo', english: 'stick', img: false },
  { id: 'pelo', spanish: 'pelo', english: 'hair', img: false },
  { id: 'sal', spanish: 'sal', english: 'salt', img: false },
  { id: 'pero', spanish: 'pero', english: 'but', img: false },
  { id: 'caro', spanish: 'caro', english: 'expensive', img: false },
  { id: 'carro', spanish: 'carro', english: 'car', img: false },
  { id: 'coro', spanish: 'coro', english: 'choir', img: false },
  { id: 'corro', spanish: 'corro', english: 'I run', img: false },
  { id: 'una', spanish: 'una', english: 'one, a', img: false },
  { id: 'unya', spanish: 'uña', english: 'fingernail', img: false },
  { id: 'mono', spanish: 'mono', english: 'monkey', img: false },
  { id: 'monyo', spanish: 'moño', english: 'hair bow', img: false },
  { id: 'cana', spanish: 'cana', english: 'grey hair', img: false },
  { id: 'canya', spanish: 'caña', english: 'sugar cane', img: false },
  { id: 'papa', spanish: 'papa', english: 'potato', img: false },
  { id: 'papa-tilde', spanish: 'papá', english: 'dad', img: false },
  { id: 'hablo', spanish: 'hablo', english: 'I speak', img: false },
  { id: 'hablo-tilde', spanish: 'habló', english: 'she or he spoke', img: false },
  { id: 'sabana', spanish: 'sabana', english: 'savanna', img: false },
  { id: 'sabana-tilde', spanish: 'sábana', english: 'bed sheet', img: false },
  { id: 'esta', spanish: 'esta', english: 'this', img: false },
  { id: 'esta-tilde', spanish: 'está', english: 'is', img: false },

  // Words that sound almost like English, to practise stress
  { id: 'cafe', spanish: 'café', english: 'coffee', img: false },
  { id: 'sofa', spanish: 'sofá', english: 'sofa', img: false },
  { id: 'lapiz', spanish: 'lápiz', english: 'pencil', img: false },
  { id: 'arbol', spanish: 'árbol', english: 'tree', img: false },
  { id: 'reloj', spanish: 'reloj', english: 'clock, watch', img: false },
  { id: 'ciudad', spanish: 'ciudad', english: 'city', img: false },
  { id: 'doctor', spanish: 'doctor', english: 'doctor', img: false },
  { id: 'hospital', spanish: 'hospital', english: 'hospital', img: false },
  { id: 'animal', spanish: 'animal', english: 'animal', img: false },
  { id: 'chocolate', spanish: 'chocolate', english: 'chocolate', img: false },
  { id: 'aguacate', spanish: 'aguacate', english: 'avocado', img: false },
  { id: 'tomate', spanish: 'tomate', english: 'tomato', img: false },
  { id: 'telefono', spanish: 'teléfono', english: 'telephone', img: false },
  { id: 'musica', spanish: 'música', english: 'music', img: false },
  { id: 'platano', spanish: 'plátano', english: 'banana', img: false },
  { id: 'computadora', spanish: 'computadora', english: 'computer', img: false },

  // Praise: every game says ¡Excelente! after a perfect level (shared/game.js CHEER)
  { id: 'excelente', spanish: '¡Excelente!', english: 'Excellent!', img: false },
  { id: 'muy-bien', spanish: '¡Muy bien!', english: 'Very good!', img: false },
]);
