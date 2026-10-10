/*
 * Unit 1 vocabulary, for its pages, tools/tts.mjs and tools/check.mjs: the
 * words it uses, from the dictionary (words/words.js; the ones it teaches
 * are under unit 1 there, with their audio and pictures in words/), with
 * the fields this unit adds.
 *
 * Fields this unit adds:
 *   letter     the letter or pair the word shows off (vowels, letters)
 *   contrast   what tells a sound-alike apart from the rest of its family:
 *              'vowel', 'r-rr', 'n-ny' or 'stress'
 *   family     the id of the word its family is named after: words with the
 *              same family sound alike but for their contrast
 */
(function () {
  const withFields = (fields, ids) => Words.list(ids).map(word => ({ ...word, ...fields }));
  // A family of sound-alikes, named after its first word.
  const soundAlikes = (contrast, ids) => withFields({ contrast, family: ids.trim().split(/\s+/)[0] }, ids);

  const vocab = Units.add(1, {
    voice: 'es-MX-DaliaNeural',

    vowels: [
      { ...Words.get('casa'), letter: 'a' },
      { ...Words.get('mesa'), letter: 'e', contrast: 'vowel', family: 'masa' },
      { ...Words.get('libro'), letter: 'i' },
      { ...Words.get('sol'), letter: 'o', contrast: 'vowel', family: 'sal' },
      { ...Words.get('luna'), letter: 'u' },
    ],

    letters: [
      { ...Words.get('hola'), letter: 'h', note: 'H is always silent.' },
      { ...Words.get('huevo'), letter: 'h' },
      { ...Words.get('jugo'), letter: 'j', note: 'J sounds like a breathy English h.' },
      { ...Words.get('gente'), letter: 'g', note: 'G before e or i sounds like j.' },
      { ...Words.get('gato'), letter: 'g', note: 'G before a, o or u is hard, as in English.' },
      { ...Words.get('guitarra'), letter: 'gu', note: 'In gue and gui the u is silent.' },
      { ...Words.get('queso'), letter: 'qu', note: 'Qu sounds like k; the u is silent.' },
      { ...Words.get('llave'), letter: 'll', note: 'Ll sounds like the y in yes.' },
      { ...Words.get('playa'), letter: 'y', note: 'Y sounds like ll.' },
      { ...Words.get('pinya'), letter: 'ñ', note: 'Ñ sounds like the ny in canyon.' },
      { ...Words.get('perro'), letter: 'rr', contrast: 'r-rr', family: 'pero', note: 'Rr is rolled: the tip of the tongue trills.' },
      { ...Words.get('zapato'), letter: 'z', note: 'In Mexico z sounds like s.' },
      { ...Words.get('cielo'), letter: 'c', note: 'C before e or i sounds like s.' },
      { ...Words.get('vaso'), letter: 'v', note: 'V and b sound the same.' },
      { ...Words.get('barco'), letter: 'b' },
    ],

    soundAlikes: [
      ...soundAlikes('vowel', 'masa misa'),
      ...soundAlikes('vowel', 'paso peso piso'),
      ...soundAlikes('vowel', 'palo pelo'),
      ...soundAlikes('vowel', 'sal'),
      ...soundAlikes('r-rr', 'pero'),
      ...soundAlikes('r-rr', 'caro carro'),
      ...soundAlikes('r-rr', 'coro corro'),
      ...soundAlikes('n-ny', 'una unya'),
      ...soundAlikes('n-ny', 'mono monyo'),
      ...soundAlikes('n-ny', 'cana canya'),
      ...soundAlikes('stress', 'papa papa-tilde'),
      ...soundAlikes('stress', 'hablo hablo-tilde'),
      ...soundAlikes('stress', 'sabana sabana-tilde'),
      ...soundAlikes('stress', 'esta esta-tilde'),
    ],

    stressPractice: Words.list('cafe sofa lapiz arbol reloj ciudad doctor hospital animal chocolate aguacate tomate telefono musica platano computadora'),

    // What every game says when a whole level is right (shared/game.js plays
    // it from here, as CHEER).
    praise: Words.list('excelente muy-bien'),
  });

  // Derived, for the learn page and Sound Match:
  //   vocab.withContrast(contrast)  every sound-alike told apart by it
  //   vocab.familyOf(entry)         the entry's family, itself included
  const everyEntry = Object.values(Units.byId(vocab));
  vocab.withContrast = contrast => everyEntry.filter(entry => entry.contrast === contrast);
  vocab.familyOf = entry => everyEntry.filter(other => other.family === entry.family);
})();
