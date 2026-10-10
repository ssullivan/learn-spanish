/* Unit 1 · Sound Match: hear a word, pick its spelling from its sound-alikes. On shared/game.js. */
(function () {
  const V = window.VOCAB;
  const { es, shuffle } = Core;

  const round = pool => (stage, ctx) => {
    const heard = ctx.draw(pool);
    const sayIt = () => ctx.play(heard);
    const bubble = Core.speech('▶', 'Which word do you hear?', sayIt);
    const choices = Game.choose(ctx, heard, shuffle(V.familyOf(heard)), option => es(option.spanish));
    ctx.answer = Game.answerText(heard);
    stage.replaceChildren(bubble, choices);
    return sayIt();
  };

  const level = (id, name, blurb, pool, settings = {}) => ({ id, name, blurb, rounds: 8, time: 0, ...settings, round: round(pool) });

  Game.init({
    root: document.getElementById('game'),
    key: 'u1-match',
    intro: `<strong>How to play:</strong> listen to the word, then tap how it's spelled. Every choice sounds almost the same:
      listen for the vowel, a tapped ${es('r')} or a trilled ${es('rr')}, ${es('n')} or ${es('ñ')}, and which syllable is loudest.`,
    levels: [
      level('vowels', 'Vowels', 'Peso, piso or paso?', V.withContrast('vowel')),
      level('r-rr', 'R or rr', 'Pero or perro? Caro or carro?', V.withContrast('r-rr')),
      level('n-ny', 'N or ñ', 'Una or uña? Mono or moño?', V.withContrast('n-ny')),
      level('stress', 'Accent marks', 'Papa or papá? Esta or está?', V.withContrast('stress')),
      level('all', 'Against the clock', 'All of them, eight seconds each.', Core.entries(V).filter(entry => entry.contrast), { rounds: 12, time: 8 }),
    ],
  });
})();
