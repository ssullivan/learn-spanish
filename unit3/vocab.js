/*
 * Unit 3 vocabulary, for its pages, tools/tts.mjs and tools/check.mjs: the
 * words it uses, from the dictionary (words/words.js; the ones it teaches
 * are under unit 3 there, with their audio and pictures in words/), and the
 * sentences it builds from them (audio/<id>.mp3 here).
 *
 * Sentences are derived from the words, never typed out (Units.sentences):
 * each keeps its word ids in `words`, which Question Builder turns into
 * tiles. A sentence a man says (Yo soy maestro) has `voice: MAN`; the unit's
 * voice is a woman's. tools/grammar.test.mjs checks that every sentence's
 * subject and verb agree, and that a person is called by a word of their
 * gender (the speaker's from the voice).
 */
Units.add(3, {
  voice: 'es-MX-DaliaNeural',

  pronouns: Words.list('yo tu-tilde usted el-tilde ella nosotros ustedes ellos'),

  ser: Words.list('soy eres es somos son'),

  // Jobs and nationalities: -o for a man, -a for a woman
  people: [
    ...Words.list('estudiante maestro maestra'),
    Words.get('doctor'),
    ...Words.list('doctora amigo amiga mexicano mexicana'),
  ],

  places: Words.list('mexico estados-unidos canada'),

  names: Words.list('ana luis me-llamo te-llamas se-llama'),

  asking: Words.list('quien que-tilde como-tilde donde-tilde de'),

  more: [
    ...Words.list('si-tilde no tambien hablas espanyol ingles un-poco'),
    Words.get('hablo'),
  ],
});

// Derived: sentences made of the words above. The sets are named by what
// Question Builder practises with them.
(vocab => {
  const say = Units.sentences(vocab);
  const MAN = { voice: 'es-MX-JorgeNeural' };

  // Who people are, and where they're from: subject + ser + ...
  vocab.statements = [
    say('yo soy estudiante', 'I am a student.'),
    say('ella es maestra', 'She is a teacher.'),
    say('el-tilde es doctor', 'He is a doctor.'),
    say('yo soy maestro', 'I am a teacher.', { ...MAN, note: 'A man says maestro; a woman, maestra.' }),
    say('usted es doctora', 'You are a doctor.', { note: 'Usted takes es, like él and ella.' }),
    say('el-tilde es mexicano', 'He is Mexican.'),
    say('ella es mexicana', 'She is Mexican.'),
    say('nosotros somos de mexico', 'We are from Mexico.'),
    say('ellos son de canada', 'They are from Canada.'),
    say('ustedes son de estados-unidos', 'You (all) are from the United States.'),
    say('tu-tilde eres amiga', 'You are a friend.', { note: 'Said to a woman; to a man, amigo.' }),
    say('yo tambien soy estudiante', 'I am a student too.'),
    say('soy de mexico', 'I am from Mexico.', { note: 'Soy can only mean "I am", so yo can be left out.' }),
  ];

  // No goes right before the verb.
  vocab.negatives = [
    say('yo no soy maestra', 'I am not a teacher.'),
    say('el-tilde no es mexicano', 'He is not Mexican.'),
    say('ella no es doctora', 'She is not a doctor.'),
    say('no somos de canada', 'We are not from Canada.'),
    say('no hablo ingles', 'I don\'t speak English.'),
  ];

  // A yes/no question has the same words as the sentence: only the voice
  // (and the ¿ ?) rises.
  vocab.questions = [
    say('tu-tilde eres estudiante', 'Are you a student?'),
    say('eres estudiante', 'Are you a student?', { note: 'Without tú: eres already says "you".' }),
    say('usted es de mexico', 'Are you from Mexico?', { note: 'To someone you call usted.' }),
    say('eres de mexico', 'Are you from Mexico?', { note: 'To a friend.' }),
    say('hablas espanyol', 'Do you speak Spanish?'),
    say('el-tilde es mexicano', 'Is he Mexican?'),
  ];

  // Question words come first: ¿Quién es él? Él es Luis.
  vocab.questionWords = [
    say('quien es el-tilde', 'Who is he?'),
    say('quien es ana', 'Who is Ana?'),
    say('como-tilde te-llamas', 'What is your name?', { note: 'To a friend: literally "how do you call yourself?"' }),
    say('como-tilde se-llama usted', 'What is your name? (usted)'),
    say('de donde-tilde eres', 'Where are you from?', { note: 'To a friend. De comes first: "from where are you?"' }),
    say('de donde-tilde es usted', 'Where are you from? (usted)'),
  ];

  vocab.answers = [
    say('me-llamo ana', 'My name is Ana.'),
    say('me-llamo luis', 'My name is Luis.', MAN),
    say('si-tilde, soy estudiante', 'Yes, I am a student.'),
    say('no, no soy maestra', 'No, I am not a teacher.', { note: 'Two noes: one answers, one says "not".' }),
    say('hablo un-poco de espanyol', 'I speak a little Spanish.'),
  ];

  // Answer Back: a picture of a woman at work, a question about her, and
  // the answers. Built from these jobs, so every question has its answers.
  const JOBS = ['estudiante', 'maestra', 'doctora'];
  const jobInEnglish = job => Words.get(job).english.replace(/ \(a woman\)$/, '');
  vocab.jobQuestions = JOBS.map(job => say(`ella es ${job}`, `Is she a ${jobInEnglish(job)}?`, { job }));
  vocab.jobYes = JOBS.map(job => say(`si-tilde, es ${job}`, `Yes, she is a ${jobInEnglish(job)}.`, { job }));
  vocab.jobNo = JOBS.map(job => say(`no, es ${job}`, `No, she is a ${jobInEnglish(job)}.`, { job }));
})(window.VOCAB);
