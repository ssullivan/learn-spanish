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

// Unit 2 · Greetings · Saludos
Words.add(2, [
  // Hello and goodbye
  { id: 'buenos-dias', spanish: 'Buenos días', english: 'Good morning', note: 'Until about noon.' },
  { id: 'buenas-tardes', spanish: 'Buenas tardes', english: 'Good afternoon', note: 'From noon until dark.' },
  { id: 'buenas-noches', spanish: 'Buenas noches', english: 'Good evening; good night', note: 'After dark, to say hello or goodbye.' },
  { id: 'adios', spanish: 'Adiós', english: 'Goodbye' },
  { id: 'hasta-luego', spanish: 'Hasta luego', english: 'See you later', img: false, note: 'The everyday goodbye, even if it won\'t be soon.' },
  { id: 'hasta-manyana', spanish: 'Hasta mañana', english: 'See you tomorrow', img: false },
  { id: 'nos-vemos', spanish: 'Nos vemos', english: 'See you', img: false },

  // How are you?
  { id: 'como-estas', spanish: '¿Cómo estás?', english: 'How are you? (tú)', img: false },
  { id: 'como-esta-usted', spanish: '¿Cómo está usted?', english: 'How are you? (usted)', img: false },
  { id: 'que-tal', spanish: '¿Qué tal?', english: 'How\'s it going?', img: false },
  { id: 'que-onda', spanish: '¿Qué onda?', english: 'What\'s up?', img: false, note: 'Mexican slang, for friends.' },
  { id: 'bien-gracias', spanish: 'Bien, gracias.', english: 'Fine, thanks.', img: false },
  { id: 'muy-bien-gracias', spanish: 'Muy bien, gracias.', english: 'Very well, thanks.', img: false },
  { id: 'mas-o-menos', spanish: 'Más o menos.', english: 'So-so.', img: false },
  { id: 'y-tu', spanish: '¿Y tú?', english: 'And you? (tú)', img: false },
  { id: 'y-usted', spanish: '¿Y usted?', english: 'And you? (usted)', img: false },

  // Please, thank you, sorry
  { id: 'por-favor', spanish: 'Por favor', english: 'Please', img: false },
  { id: 'gracias', spanish: 'Gracias', english: 'Thank you' },
  { id: 'muchas-gracias', spanish: 'Muchas gracias', english: 'Thank you very much', img: false },
  { id: 'de-nada', spanish: 'De nada', english: 'You\'re welcome', img: false },
  { id: 'perdon', spanish: 'Perdón', english: 'Excuse me; sorry', img: false, note: 'To get someone\'s attention, or for a small slip.' },
  { id: 'con-permiso', spanish: 'Con permiso', english: 'Excuse me (may I pass?)', img: false, note: 'Before you squeeze past someone or leave the table.' },
  { id: 'lo-siento', spanish: 'Lo siento', english: 'I\'m sorry', img: false, note: 'For real regret or sympathy.' },
  { id: 'no-pasa-nada', spanish: 'No pasa nada', english: 'No problem; don\'t worry', img: false },
  { id: 'adelante', spanish: 'Adelante', english: 'Go ahead', img: false },

  // Meeting someone
  { id: 'mucho-gusto', spanish: 'Mucho gusto', english: 'Nice to meet you', img: false },
  { id: 'igualmente', spanish: 'Igualmente', english: 'Likewise', img: false },
]);
