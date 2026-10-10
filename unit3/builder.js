/* Unit 3 · Question Builder: build sentences and questions from word tiles (shared/tiles.js), and answer questions about a picture. On shared/game.js. */
(function () {
  const V = window.VOCAB;
  const { el, esc, es, pick, shuffle, imgSrc } = Core;
  const tiles = (pool, decoys) => Tiles.round({ pool, vocab: V, decoys });

  // Answer Back: a picture of a woman at work and a question about her.
  // Answer "Sí, es ...", or "No, es ..." and what she is.
  const JOBS = V.jobQuestions.map(question => question.job);
  function answerBack(stage, ctx) {
    const question = ctx.draw(V.jobQuestions);
    const otherJobs = JOBS.filter(job => job !== question.job);
    const shownJob = Math.random() < 0.5 ? question.job : pick(otherJobs, 1)[0];
    const answerFor = job => (job === question.job ? V.jobYes : V.jobNo).find(answer => answer.job === job);
    const right = answerFor(shownJob);
    const shown = V.people.find(person => person.id === shownJob);

    const picture = el('img', 'prompt-pic');
    picture.src = imgSrc(shown);
    picture.alt = shown.english;
    const askIt = () => ctx.play(question);
    const bubble = Core.speech('▶', `${es(question.spanish)}<br>Look at the picture. What do you answer?`, askIt);
    const choices = Game.choose(ctx, right, shuffle(JOBS.map(answerFor)), option => es(option.spanish));
    Game.playOnReveal(ctx, right);
    ctx.answer = `${es(question.spanish)} ${es(right.spanish)}: ${esc(right.english)}`;
    stage.replaceChildren(picture, bubble, choices);
    return askIt();
  }

  const everySentence = [...V.statements, ...V.negatives, ...V.questions, ...V.questionWords, ...V.answers];

  Game.init({
    root: document.getElementById('game'),
    key: 'u3-builder',
    intro: `<strong>How to play:</strong> read the English and tap the words in the right order, then press Check.
      Some tiles don't belong. Watch the verb: ${es('soy')}, ${es('eres')}, ${es('es')}, ${es('somos')} or ${es('son')}?`,
    levels: [
      { id: 'ser', name: 'Soy, eres, es', blurb: 'Say who people are and where they\'re from.', rounds: 8, time: 0,
        round: tiles(V.statements, ['soy', 'eres', 'es', 'somos', 'son']) },
      { id: 'no', name: 'No', blurb: 'Say who people aren\'t.', rounds: 6, time: 0,
        round: tiles(V.negatives, ['si-tilde', 'tambien', 'es', 'soy']) },
      { id: 'questions', name: 'Yes or no?', blurb: 'The same words, asked.', rounds: 6, time: 0,
        round: tiles(V.questions, ['usted', 'tu-tilde', 'no', 'soy']) },
      { id: 'question-words', name: 'Who, how, where?', blurb: 'Quién, cómo and dónde go first.', rounds: 6, time: 0,
        round: tiles(V.questionWords, ['quien', 'que-tilde', 'como-tilde', 'donde-tilde']) },
      { id: 'answer', name: 'Answer back', blurb: 'Hear a question about the picture. Sí or no?', rounds: 8, time: 0,
        round: answerBack },
      { id: 'rush', name: 'Rush', blurb: 'Every kind of sentence, 25 seconds each.', rounds: 10, time: 25,
        round: tiles(everySentence, ['soy', 'es', 'son', 'no', 'quien', 'de']) },
    ],
  });
})();
