/*
 * stress.js — Stress Detective: hear a word or phrase and tap the stressed
 * syllable of one of its words. Any unit can use it. Syllables and the
 * stressed one come from shared/spanish.js, never typed. Needs core.js,
 * audio.js, game.js, spanish.js.
 *
 *   Stress.init({
 *     root, key,     as for Game.init
 *     levels: [{ id, name, blurb, pool, rounds?, time?, showWord? }]
 *                    pool: questions from Stress.questionsIn(entries);
 *                    showWord: false hides the spelling, so the learner
 *                    hears only (the syllables still show, without accent
 *                    marks, which would give the answer away). Use it with
 *                    one-word entries only: in a phrase, the spelling is
 *                    what says which word is asked about
 *   })
 *   Stress.questionsIn(entries)  [{ id, entry, word, syllables }]: one
 *                                question for each word of two or more
 *                                syllables in each entry ("Buenos días" asks
 *                                about buenos and días), in entry order
 *   Stress.marked(word)          HTML: the word with its stressed syllable
 *                                in <strong>, syllables split by "·". Needs
 *                                only core.js and spanish.js, so learn pages
 *                                use it too
 */
(function () {
  const { el, esc, es } = Core;

  const wordsOf = text => text.split(/\s+/).map(word => word.replace(/[^\p{L}]/gu, '')).filter(Boolean);

  // Each word once, however it is capitalised: the first spelling wins.
  function distinctWords(words) {
    const seen = new Set();
    return words.filter(word => !seen.has(word.toLowerCase()) && seen.add(word.toLowerCase()));
  }

  function questionsIn(entries) {
    return entries.flatMap(entry => distinctWords(wordsOf(entry.spanish))
      .map(word => ({ id: `${entry.id}:${word}`, entry, word, syllables: Spanish.syllables(word).length }))
      .filter(question => question.syllables > 1));
  }

  function marked(word) {
    const stressed = Spanish.stressedSyllable(word);
    return `<span class="es" lang="es-MX">${Spanish.syllables(word)
      .map((syllable, index) => index === stressed ? `<strong>${esc(syllable)}</strong>` : esc(syllable)).join('·')}</span>`;
  }

  const withoutAccents = text => text.normalize('NFD').replace(/́/g, '').normalize('NFC');

  // The entry's Spanish with the asked-about word underlined.
  const phraseWithTarget = (spanish, word) => es(spanish).replace(new RegExp(`(?<!\\p{L})${word}(?!\\p{L})`, 'u'), `<u>${word}</u>`);

  const round = ({ pool, showWord = true }) => (stage, ctx) => {
    const { entry, word } = ctx.draw(pool);
    const sayIt = () => ctx.play(entry);
    const syllables = Spanish.syllables(word);
    const stressed = Spanish.stressedSyllable(word);
    const isPhrase = !Spanish.isOneWord(entry.spanish);

    const question = isPhrase ? `Which syllable of <strong>${es(word)}</strong> is stressed?` : 'Which syllable is stressed?';
    const shownSpanish = isPhrase ? phraseWithTarget(entry.spanish, word) : es(entry.spanish);
    const prompt = showWord ? `${shownSpanish} ${esc(entry.english)}<br>${question}` : `${esc(entry.english)}<br>${question}`;
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

    ctx.answer = `${marked(word)}${isPhrase ? `, in ${es(entry.spanish)}` : ''}: ${esc(entry.english)}.`;
    ctx.reveal = () => syllableRow.querySelector(`[data-index="${stressed}"]`).classList.add('right');
    stage.replaceChildren(bubble, syllableRow);
    return sayIt();
  };

  function init({ root, key, levels }) {
    Game.init({
      root,
      key,
      intro: `<strong>How to play:</strong> listen and tap the syllable said loudest and longest.
        <br><strong>The rule:</strong> a word ending in a vowel, <em>n</em> or <em>s</em> is stressed on the second to last
        syllable (${marked('casa')}, ${marked('examen')}); any other word on the last (${marked('reloj')}).
        An accent mark beats the rule (${marked('café')}, ${marked('árbol')}).`,
      levels: levels.map(level => ({ rounds: 8, time: 0, ...level, round: round(level) })),
    });
  }

  window.Stress = { init, questionsIn, marked };
})();
