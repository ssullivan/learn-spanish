/*
 * stress.js — Stress Detective: hear a word and tap its stressed syllable.
 * Any unit can use it. Syllables and the stressed one come from
 * shared/spanish.js, never typed. Needs core.js, audio.js, game.js,
 * spanish.js.
 *
 *   Stress.init({
 *     root, key,     as for Game.init
 *     levels: [{ id, name, blurb, pool, rounds?, time?, showWord? }]
 *                    pool: entries with audio (one word each, two or more
 *                    syllables; Stress.wordsIn(entries) picks those);
 *                    showWord: false hides the spelling, so the learner
 *                    hears only (the syllables still show, without accent
 *                    marks, which would give the answer away)
 *   })
 *   Stress.wordsIn(entries)      the entries Stress Detective can ask about
 *   Stress.marked(word)          HTML: the word with its stressed syllable
 *                                in <strong>, syllables split by "·". Needs
 *                                only core.js and spanish.js, so learn pages
 *                                use it too
 */
(function () {
  const { el, esc, es } = Core;

  const wordsIn = entries => entries.filter(entry => Spanish.isOneWord(entry.spanish) && Spanish.syllables(entry.spanish).length > 1);

  function marked(word) {
    const stressed = Spanish.stressedSyllable(word);
    return `<span class="es" lang="es-MX">${Spanish.syllables(word)
      .map((syllable, index) => index === stressed ? `<strong>${esc(syllable)}</strong>` : esc(syllable)).join('·')}</span>`;
  }

  const withoutAccents = text => text.normalize('NFD').replace(/[́]/g, '').normalize('NFC');

  const round = ({ pool, showWord = true }) => (stage, ctx) => {
    const entry = ctx.draw(pool);
    const sayIt = () => ctx.play(entry);
    const syllables = Spanish.syllables(entry.spanish);
    const stressed = Spanish.stressedSyllable(entry.spanish);

    const prompt = showWord
      ? `${es(entry.spanish)} ${esc(entry.english)}<br>Which syllable is stressed?`
      : `${esc(entry.english)}<br>Which syllable is stressed?`;
    const bubble = Core.speech('▶', prompt, sayIt);

    const syllableRow = el('div', 'syllable-row');
    syllables.forEach((syllable, index) => {
      const choice = el('button', 'choice syllable', es(showWord ? syllable : withoutAccents(syllable)));
      choice.type = 'button';
      choice.dataset.index = index;
      choice.addEventListener('click', () => {
        if (index !== stressed) choice.classList.add('wrong');
        ctx.done(index === stressed);
      });
      syllableRow.append(choice);
    });

    ctx.answer = `${marked(entry.spanish)}: ${esc(entry.english)}.`;
    ctx.reveal = () => syllableRow.querySelector(`[data-index="${stressed}"]`).classList.add('right');
    stage.replaceChildren(bubble, syllableRow);
    return sayIt();
  };

  function init({ root, key, levels }) {
    Game.init({
      root,
      key,
      intro: `<strong>How to play:</strong> listen to the word and tap the syllable said loudest and longest.
        <br><strong>The rule:</strong> a word ending in a vowel, <em>n</em> or <em>s</em> is stressed on the second to last
        syllable (${marked('casa')}, ${marked('examen')}); any other word on the last (${marked('reloj')}).
        An accent mark beats the rule (${marked('café')}, ${marked('árbol')}).`,
      levels: levels.map(level => ({ rounds: 8, time: 0, ...level, round: round(level) })),
    });
  }

  window.Stress = { init, wordsIn, marked };
})();
