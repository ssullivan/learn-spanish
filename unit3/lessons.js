/* Unit 3 learn page: the steps shown by shared/learn.js. Words and sentences come from vocab.js. */
(function () {
  const V = window.VOCAB;
  const { p, tip } = Learn;
  const { el, esc, es } = Core;

  // Each pronoun beside the form of ser that goes with it (same person).
  const serTable = () => el('table', 'rule-table', `<thead><tr><th>Who</th><th>Ser</th><th>Meaning</th></tr></thead><tbody>${V.pronouns
    .map(pronoun => [pronoun, V.ser.find(form => form.person === pronoun.person)])
    .map(([pronoun, form]) => `<tr><td>${es(pronoun.spanish)}</td><td>${es(form.spanish)}</td><td>${esc(form.english)}</td></tr>`)
    .join('')}</tbody>`);

  const listenTo = (ctx, pool, rounds) => {
    const quiz = el('div');
    ctx.listenQuiz(quiz, { pool, rounds, choices: 4, show: 'text' });
    return quiz;
  };

  Learn.init({
    root: document.getElementById('learn'),
    key: 'u3-learn',
    vocab: V,
    steps: [
      {
        id: 'pronouns',
        title: 'I, you, he, she',
        render(element, ctx) {
          element.append(
            p(`In each picture the speaker, in red, points at who is meant. Remember from Unit 2: ${es('tú')} for a friend, ${es('usted')} to be polite.`),
            ctx.grid(V.pronouns),
          );
        },
      },
      {
        id: 'pronoun-quiz',
        title: 'Who is it?',
        gate: true,
        render(element, ctx) {
          const quiz = el('div');
          element.append(p('Listen, then tap the picture.'), quiz);
          ctx.listenQuiz(quiz, { pool: V.pronouns, rounds: 8, choices: 4 });
        },
      },
      {
        id: 'ser',
        title: 'Soy, eres, es: to be',
        render(element, ctx) {
          element.append(
            p(`${es('Ser')} says who or what someone is, and where they're from. Each person has its own form.`),
            serTable(),
            ctx.grid(V.statements.slice(0, 3).concat(V.statements.slice(7, 10))),
            tip(`<strong>No "a":</strong> Spanish says ${es('Soy estudiante')}, "I am student", for jobs.`),
          );
        },
      },
      {
        id: 'leave-it-out',
        title: 'Leave out the pronoun',
        render(element, ctx) {
          element.append(
            p(`${es('Soy')} can only mean "I am", so Spanish usually leaves ${es('yo')} out. Add the pronoun to stress it, or when ${es('es')} could mean he, she or you.`),
            ctx.words('soy-de-mexico', 'yo-tambien-soy-estudiante'),
          );
        },
      },
      {
        id: 'gender',
        title: 'Maestro or maestra?',
        render(element, ctx) {
          element.append(
            p(`Words for people end in ${es('-o')} for a man and ${es('-a')} for a woman. Words ending in ${es('-e')}, like ${es('estudiante')}, stay the same.`),
            ctx.words('maestro', 'maestra', 'amigo', 'amiga', 'mexicano', 'mexicana', 'estudiante'),
            p('So a man and a woman say it differently:'),
            ctx.words('yo-soy-maestro', 'yo-no-soy-maestra'),
          );
        },
      },
      {
        id: 'no',
        title: 'No',
        render(element, ctx) {
          element.append(
            p(`To say "not", put ${es('no')} right before the verb. Answering no takes two: one answers, one says "not".`),
            ctx.grid([...V.negatives, ctx.entry('no-no-soy-maestra')]),
          );
        },
      },
      {
        id: 'questions',
        title: 'Yes or no?',
        render(element, ctx) {
          element.append(
            p(`A yes/no question uses the same words as the sentence. Your voice rises at the end, and the written question opens with ${es('¿')}.`),
            ctx.grid(V.questions),
            tip(`<strong>Listen to the end</strong> of each one: ${es('¿Eres estudiante?')} climbs; ${es('Soy estudiante.')} falls.`),
          );
        },
      },
      {
        id: 'question-words',
        title: 'Who, how, where?',
        render(element, ctx) {
          element.append(
            p(`Question words go first and carry an accent mark: ${es('quién')}, ${es('cómo')}, ${es('dónde')}. Ask a name with ${es('¿Cómo te llamas?')}, "how do you call yourself?"`),
            ctx.grid(V.questionWords),
            ctx.grid(V.answers),
          );
        },
      },
      {
        id: 'sentence-quiz',
        title: 'Which sentence?',
        gate: true,
        render(element, ctx) {
          element.append(
            p('Listen, then tap the sentence you hear. Watch for statement or question.'),
            listenTo(ctx, [...V.statements, ...V.negatives, ...V.questions, ...V.questionWords], 10),
          );
        },
      },
      {
        id: 'done',
        title: '¡Muy bien! Well done',
        render(element) {
          element.append(
            p('You can say who you are and ask about others. Now build sentences in <a href="builder.html">Question Builder</a>, and check your stress with <a href="stress.html">Stress Detective</a>.'),
            p('Use the numbered steps above to review any section, or <a href="./">go back to Unit 3</a>.'),
          );
        },
      },
    ],
  });
})();
